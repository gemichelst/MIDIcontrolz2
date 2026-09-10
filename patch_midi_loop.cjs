const fs = require('fs');

let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Fix infinite recursion in sendMidiOut
const fixedSendMidiOut = `
function sendMidiOut(data) {
  if (State.midiOut) {
    flashActivity('out');
    State.midiOut.send(data);
  }
}
`;
js = js.replace(/function sendMidiOut\(data\) \{[\s\S]*?\}\n/m, fixedSendMidiOut);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('midicontrols.v4.js patched (recursion fix)');
