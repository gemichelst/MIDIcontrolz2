const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const replaceChannelBar = `<div class="channel-bar" style="display:flex;align-items:center;gap:12px;background:var(--surface2);padding:10px;border-radius:6px;margin-bottom:20px;">
    <label style="font-weight:bold;">MIDI Channel:</label>
    <select onchange="setPresetChannel(this.value)" style="background:var(--surface3);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:4px;">
      \${Array.from({length:16},(_,i) =>
        \`<option value="\${i}" \${preset.channel === i ? 'selected' : ''}>Ch \${i+1}</option>\`
      ).join('')}
    </select>
    
    <div style="width:1px;height:24px;background:var(--border);margin:0 4px;"></div>
    
    <button class="btn sm" onclick="savePresetVersion()">💾 Save Version</button>
    <button class="btn sm" onclick="revertPresetVersion()" \${!preset.lastSavedState ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>↩ Revert to Previous</button>
    
    <span style="font-size:0.8rem;color:var(--accent);margin-left:auto;font-weight:bold;">v\${preset.version || 1}</span>
    
    <span style="font-size:0.75rem;color:var(--text3);margin-left:12px;">
      \${dev.sysex ? '⚡ SysEx supported' : '— No SysEx'}
    </span>
  </div>`;

code = code.replace(/<div class="channel-bar">[\s\S]*?<\/div>/, replaceChannelBar);

const addFuncs = `
function savePresetVersion() {
  const dev = getActiveDev(); if (!dev) return;
  const p = dev.defaultPresets[State.activePresetIndex];
  
  // Create snapshot without the lastSavedState to avoid nesting explosion
  const snapshot = JSON.parse(JSON.stringify(p));
  delete snapshot.lastSavedState;
  
  p.lastSavedState = snapshot;
  p.version = (p.version || 1) + 1;
  save();
  renderDeviceEditor();
  toast('Preset version ' + p.version + ' saved ✓', 'success');
}

function revertPresetVersion() {
  const dev = getActiveDev(); if (!dev) return;
  const p = dev.defaultPresets[State.activePresetIndex];
  if (!p.lastSavedState) { toast('No previous version found', 'error'); return; }
  
  const restore = JSON.parse(JSON.stringify(p.lastSavedState));
  restore.lastSavedState = p.lastSavedState; // Keep the ability to revert back to it if needed? Actually no, reverting to previous means we ARE at previous. We can keep it so they can revert again if they make mistakes, but let's just restore it cleanly.
  dev.defaultPresets[State.activePresetIndex] = restore;
  save();
  renderDeviceEditor();
  toast('Reverted to version ' + (restore.version || 1) + ' ✓', 'info');
}
`;

code += addFuncs;
fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched preset versions');
