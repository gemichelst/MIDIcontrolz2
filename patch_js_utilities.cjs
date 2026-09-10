const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const utilitiesJs = `
// ============================================================
//  UTILITIES & SCALE QUANTIZER
// ============================================================

const SCALES = {
  none: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonic_maj: [0, 2, 4, 7, 9],
  pentatonic_min: [0, 3, 5, 7, 10]
};

function quantizeNote(note) {
  const rootSelect = document.getElementById('vk-scale-root');
  const typeSelect = document.getElementById('vk-scale-type');
  if (!rootSelect || !typeSelect) return note;
  
  const type = typeSelect.value;
  if (type === 'none') return note;
  
  const root = parseInt(rootSelect.value);
  const scale = SCALES[type];
  
  const octave = Math.floor(note / 12);
  const noteClass = note % 12;
  
  // Find closest note in scale
  let minDiff = 99;
  let bestNoteClass = noteClass;
  
  for (let i = 0; i < scale.length; i++) {
    const scaleNote = (root + scale[i]) % 12;
    // Calculate shortest distance on a circle of 12
    let diff = Math.abs(noteClass - scaleNote);
    if (diff > 6) diff = 12 - diff;
    
    if (diff < minDiff) {
      minDiff = diff;
      bestNoteClass = scaleNote;
    }
  }
  
  // Reconstruct quantized note
  // If we wrapped around an octave (e.g. C to B below), adjust octave.
  let qNote = (octave * 12) + bestNoteClass;
  // If the quantized note is radically different because of octave boundaries, fix it.
  if (Math.abs(qNote - note) > 6) {
    if (qNote > note) qNote -= 12;
    else qNote += 12;
  }
  
  return Math.min(127, Math.max(0, qNote));
}

// Update the vkSendNoteOn/vkSendNoteOff to use quantization
const originalVkSendNoteOn = window.vkSendNoteOn;
window.vkSendNoteOn = function(note) {
  const qNote = quantizeNote(note);
  if (State.midiOut) {
    const vel = parseInt(document.getElementById('vk-velocity').value);
    const p = getActiveDev()?.defaultPresets[State.activePresetIndex];
    const ch = p ? p.channel || 0 : 0;
    sendMidiOut([0x90 | ch, qNote, applyVelocityCurve ? applyVelocityCurve(vel) : vel]);
    highlightKey(note, true); // highlight original visual key
  }
};

window.vkSendNoteOff = function(note) {
  const qNote = quantizeNote(note);
  if (State.midiOut && activeKeys.has(note)) {
    const p = getActiveDev()?.defaultPresets[State.activePresetIndex];
    const ch = p ? p.channel || 0 : 0;
    sendMidiOut([0x80 | ch, qNote, 0]);
    highlightKey(note, false);
  }
};

// CHORD GENERATOR
const CHORD_INTERVALS = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dim: [0, 3, 6]
};

let activeUtilityChords = [];

function playUtilityChordQuick(root, type) {
  playChordRaw(root, type);
}

function playUtilityChord() {
  const root = parseInt(document.getElementById('chord-root').value);
  const type = document.getElementById('chord-type').value;
  playChordRaw(root, type);
}

function playChordRaw(root, type) {
  if (!State.midiOut) return toast('No MIDI Out connected', 'error');
  const intervals = CHORD_INTERVALS[type];
  const notes = intervals.map(i => root + i);
  const ch = 0; // Default to ch 1
  notes.forEach(n => {
    if (n <= 127) {
      sendMidiOut([0x90 | ch, n, 100]);
      activeUtilityChords.push({note: n, ch});
    }
  });
}

function stopUtilityChord() {
  stopAllChords();
}

function stopAllChords() {
  activeUtilityChords.forEach(c => {
    sendMidiOut([0x80 | c.ch, c.note, 0]);
  });
  activeUtilityChords = [];
}

// MIDI CLOCK
window.internalClockTimer = null;
window.internalClockBpm = 120;

function updateInternalClockBPM(val) {
  window.internalClockBpm = parseInt(val);
  document.getElementById('clock-bpm-val').textContent = window.internalClockBpm;
  if (window.internalClockTimer) {
    toggleInternalClock(); 
    toggleInternalClock();
  }
}

function toggleInternalClock() {
  const btn = document.getElementById('btn-clock-toggle');
  if (window.internalClockTimer) {
    clearInterval(window.internalClockTimer);
    window.internalClockTimer = null;
    btn.textContent = 'Start Clock';
    btn.classList.remove('danger');
    btn.classList.add('primary');
  } else {
    // MIDI clock is 24 PPQN (Pulses Per Quarter Note)
    const msPerBeat = 60000 / window.internalClockBpm;
    const msPerPulse = msPerBeat / 24;
    
    sendMidiOut([0xFA]); // Start
    window.internalClockTimer = setInterval(() => {
      sendMidiOut([0xF8]); // Clock
    }, msPerPulse);
    
    btn.textContent = 'Stop Clock';
    btn.classList.remove('primary');
    btn.classList.add('danger');
  }
}

// LFO GENERATOR
window.lfoTimer = null;
window.lfoPhase = 0;

function toggleLFO() {
  const btn = document.getElementById('btn-lfo-toggle');
  if (window.lfoTimer) {
    cancelAnimationFrame(window.lfoTimer);
    window.lfoTimer = null;
    btn.textContent = 'Start LFO';
    btn.classList.remove('danger');
    btn.classList.add('primary');
    document.getElementById('lfo-visualizer').style.width = '0%';
  } else {
    window.lfoLastTime = performance.now();
    window.lfoPhase = 0;
    lfoTick(performance.now());
    btn.textContent = 'Stop LFO';
    btn.classList.remove('primary');
    btn.classList.add('danger');
  }
}

function lfoTick(time) {
  if (!window.lfoTimer && document.getElementById('btn-lfo-toggle').textContent === 'Stop LFO') {
     // Safety catch for React-like unmounts, though we use vanilla
  }
  
  const dt = time - window.lfoLastTime;
  window.lfoLastTime = time;
  
  const speed = parseFloat(document.getElementById('lfo-speed').value) || 1.0;
  const cc = parseInt(document.getElementById('lfo-cc').value) || 74;
  
  // dt is in ms. speed is Hz. 
  window.lfoPhase += (speed * (dt / 1000.0)) * Math.PI * 2;
  
  // sine wave -1 to 1 -> 0 to 1 -> 0 to 127
  const val01 = (Math.sin(window.lfoPhase) + 1) / 2;
  const ccVal = Math.round(val01 * 127);
  
  if (State.midiOut) {
    sendMidiOut([0xB0, cc, ccVal]);
  }
  
  const vis = document.getElementById('lfo-visualizer');
  if (vis) vis.style.width = (val01 * 100) + '%';
  
  window.lfoTimer = requestAnimationFrame(lfoTick);
}

// LATENCY TESTER (Loopback)
window.latencyTestActive = false;
window.latencyTestStart = 0;

function runLatencyTest() {
  if (!State.midiIn || !State.midiOut) {
    toast('Please connect both MIDI In and MIDI Out to run loopback test', 'error');
    return;
  }
  
  const res = document.getElementById('latency-results');
  res.innerHTML = 'Testing... (Ensure MIDI Out is cabled directly to MIDI In)';
  
  window.latencyTestActive = true;
  window.latencyTestStart = performance.now();
  
  // Send a specific CC sequence that we can uniquely identify
  // Let's send CC 111 with value 111
  sendMidiOut([0xB0, 111, 111]);
  
  setTimeout(() => {
    if (window.latencyTestActive) {
      window.latencyTestActive = false;
      res.innerHTML = '<span style="color:#ef4444;">Timeout. No loopback detected. Is the cable connected?</span>';
    }
  }, 1000);
}

// Hook loopback detect into onMidiMessage
const origMidiMsgUtils = window.onMidiMessage;
window.onMidiMessage = function(event) {
  const data = event.data;
  
  if (window.latencyTestActive && data[0] === 0xB0 && data[1] === 111 && data[2] === 111) {
    const ms = (performance.now() - window.latencyTestStart).toFixed(2);
    document.getElementById('latency-results').innerHTML = \`Loopback successful! Latency: <strong>\${ms} ms</strong>\`;
    window.latencyTestActive = false;
    return; // consume it
  }
  
  origMidiMsgUtils(event);
};

`;

code += '\n' + utilitiesJs;

// Now we need to remove the inline definitions of vkSendNoteOn and vkSendNoteOff 
// from midicontrols.v4.js if they exist, or just rely on the window. override.
// Actually, earlier they were defined globally. Let's make sure the window overrides work.
// Midicontrols.v4.js has `function vkSendNoteOn(note) { ... }`. Since we appended this to the bottom,
// function hoisting means the original function declaration is hoisted, and our assignment to window.vkSendNoteOn
// might be shadowed if the HTML calls `vkSendNoteOn(note)`. 
// Because HTML uses `onmousedown="vkSendNoteOn(note)"`, it will call the global one.
// Let's replace the actual string in the file for safety.

code = code.replace(/function vkSendNoteOn\(note\) \{[\s\S]*?highlightKey\(note, true\);\s*\}/, `window.vkSendNoteOn = function(note) { /* Replaced by utilities wrapper */ }`);
code = code.replace(/function vkSendNoteOff\(note\) \{[\s\S]*?highlightKey\(note, false\);\s*\}/, `window.vkSendNoteOff = function(note) { /* Replaced by utilities wrapper */ }`);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched js utilities');
