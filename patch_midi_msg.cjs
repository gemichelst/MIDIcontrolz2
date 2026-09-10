const fs = require('fs');
let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// intercept onMidiMessage
const hookCode = `
  if (window.mapperLearnMode && window.mapperLearnTarget && window.handleMapperMidiLearn) {
    if (window.handleMapperMidiLearn(data)) return;
  }
`;
js = js.replace(/if \(_learnTarget\) \{ handleMidiLearn\(data\); return; \}/, hookCode + '\n  if (_learnTarget) { handleMidiLearn(data); return; }');

fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('patched onMidiMessage for mapper learn');
