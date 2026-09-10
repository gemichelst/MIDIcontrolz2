const fs = require('fs');
let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Update startMidiLearn
js = js.replace(/function startMidiLearn\(type, index, btn\) \{[\s\S]*?btn\.classList\.add\('learning'\);/m, 
`function startMidiLearn(type, index, btn) {
  if (_learnTarget) {
    // Cancel existing learn
    if (_learnTarget.btn) _learnTarget.btn.classList.remove('learning');
    const oldSvg = document.getElementById('svg-' + _learnTarget.type + '-' + _learnTarget.index);
    if (oldSvg) oldSvg.classList.remove('svg-learning');
    _learnTarget = null;
    return;
  }
  _learnTarget = { type, index: parseInt(index), btn };
  btn.classList.add('learning');
  const svgEl = document.getElementById('svg-' + type + '-' + index);
  if (svgEl) svgEl.classList.add('svg-learning');`);

// Update cancelLearn logic (could be inside handleMidiLearn or cancelLearn)
js = js.replace(/function cancelLearn\(\) \{[\s\S]*?_learnTarget = null;\n\}/m, 
`function cancelLearn() {
  if (!_learnTarget) return;
  if (_learnTarget.btn) _learnTarget.btn.classList.remove('learning');
  const oldSvg = document.getElementById('svg-' + _learnTarget.type + '-' + _learnTarget.index);
  if (oldSvg) oldSvg.classList.remove('svg-learning');
  _learnTarget = null;
}`);

// Wait, let's see if cancelLearn exists:
if (!js.includes('function cancelLearn')) {
    // maybe it doesn't exist? The previous grep showed `if (!dev) { cancelLearn(); return; }`
    // Let's check where cancelLearn is defined.
    // If we can't find it, we'll patch handleMidiLearn directly to remove class on completion.
}

fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('midicontrols.v4.js patched (part 2)');
