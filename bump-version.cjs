const fs = require('fs');

// Read package.json
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let currentVer = pkg.version;
let parts = currentVer.split('.').map(Number);

// Check argument
const type = process.argv[2] || 'minor'; // 'major', 'minor', 'patch'
if (type === 'major') {
  parts[0]++; parts[1] = 0; parts[2] = 0;
} else if (type === 'minor') {
  parts[1]++; parts[2] = 0;
} else {
  parts[2]++;
}

const newVer = parts.join('.');
pkg.version = newVer;

// Write package.json
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log("package.json bumped from " + currentVer + " to " + newVer);

// Read index.html
let html = fs.readFileSync('index.html', 'utf8');
const oldVerPattern = new RegExp("<strong>MIDIcontrolz2<\\/strong> v" + currentVer.replace(/\\./g, '\\.'));
html = html.replace(oldVerPattern, "<strong>MIDIcontrolz2</strong> v" + newVer);
fs.writeFileSync('index.html', html);
console.log("index.html About section bumped from " + currentVer + " to " + newVer);
