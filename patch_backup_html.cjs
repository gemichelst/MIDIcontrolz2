const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const backupHtml = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
        <button class="btn primary" onclick="backupFiltered()">⬇ Export Bundle</button>
        <button class="btn" onclick="document.getElementById('restore-input').click()">⬆ Restore from File</button>
        <input type="file" id="restore-input" accept=".json" style="display:none;" onchange="restoreAll(event)">
      </div>
      <div style="background:var(--surface2); padding:12px; border-radius:8px; margin-bottom:20px; border:1px solid var(--border);">
        <h3 style="font-size:0.9rem; margin-bottom:8px;">Export Filter</h3>
        <p style="font-size:0.75rem; color:var(--text3); margin-bottom:8px;">Select tags to include in this backup bundle. Leave all unchecked to export the entire library.</p>
        <div id="backup-tags-container" style="display:flex; flex-wrap:wrap; gap:8px;"></div>
      </div>
`;

html = html.replace(/<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">[\s\S]*?<\/div>\s*<\/div>/, match => backupHtml);

fs.writeFileSync('index.html', html);
console.log('patched backup html');
