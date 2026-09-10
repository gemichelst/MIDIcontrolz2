const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const utilsLogic = `
// ============================================================
//  MIDI RECORDER
// ============================================================
window.midiRecorder = {
  isRecording: false,
  isPlaying: false,
  startTime: 0,
  events: [], // { offset: ms, data: [bytes] }
  timers: []
};

window.toggleMidiRecord = function() {
  const r = window.midiRecorder;
  if (r.isRecording) {
    r.isRecording = false;
    document.getElementById('btn-recorder-rec').textContent = '🔴 Record';
    document.getElementById('btn-recorder-rec').classList.remove('danger');
    document.getElementById('recorder-status').textContent = 'Stopped';
  } else {
    // Stop playback if running
    if (r.isPlaying) window.toggleMidiPlayback();
    
    r.events = [];
    r.isRecording = true;
    r.startTime = performance.now();
    document.getElementById('btn-recorder-rec').textContent = '⏹ Stop Rec';
    document.getElementById('btn-recorder-rec').classList.add('danger');
    document.getElementById('recorder-status').textContent = 'Recording...';
    document.getElementById('recorder-count').textContent = '0';
  }
};

window.clearMidiRecord = function() {
  const r = window.midiRecorder;
  if (r.isRecording) window.toggleMidiRecord();
  if (r.isPlaying) window.toggleMidiPlayback();
  r.events = [];
  document.getElementById('recorder-count').textContent = '0';
  document.getElementById('recorder-status').textContent = 'Cleared';
};

window.toggleMidiPlayback = function() {
  const r = window.midiRecorder;
  if (r.isRecording) window.toggleMidiRecord();
  
  if (r.isPlaying) {
    r.isPlaying = false;
    r.timers.forEach(t => clearTimeout(t));
    r.timers = [];
    document.getElementById('btn-recorder-play').textContent = '▶ Play';
    document.getElementById('btn-recorder-play').classList.remove('primary');
    document.getElementById('recorder-status').textContent = 'Stopped';
  } else {
    if (r.events.length === 0) return toast('No events to play', 'error');
    r.isPlaying = true;
    document.getElementById('btn-recorder-play').textContent = '⏹ Stop Play';
    document.getElementById('btn-recorder-play').classList.add('primary');
    document.getElementById('recorder-status').textContent = 'Playing...';
    
    // Schedule all events
    r.events.forEach(ev => {
      const t = setTimeout(() => {
        if (State.midiOut) sendMidiOut(ev.data);
      }, ev.offset);
      r.timers.push(t);
    });
    
    // Auto-stop when done
    const maxOffset = Math.max(...r.events.map(e => e.offset));
    const t = setTimeout(() => {
      if (window.midiRecorder.isPlaying) window.toggleMidiPlayback();
    }, maxOffset + 100);
    r.timers.push(t);
  }
};

// ============================================================
//  CHORD MEMORY
// ============================================================
window.chordMemory = {
  active: false,
  triggerNote: null,
  chordNotes: [],
  learnState: 'idle' // 'idle', 'trigger', 'chord'
};

window.toggleChordMemory = function() {
  window.chordMemory.active = !window.chordMemory.active;
  const btn = document.getElementById('btn-cm-active');
  btn.textContent = window.chordMemory.active ? 'Enable: ON' : 'Enable: OFF';
  btn.classList.toggle('primary', window.chordMemory.active);
  if (!window.chordMemory.active) window.chordMemory.learnState = 'idle';
};

window.learnCmTrigger = function() {
  window.chordMemory.learnState = 'trigger';
  toast('Play a note to set as trigger', 'info');
};

window.learnCmChord = function() {
  window.chordMemory.learnState = 'chord';
  window.chordMemory.chordNotes = [];
  toast('Play notes to build the chord. Stop playing when done.', 'info');
};

// Modify onMidiMessage to hook into these tools
const origMidiProcess = window.onMidiMessage;
window.onMidiMessage = function(event) {
  const data = event.data;
  const type = data[0] >> 4;
  const ch = data[0] & 0x0F;
  
  // 1. MIDI Recorder Hook
  if (window.midiRecorder && window.midiRecorder.isRecording) {
    window.midiRecorder.events.push({
      offset: performance.now() - window.midiRecorder.startTime,
      data: Array.from(data)
    });
    const countEl = document.getElementById('recorder-count');
    if (countEl) countEl.textContent = window.midiRecorder.events.length;
  }
  
  // 2. Chord Memory Hook
  if (window.chordMemory) {
    if (type === 0x9 && data[2] > 0) { // Note On
      const note = data[1];
      
      if (window.chordMemory.learnState === 'trigger') {
        window.chordMemory.triggerNote = note;
        document.getElementById('cm-trigger-note').textContent = noteName(note) + ' (' + note + ')';
        window.chordMemory.learnState = 'idle';
        toast('Trigger note learned', 'success');
        return; // Consume
      }
      
      if (window.chordMemory.learnState === 'chord') {
        if (!window.chordMemory.chordNotes.includes(note)) {
          window.chordMemory.chordNotes.push(note);
          document.getElementById('cm-chord-notes').textContent = window.chordMemory.chordNotes.map(n => noteName(n)).join(', ');
        }
        return; // Consume
      }
      
      if (window.chordMemory.active && window.chordMemory.triggerNote === note) {
        // Play the chord instead
        window.chordMemory.chordNotes.forEach(n => {
          if (State.midiOut) sendMidiOut([0x90 | ch, n, data[2]]);
        });
        return; // Consume original note
      }
    }
    
    if (type === 0x8 || (type === 0x9 && data[2] === 0)) { // Note Off
      const note = data[1];
      if (window.chordMemory.learnState === 'chord') return; // consume
      
      if (window.chordMemory.active && window.chordMemory.triggerNote === note) {
        // Stop the chord
        window.chordMemory.chordNotes.forEach(n => {
          if (State.midiOut) sendMidiOut([0x80 | ch, n, 0]);
        });
        return; // Consume
      }
    }
  }

  // Fallback to original
  if (origMidiProcess) origMidiProcess(event);
};

`;

code += '\n' + utilsLogic;
fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched utilities js');
