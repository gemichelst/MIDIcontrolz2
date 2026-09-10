const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const macroHtml = `
        <div id="macro-builder-section" style="margin-top:20px; background:var(--surface3); padding:12px; border-radius:8px; border:1px solid var(--border);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h3 style="font-size:1rem;margin:0;">Macro Builder</h3>
            <button class="btn sm" onclick="addMacro()">+ Add Macro</button>
          </div>
          <p style="font-size:0.8rem;color:var(--text3);margin-bottom:10px;">Group multiple CC mappings into a single physical control trigger.</p>
          <div id="macro-list" style="display:flex; flex-direction:column; gap:8px;"></div>
        </div>
`;

html = html.replace(/<div id="svg-mapper-container"[\s\S]*?<\/div>\s*<\/div>/, match => match + '\n' + macroHtml);
fs.writeFileSync('index.html', html);
console.log('patched macro html');
