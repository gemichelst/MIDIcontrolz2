const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `<h2 style="margin-bottom:16px;font-size:1.1rem;">MIDI Monitor</h2>
      <div id="signal-flow-indicator" style="display:none; margin-bottom:12px; padding: 8px 12px; background: var(--surface2); border-radius: 6px; align-items: center; justify-content: center; gap: 12px; font-size: 0.8rem; border: 1px solid var(--border);">
        <div style="background:var(--surface3); padding:4px 8px; border-radius:4px; font-family:monospace;" id="sf-in">MIDI IN</div>
        <div style="color:var(--accent); font-weight:bold; letter-spacing:1px;" id="sf-arrow">➞ THRU ➞</div>
        <div style="background:var(--surface3); padding:4px 8px; border-radius:4px; font-family:monospace;" id="sf-out">MIDI OUT</div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">`;

html = html.replace(/<h2 style="margin-bottom:16px;font-size:1.1rem;">MIDI Monitor<\/h2>\s*<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">/, replacement);

fs.writeFileSync('index.html', html);
console.log('patched index.html for signal flow');
