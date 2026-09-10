const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const curveHtml = `
        <div style="display:flex; gap:16px; margin-bottom:12px;">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; font-size: 0.8rem; color:var(--text2);">
              <span>Fixed Velocity:</span>
              <input type="range" id="vk-velocity" min="1" max="127" value="100" style="flex:1;" oninput="document.getElementById('vk-velocity-val').textContent=this.value">
              <span id="vk-velocity-val">100</span>
            </div>
          </div>
          <div style="flex:1; background:var(--surface3); border:1px solid var(--border); border-radius:4px; padding:8px; display:flex; flex-direction:column; align-items:center;">
            <div style="font-size:0.75rem; color:var(--text3); margin-bottom:4px; width:100%; display:flex; justify-content:space-between;">
              <span>Velocity Curve</span>
              <select id="vk-curve-type" onchange="updateVkCurve()" style="font-size:0.7rem; padding:0 4px;">
                <option value="linear">Linear</option>
                <option value="exp">Exponential</option>
                <option value="log">Logarithmic</option>
              </select>
            </div>
            <canvas id="vk-curve-canvas" width="100" height="40" style="background:var(--surface2); border:1px solid var(--border); border-radius:2px;"></canvas>
          </div>
        </div>
`;

// Replace the existing velocity slider div
html = html.replace(/<div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; font-size: 0\.8rem; color:var\(--text2\);">[\s\S]*?<\/div>/, curveHtml);

fs.writeFileSync('index.html', html);
console.log('patched vk curve html');
