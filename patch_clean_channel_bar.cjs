const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// The channel bar has: <button class="btn sm" onclick="revertPresetVersion()" ...
const regex = /<button class="btn sm" onclick="revertPresetVersion\(\)"[\s\S]*?<\/button>/;
code = code.replace(regex, '');

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('cleaned channel bar');
