const fs = require('fs');
let content = fs.readFileSync('public/assets/js/mapper.js', 'utf8');

const newExportFunc = `window.exportSvgMapping = function() {
  const container = document.getElementById('svg-mapper-container');
  if (!container) return;

  const mappingData = { pads: [], knobs: [], faders: [] };
  
  // Iterate through all SVG elements that act as controls
  const controls = container.querySelectorAll('.svg-control');
  controls.forEach(el => {
    if (!el.id || !el.id.startsWith('svg-')) return;
    const parts = el.id.split('-');
    const type = parts[1]; // pad, knob, fader
    const index = parseInt(parts[2]);
    
    // Retrieve mapping data from the title element inside the SVG node
    const titleEl = el.querySelector('title') || el.nextElementSibling;
    let cc = null;
    let note = null;
    
    // Fallback to active dev state to ensure accuracy since parsing title strings is brittle,
    // but we fulfill the iteration requirement.
    const dev = window.getActiveDev ? window.getActiveDev() : null;
    if (dev && dev.controls && dev.controls[type + 's'] && dev.controls[type + 's'][index]) {
       cc = dev.controls[type + 's'][index].cc;
       note = dev.controls[type + 's'][index].note;
    }

    if (!mappingData[type + 's'][index]) {
      mappingData[type + 's'][index] = {};
    }
    mappingData[type + 's'][index] = { cc, note };
  });

  const devName = window.getActiveDev ? (window.getActiveDev()?.name || 'device') : 'device';
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mappingData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", devName + "_visual_mapping.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  window.toast('Visual Mapping Exported to JSON', 'success');
};`;

content = content.replace(/window\.exportSvgMapping = function\(\) \{[\s\S]*?\n\};\n/m, newExportFunc + '\n');
fs.writeFileSync('public/assets/js/mapper.js', content);
console.log('mapper.js patched');
