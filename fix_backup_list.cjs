const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Find the start of function renderBackupList() and replace down to the next function restoreBackupById(id) {
const startIdx = code.indexOf('function renderBackupList() {');
const endIdx = code.indexOf('function restoreBackupById(id) {');

if (startIdx !== -1 && endIdx !== -1) {
  const newFunc = `function renderBackupList() {
  const el = document.getElementById('backup-list');
  if (!el) return;
  if (!State.backups.length) {
    el.innerHTML = '<div style="color:var(--text3);font-size:0.82rem;">No backups yet. Select a device and click 💾 Backup.</div>';
    return;
  }
  
  const searchInput = document.getElementById('backup-search');
  const term = searchInput ? searchInput.value.toLowerCase() : '';
  
  const filtered = State.backups.filter(b => 
    (b.name || '').toLowerCase().includes(term) ||
    (b.date || '').toLowerCase().includes(term)
  );

  el.innerHTML = [...filtered].reverse().map(b => \`
    <div class="backup-item">
      <div class="bname">\${b.name} — \${b.presets?.length ?? 0} preset(s)</div>
      <div class="bdate">\${b.date}</div>
      <button class="btn sm success" onclick="restoreBackupById('\${b.id}')">↩ Restore</button>
      <button class="btn sm danger"  onclick="deleteBackup('\${b.id}')">🗑</button>
    </div>\`).join('');
}

`;
  
  code = code.substring(0, startIdx) + newFunc + code.substring(endIdx);
  fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
  console.log('Fixed renderBackupList duplication');
} else {
  console.log('Could not find indices');
}
