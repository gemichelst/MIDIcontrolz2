const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const jsonLogic = `
window.validateJsonEditor = function() {
  const ta = document.getElementById('json-editor-textarea');
  const err = document.getElementById('json-editor-error');
  const btn = document.getElementById('json-editor-save-btn');
  if (!ta || !err || !btn) return;
  try {
    JSON.parse(ta.value);
    err.textContent = '';
    btn.disabled = false;
  } catch (e) {
    err.textContent = 'Invalid JSON: ' + e.message;
    btn.disabled = true;
  }
};

window.saveJsonEditor = function() {
  const ta = document.getElementById('json-editor-textarea');
  if (!ta) return;
  try {
    const data = JSON.parse(ta.value);
    const dev = State.devices.find(d => d.id === data.id);
    if (dev) {
      Object.assign(dev, data);
      save();
      renderDeviceEditor();
      toast('JSON Config Saved', 'success');
    }
  } catch (e) {
    toast('Error saving JSON: ' + e.message, 'error');
  }
};
`;

code += '\n' + jsonLogic;
fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched json editor');
