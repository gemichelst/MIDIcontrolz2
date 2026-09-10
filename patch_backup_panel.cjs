const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">\s*<button class="btn primary" onclick="backupAll\(\)">⬇ Export All Backups<\/button>\s*<button class="btn" onclick="document.getElementById\('restore-input'\)\.click\(\)">⬆ Restore from File<\/button>\s*<input type="file" id="restore-input" accept="\.json" style="display:none" onchange="restoreBackup\(event\)">\s*<\/div>/,
`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
        <button class="btn primary" onclick="backupAll()">⬇ Export All Backups</button>
        <button class="btn" onclick="document.getElementById('restore-input').click()">⬆ Restore from File</button>
        <input type="file" id="restore-input" accept=".json" style="display:none" onchange="restoreBackup(event)">
      </div>
      <div style="margin-bottom: 16px;">
        <input type="text" id="backup-search" placeholder="Search backups..." oninput="renderBackupList()" style="background:var(--surface3);border:1px solid var(--border);color:var(--text);padding:8px;border-radius:4px;outline:none;font-size:0.85rem;width:100%;max-width:300px;">
      </div>`);

fs.writeFileSync('index.html', html);
console.log('backup panel patched in html');
