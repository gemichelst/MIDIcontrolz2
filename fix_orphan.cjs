const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const sIdx = code.indexOf(`  const restore = JSON.parse(JSON.stringify(p.lastSavedState));`);
const eIdx = code.indexOf('}', sIdx) + 1;

if (sIdx !== -1 && eIdx !== -1) {
  code = code.substring(0, sIdx) + code.substring(eIdx);
  fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
  console.log('fixed orphan');
} else {
  console.log('not found');
}
