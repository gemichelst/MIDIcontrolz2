const fs = require('fs');

let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Patch 1: Fix filtered in renderDeviceManager
const deviceManagerFixed = `
function renderDeviceManager() {
  const grid = document.getElementById('device-manager-grid');
  if (!grid) return;
  const searchInput = document.getElementById('dm-search');
  const term = searchInput ? searchInput.value.toLowerCase() : '';
  const filtered = State.devices.filter(dev => 
    (dev.name || '').toLowerCase().includes(term) ||
    (dev.manufacturer || '').toLowerCase().includes(term) ||
    (dev.description || '').toLowerCase().includes(term)
  );
  grid.innerHTML = filtered.map(dev => \`
`;
js = js.replace(/function renderDeviceManager\(\) \{\s*const grid = document\.getElementById\('device-manager-grid'\);\s*if \(!grid\) return;\s*grid\.innerHTML = filtered\.map\(dev => `/m, deviceManagerFixed);


// Patch 2: Fix SysEx Receive Manager
// Decrease the length check to allow any SysEx payload larger than 8 bytes to be treated as a dump template
js = js.replace(/if\(data\[0\] === 0xF0 && data\.length > 50\) \{/g, 'if(data[0] === 0xF0 && data.length > 8) {');

fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('midicontrols.v4.js patched (bugs)');
