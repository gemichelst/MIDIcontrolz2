const fs = require('fs');

let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Update vkSendNoteOn to read velocity slider
js = js.replace(/State\.midiOut\.send\(\[0x90 \+ ch, note, 100\]\);/g, "const vel = document.getElementById('vk-velocity') ? parseInt(document.getElementById('vk-velocity').value) : 100;\n    State.midiOut.send([0x90 + ch, note, vel]);");

// Add sendMidiOut wrapper function
const sendWrapper = `
function sendMidiOut(data) {
  if (State.midiOut) {
    flashActivity('out');
    State.midiOut.send(data);
  }
}
`;
js = js + '\n' + sendWrapper;

// Replace all State.midiOut.send( with sendMidiOut(
js = js.replace(/State\.midiOut\.send\(/g, 'sendMidiOut(');
// Note: Some places checked if(State.midiOut) State.midiOut.send(data), which becomes if(State.midiOut) sendMidiOut(data). 
// That's fine since sendMidiOut also checks State.midiOut.

// Modify flashActivity
const flashFn = `
function flashActivity(type = 'in') {
  const dot = document.getElementById('midi-dot');
  if (!dot) return;
  if (type === 'in') {
    dot.style.backgroundColor = '#22c55e';
    dot.style.boxShadow = '0 0 10px #22c55e';
  } else if (type === 'out') {
    dot.style.backgroundColor = '#3b82f6';
    dot.style.boxShadow = '0 0 10px #3b82f6';
  }
  clearTimeout(flashActivity._t);
  flashActivity._t = setTimeout(() => {
    dot.style.backgroundColor = '';
    dot.style.boxShadow = '';
  }, 150);
}
`;
js = js.replace(/function flashActivity\(\) \{[\s\S]*?\}\n/m, flashFn + '\n');

// Update onMidiMessage to call flashActivity('in')
js = js.replace(/flashActivity\(\);/g, "flashActivity('in');");


fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('midicontrols.v4.js patched (part 1)');
