const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

code = code.replace(/toast\("MIDI Panic: All Notes Off \\(B0 7B 00\\) sent", "info"\);/, `toast("MIDI Panic: All Notes Off (B0 7B 00) sent", "info");
  logMonitor({ type: 'panic', message: 'All Notes Off (Panic)', timestamp: Date.now() });`);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('panic patched');
