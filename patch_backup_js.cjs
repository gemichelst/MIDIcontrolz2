const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const backupJs = `
function renderBackupTags() {
  const container = document.getElementById('backup-tags-container');
  if (!container) return;
  const allTags = new Set();
  State.devices.forEach(d => {
    if (d.tags && Array.isArray(d.tags)) d.tags.forEach(t => allTags.add(t));
  });
  
  if (allTags.size === 0) {
    container.innerHTML = '<span style="font-size:0.75rem;color:var(--text3);">No tags found across any devices.</span>';
    return;
  }
  
  let html = '';
  Array.from(allTags).sort().forEach(tag => {
    html += \`<label style="display:flex;align-items:center;gap:4px;font-size:0.8rem;background:var(--surface3);padding:4px 8px;border-radius:4px;"><input type="checkbox" class="backup-tag-cb" value="\${tag}"> \${tag}</label>\`;
  });
  container.innerHTML = html;
}

function backupFiltered() {
  const checkboxes = document.querySelectorAll('.backup-tag-cb');
  const selectedTags = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
  
  let devicesToExport = State.devices;
  
  if (selectedTags.length > 0) {
    devicesToExport = State.devices.filter(dev => {
      if (!dev.tags) return false;
      return selectedTags.some(tag => dev.tags.includes(tag));
    });
  }
  
  if (devicesToExport.length === 0) {
    toast('No devices match the selected tags.', 'error');
    return;
  }
  
  const bundle = {
    version: '2.6.0',
    date: new Date().toISOString(),
    devices: devicesToExport
  };
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
  const el = document.createElement('a');
  el.setAttribute("href", dataStr);
  el.setAttribute("download", selectedTags.length > 0 ? "midi_backup_" + selectedTags.join('_') + ".json" : "midi_backup_all.json");
  document.body.appendChild(el);
  el.click();
  el.remove();
  toast('Exported ' + devicesToExport.length + ' devices ✓', 'success');
}
`;

code += '\n' + backupJs;

// update showPanel to call renderBackupTags
code = code.replace(/if \(id === 'device-manager'\) renderDeviceManager\(\);/, "if (id === 'device-manager') renderDeviceManager();\n  if (id === 'backup') { renderBackupList(); if(typeof renderBackupTags==='function') renderBackupTags(); }");

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched backup js');
