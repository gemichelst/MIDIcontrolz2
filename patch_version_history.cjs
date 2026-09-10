const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Replace the inner logic of savePresetVersion to use p.history
const newSavePresetVersion = `
function savePresetVersion() {
  const dev = getActiveDev(); if (!dev) return;
  const p = dev.defaultPresets[State.activePresetIndex];
  
  const snapshot = JSON.parse(JSON.stringify(p));
  delete snapshot.history; // don't infinitely nest history
  delete snapshot.lastSavedState; // clean up old system
  
  p.history = p.history || [];
  p.history.unshift({
    version: (p.version || 1),
    timestamp: new Date().toISOString(),
    state: snapshot
  });
  
  p.version = (p.version || 1) + 1;
  save();
  renderDeviceEditor();
  toast('Preset version ' + p.version + ' saved ✓', 'success');
}

function restoreHistoryVersion(idx) {
  const dev = getActiveDev(); if (!dev) return;
  const p = dev.defaultPresets[State.activePresetIndex];
  if (!p || !p.history || !p.history[idx]) return;
  
  const restore = JSON.parse(JSON.stringify(p.history[idx].state));
  restore.history = p.history;
  restore.version = p.history[idx].version;
  
  dev.defaultPresets[State.activePresetIndex] = restore;
  save();
  renderDeviceEditor();
  toast('Reverted to version ' + restore.version + ' ✓', 'info');
}
`;

// Inject functions
code += '\n' + newSavePresetVersion;

// In renderDeviceEditor, wrap the html in a grid layout.
// Let's find the assignment of the final html to container.
// It looks like `container.innerHTML = html;`
// We need to build the history sidebar HTML and wrap the main HTML.
const wrapperLogic = `
  const historyHtml = (preset.history || []).map((h, i) => \`
    <div style="background:var(--surface2); padding:8px; border-radius:6px; margin-bottom:8px; border:1px solid var(--border);">
      <div style="font-size:0.85rem; font-weight:bold; color:var(--text);">Version \${h.version}</div>
      <div style="font-size:0.7rem; color:var(--text3); margin-bottom:6px;">\${new Date(h.timestamp).toLocaleString()}</div>
      <button class="btn sm" onclick="restoreHistoryVersion(\${i})" style="width:100%; justify-content:center;">↩ Restore</button>
    </div>
  \`).join('');

  const finalHtml = \`
    <div style="display:grid; grid-template-columns: 1fr 240px; gap:20px; align-items:start;">
      <div style="min-width:0;">\${html}</div>
      <div style="background:var(--surface3); border:1px solid var(--border); border-radius:8px; padding:12px; position:sticky; top:20px;">
        <h3 style="font-size:1rem; margin-top:0; margin-bottom:12px;">Version History</h3>
        <p style="font-size:0.75rem; color:var(--text3); margin-bottom:12px;">Click 'Save Version' in the channel bar to snapshot your mappings.</p>
        <div style="max-height:600px; overflow-y:auto;">\${historyHtml || '<div style="font-size:0.75rem; color:var(--text3);">No history saved.</div>'}</div>
      </div>
    </div>
  \`;
  container.innerHTML = finalHtml;
`;

code = code.replace(/container\.innerHTML = html;/, wrapperLogic);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched version history layout');
