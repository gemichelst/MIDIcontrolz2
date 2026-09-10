const fs = require('fs');

let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Remove blob SW
js = js.replace(/if \('serviceWorker' in navigator\) \{\n  const sw = `[\s\S]*?\} catch\(e\) \{\}\n\}/, '');

// Ensure no stray brackets at the end of the file. We did this with sed, but let's be sure.
// Just to be safe:
js = js.replace(/\n\}\n\}\n$/g, '\n');

fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('patched midicontrols blob sw');
