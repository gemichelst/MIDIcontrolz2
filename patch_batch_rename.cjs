const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const regex = /<button class="btn sm" onclick="exportDeviceJSON\('\\$\\{dev.id\\}'\)">📤 \.json<\/button>/;
const replace = `<button class="btn sm" onclick="openBatchRenameModal('\${dev.id}')">✏️ Batch Rename</button>
        <button class="btn sm" onclick="exportDeviceJSON('\${dev.id}')">📤 .json</button>`;

code = code.replace(regex, replace);

const addModalCode = `
function openBatchRenameModal(id) {
  const dev = State.devices.find(d => d.id === id);
  if (!dev) return;
  
  const presets = dev.defaultPresets || [];
  let checkboxes = presets.map((p, i) => \`
    <label style="display:flex;align-items:center;gap:8px;font-size:0.8rem;margin-bottom:4px;">
      <input type="checkbox" class="batch-rename-cb" value="\${i}" checked>
      Preset \${i+1}: \${p.name || 'Preset ' + (i+1)}
    </label>
  \`).join('');

  openModal(\`
    <h2>✏️ Batch Rename Presets</h2>
    <div style="font-size:0.8rem;color:var(--text2);margin-bottom:12px;">\${dev.name} (\${presets.length} presets)</div>
    
    <div style="max-height:150px;overflow-y:auto;background:var(--surface2);padding:8px;border-radius:4px;margin-bottom:12px;border:1px solid var(--border);">
      \${checkboxes}
    </div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Search for (optional)</label>
        <input type="text" id="br-search" placeholder="e.g. Preset">
      </div>
      <div class="form-group">
        <label>Replace with</label>
        <input type="text" id="br-replace" placeholder="e.g. Patch">
      </div>
    </div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="form-group">
        <label>Prefix</label>
        <input type="text" id="br-prefix" placeholder="e.g. [Live] ">
      </div>
      <div class="form-group">
        <label>Suffix</label>
        <input type="text" id="br-suffix" placeholder="e.g. V1">
      </div>
    </div>
    
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="applyBatchRename('\${dev.id}')">Apply Rename</button>
    </div>
  \`);
}

function applyBatchRename(id) {
  const dev = State.devices.find(d => d.id === id);
  if (!dev) return;
  
  const search = document.getElementById('br-search').value;
  const replace = document.getElementById('br-replace').value;
  const prefix = document.getElementById('br-prefix').value;
  const suffix = document.getElementById('br-suffix').value;
  
  const checkboxes = document.querySelectorAll('.batch-rename-cb');
  let renamedCount = 0;
  
  checkboxes.forEach(cb => {
    if (cb.checked) {
      const idx = parseInt(cb.value);
      const p = dev.defaultPresets[idx];
      let currentName = p.name || 'Preset ' + (idx + 1);
      
      if (search) {
        // use regex globally, case insensitive if possible
        try {
          const re = new RegExp(search, 'g');
          currentName = currentName.replace(re, replace);
        } catch(e) {
          // fallback string replace
          currentName = currentName.split(search).join(replace);
        }
      }
      
      if (prefix) currentName = prefix + currentName;
      if (suffix) currentName = currentName + suffix;
      
      p.name = currentName;
      renamedCount++;
    }
  });
  
  if (renamedCount > 0) {
    save();
    if (State.activeDeviceId === dev.id) renderDeviceEditor();
    toast('Renamed ' + renamedCount + ' presets ✓', 'success');
  }
  closeModal();
}
`;

code += addModalCode;

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched batch rename functionality');
