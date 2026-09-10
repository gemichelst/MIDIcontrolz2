const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <h3 style="font-size:0.9rem;margin:0;">Virtual Keyboard</h3>
          <div style="display:flex;align-items:center;gap:8px;font-size:0.8rem;background:var(--surface3);padding:4px 8px;border-radius:4px;border:1px solid var(--border);">
            <button class="btn sm" onclick="changeVkOctave(-1)" style="padding:2px 6px;">- Oct</button>
            <span id="vk-octave-display" style="font-weight:bold;min-width:70px;text-align:center;">C3 - C5</span>
            <button class="btn sm" onclick="changeVkOctave(1)" style="padding:2px 6px;">+ Oct</button>
          </div>
        </div>`;

html = html.replace(/<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">\s*<h3 style="font-size:0.9rem;margin:0;">Virtual Keyboard<\/h3>\s*<\/div>/, replacement);

fs.writeFileSync('index.html', html);
console.log('patched vk html');
