const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const targetStr = `  const grid = document.getElementById('device-manager-grid');
  if (!grid) return;`;

const replaceStr = `  const grid = document.getElementById('device-manager-grid');
  if (!grid) {
    console.warn("[MidiControls] renderDeviceManager: #device-manager-grid not found in DOM");
    return;
  }
  console.log("[MidiControls] renderDeviceManager: rendering", State.devices.length, "devices");`;

code = code.replace(targetStr, replaceStr);

// Expose renderDeviceManager if not already
if (!code.includes('window.renderDeviceManager = renderDeviceManager;')) {
    code += '\nwindow.renderDeviceManager = renderDeviceManager;';
}

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
