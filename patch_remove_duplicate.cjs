const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Find the first savePresetVersion() block and delete it.
const func1Start = code.indexOf('function savePresetVersion() {');
const func1End = code.indexOf('}', code.indexOf('toast(', func1Start)) + 1;

// Wait, the first one also included revertPresetVersion(). Let's find revertPresetVersion and delete it as well.
const func2Start = code.indexOf('function revertPresetVersion() {');
const func2End = code.indexOf('}', code.indexOf('toast(', func2Start)) + 1;

if (func1Start !== -1 && func1End !== -1) {
  code = code.substring(0, func1Start) + code.substring(func1End);
}

const func2StartNew = code.indexOf('function revertPresetVersion() {');
if (func2StartNew !== -1) {
  const func2EndNew = code.indexOf('}', code.indexOf('toast(', func2StartNew)) + 1;
  code = code.substring(0, func2StartNew) + code.substring(func2EndNew);
}

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('removed duplicates');
