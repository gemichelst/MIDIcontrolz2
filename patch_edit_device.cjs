const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const editDeviceCode = `
function openEditDeviceModal(id) {
  const dev = State.devices.find(d => d.id === id);
  if (!dev) return;
  
  openModal(\`
    <h2>⚙️ Edit Device Config</h2>
    <div class="form-group">
      <label>Name</label>
      <input type="text" id="edit-dev-name" value="\${dev.name || ''}">
    </div>
    <div class="form-group">
      <label>Tags (comma-separated)</label>
      <input type="text" id="edit-dev-tags" value="\${(dev.tags || []).join(', ')}">
    </div>
    <div class="form-group">
      <label>Manufacturer</label>
      <input type="text" id="edit-dev-mfr" value="\${dev.manufacturer || ''}">
    </div>
    <div class="form-group">
      <label>Icon (emoji)</label>
      <input type="text" id="edit-dev-icon" value="\${dev.icon || '🎹'}" maxlength="4">
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveEditDevice('\${dev.id}')">Save Changes</button>
    </div>
  \`);
}

function saveEditDevice(id) {
  const dev = State.devices.find(d => d.id === id);
  if (!dev) return;

  dev.name = document.getElementById('edit-dev-name')?.value.trim() || dev.name;
  dev.manufacturer = document.getElementById('edit-dev-mfr')?.value.trim() || dev.manufacturer;
  dev.icon = document.getElementById('edit-dev-icon')?.value || dev.icon;
  
  const tagsInput = document.getElementById('edit-dev-tags')?.value || '';
  dev.tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);
  
  save();
  closeModal();
  populateDeviceDropdown();
  renderDeviceManager();
  toast('Device updated ✓', 'success');
}
`;

code = code.replace(/function createNewDevice\(\) \{/, editDeviceCode + '\nfunction createNewDevice() {');

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('Added Edit Device modal functions.');
