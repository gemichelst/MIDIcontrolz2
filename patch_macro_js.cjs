const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const macroLogic = `
function renderMacros() {
  const container = document.getElementById('macro-list');
  if (!container) return;
  const dev = getActiveDev();
  if (!dev) return;
  const p = dev.defaultPresets[State.activePresetIndex];
  if (!p) return;
  p.macros = p.macros || [];
  
  if (p.macros.length === 0) {
    container.innerHTML = '<div style="font-size:0.8rem;color:var(--text3);">No macros defined.</div>';
    return;
  }
  
  container.innerHTML = p.macros.map((m, i) => \`
    <div style="display:flex;align-items:center;gap:8px;background:var(--surface2);padding:8px;border-radius:6px;border:1px solid var(--border);">
      <label style="font-size:0.8rem;font-weight:bold;">Source CC:</label>
      <input type="number" min="0" max="127" value="\${m.source ?? 0}" onchange="updateMacro(\${i}, 'source', this.value)" style="width:60px;">
      
      <label style="font-size:0.8rem;font-weight:bold;margin-left:12px;">Targets (comma-separated CCs):</label>
      <input type="text" value="\${(m.targets || []).join(',')}" onchange="updateMacro(\${i}, 'targets', this.value)" style="flex:1;" placeholder="e.g. 74, 71, 10">
      
      <button class="btn sm danger" onclick="deleteMacro(\${i})">🗑</button>
    </div>
  \`).join('');
}

function addMacro() {
  const dev = getActiveDev(); if (!dev) return;
  const p = dev.defaultPresets[State.activePresetIndex];
  p.macros = p.macros || [];
  p.macros.push({ source: 1, targets: [] });
  save();
  renderMacros();
}

function updateMacro(i, field, val) {
  const dev = getActiveDev(); if (!dev) return;
  const p = dev.defaultPresets[State.activePresetIndex];
  if (field === 'source') {
    p.macros[i].source = parseInt(val);
  } else if (field === 'targets') {
    p.macros[i].targets = val.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  }
  save();
}

function deleteMacro(i) {
  const dev = getActiveDev(); if (!dev) return;
  const p = dev.defaultPresets[State.activePresetIndex];
  p.macros.splice(i, 1);
  save();
  renderMacros();
}
`;

code += '\n' + macroLogic;

// Call renderMacros inside renderDeviceEditor
code = code.replace(/renderVirtualKeyboard\(\);/, 'renderVirtualKeyboard();\n  if (typeof renderMacros === "function") renderMacros();');

// Inject macro processing into onMidiMessage
const macroProcess = `
  if (type === 0xB) {
    // Process macros
    const dev = getActiveDev();
    if (dev) {
      const p = dev.defaultPresets[State.activePresetIndex];
      if (p && p.macros) {
        const matchingMacros = p.macros.filter(m => m.source === data[1]);
        matchingMacros.forEach(m => {
          (m.targets || []).forEach(tCC => {
            sendMidiOut([0xB0 | ch, tCC, data[2]]);
          });
        });
      }
    }
  }
`;
code = code.replace(/if \(type === 0xB\) \{/, 'if (type === 0xB) {' + macroProcess);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched macro js');
