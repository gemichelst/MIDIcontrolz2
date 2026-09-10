const fs = require('fs');
let content = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Insert at top
content = "let activeKeys = new Set();\n" + content;

// Remove the var activeKeys = new Set();
content = content.replace(/var activeKeys = new Set\(\);\n?/g, '');

// Revert the window.activeKeys stuff
content = content.replace(/if \(typeof activeKeys === "undefined"\) \{ window\.activeKeys = new Set\(\); \}\n?\s*const active = window\.activeKeys \? window\.activeKeys\.has\(note\) : false;/g, 'const active = activeKeys.has(note);');

content = content.replace(/if\(typeof window\.activeKeys==="undefined"\) window\.activeKeys=new Set\(\);\n?\s*if\(state\) window\.activeKeys\.add\(note\);/g, 'if(state) activeKeys.add(note);');

content = content.replace(/else window\.activeKeys\.delete\(note\);/g, 'else activeKeys.delete(note);');

// Add console.log to renderVirtualKeyboard
content = content.replace(/const vk = document\.getElementById\('virtual-keyboard'\);/, "const vk = document.getElementById('virtual-keyboard');\n  console.log('virtual-keyboard element exists:', !!vk);");

fs.writeFileSync('public/assets/js/midicontrols.v4.js', content);
