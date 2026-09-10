const fs = require('fs');

let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// 1. sendFactoryReset
js += `\n
window.sendFactoryReset = function() {
  if (!State.midiOut) return toast("No MIDI Out selected", "error");
  // F0 7E 7F 09 01 F7
  sendMidiOut([0xF0, 0x7E, 0x7F, 0x09, 0x01, 0xF7]);
  toast('Factory Reset (All-System-Reset) Sent', 'warning');
};
`;

// 2. SysEx progress bar logic in sendSysexQueue
const fixedSysexQueue = `
async function sendSysexQueue() {
  if (!State.midiOut) return toast("No MIDI Out selected", "error");
  if (sysexQueue.length === 0) return toast("No files queued", "error");
  
  toast(\`Sending \${sysexQueue.length} files...\`, "info");
  
  const pContainer = document.getElementById('sysex-progress-container');
  const pBar = document.getElementById('sysex-progress-bar');
  if (pContainer && pBar) {
    pContainer.style.display = 'block';
    pBar.style.width = '0%';
  }

  for (let i=0; i<sysexQueue.length; i++) {
    const file = sysexQueue[i];
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    sendMidiOut(data);
    
    if (pBar) {
      const pct = Math.round(((i + 1) / sysexQueue.length) * 100);
      pBar.style.width = pct + '%';
    }

    await new Promise(r => setTimeout(r, 200)); // Delay for buffer
  }
  
  if (pContainer) {
    setTimeout(() => { pContainer.style.display = 'none'; }, 1000);
  }

  toast("SysEx Queue sent successfully!", "success");
  sysexQueue = [];
  renderSysexQueue();
}
`;
js = js.replace(/async function sendSysexQueue\(\) \{[\s\S]*?renderSysexQueue\(\);\n\}/, fixedSysexQueue);

// 3. Queue-based sendMidiOut
const fixedSendMidiOut = `
let midiOutQueue = [];
let isFlushingMidi = false;

function flushMidiQueue() {
  if (midiOutQueue.length === 0) {
    isFlushingMidi = false;
    return;
  }
  // take up to 20 messages at once
  const batch = midiOutQueue.splice(0, 20);
  batch.forEach(data => {
    try {
      State.midiOut.send(data);
    } catch(e) {
      console.error('MIDI Send Error:', e);
    }
  });
  if (midiOutQueue.length > 0) {
    setTimeout(flushMidiQueue, 10);
  } else {
    isFlushingMidi = false;
  }
}

function sendMidiOut(data) {
  if (State.midiOut) {
    flashActivity('out');
    midiOutQueue.push(data);
    if (!isFlushingMidi) {
      isFlushingMidi = true;
      flushMidiQueue();
    }
  }
}
`;
js = js.replace(/function sendMidiOut\(data\) \{[\s\S]*?\}\n/m, fixedSendMidiOut);

// 4. Recent CC tracking
js += `\n
let recentCCs = [];
window.trackRecentCC = function(cc, ch) {
  const label = \`CC \${cc} (Ch \${ch+1})\`;
  // remove if exists
  recentCCs = recentCCs.filter(x => x !== label);
  recentCCs.unshift(label);
  if (recentCCs.length > 5) recentCCs.pop();
  
  const container = document.getElementById('recent-cc-monitor');
  if (container) {
    container.innerHTML = recentCCs.map(r => \`
      <span style="background:var(--surface3); border:1px solid var(--border); padding:2px 8px; border-radius:12px; font-size:0.75rem; color:var(--text2); display:inline-block;">
        \${r}
      </span>
    \`).join('');
  }
};
`;
// Call trackRecentCC in onMidiMessage
js = js.replace(/if \(type === 0xB\) \{/g, `if (type === 0xB) {
    if (typeof window.trackRecentCC === 'function') window.trackRecentCC(data[1], ch);`);


fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('patched midicontrols');
