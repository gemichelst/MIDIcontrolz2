const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

code = code.replace(/function renderBackupList\(\) \{[\s\S]*?\}\)/,
`function renderBackupList() {
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
      <button class="btn sm success" onclick="restoreBackupById(\${b.id})">↩ Restore</button>
      <button class="btn sm danger"  onclick="deleteBackup(\${b.id})">🗑</button>
    </div>\`).join('');
}`);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('renderBackupList patched');
