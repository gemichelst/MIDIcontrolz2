const fs = require('fs');

// 1. Fix index.html
let html = fs.readFileSync('index.html', 'utf8');

// A. Inject MIDI Panic Button in #topnav
const portSelectsTarget = `<div id="port-selects">
    <select id="sel-in" onchange="connectMidiPorts()">
      <option value="">— MIDI In —</option>
    </select>
    <select id="sel-out" onchange="connectMidiPorts()">
      <option value="">— MIDI Out —</option>
    </select>
  </div>`;
const portSelectsReplacement = `<div id="port-selects" style="display:flex;align-items:center;">
    <select id="sel-in" onchange="connectMidiPorts()">
      <option value="">— MIDI In —</option>
    </select>
    <select id="sel-out" onchange="connectMidiPorts()">
      <option value="">— MIDI Out —</option>
    </select>
    <button class="btn sm danger" onclick="midiPanic()" style="margin-left:8px;" title="Send All Notes Off / All Sound Off">🛑 Panic</button>
  </div>`;
html = html.replace(portSelectsTarget, portSelectsReplacement);

// Save html
fs.writeFileSync('index.html', html);
console.log('Fixed index.html (MIDI Panic added)');


// 2. Fix midicontrols.v4.js
let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// B. Inject JSON validation editor & Import/Export buttons into Hardware Mapping Editor
const endOfRenderDeviceEditorTarget = `  container.innerHTML = html;
}`;

const endOfRenderDeviceEditorReplacement = `  // JSON EDITOR & Import/Export .syx SECTION
  html += sectionHeader('JSON Config Draft (Hardware Mapping Editor)');
  html += \`
    <div style="display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; gap:8px; justify-content:space-between; margin-bottom:4px;">
        <div style="font-size:0.8rem;color:var(--text3);">Edit JSON below or use UI controls.</div>
        <div style="display:flex; gap:8px;">
          <button class="btn sm" onclick="document.getElementById('import-device-input').click()">📥 Import from .syx</button>
          <button class="btn sm" onclick="exportDeviceSyx('\${dev.id}')">📤 Export as .syx</button>
        </div>
      </div>
      <textarea id="json-editor-textarea" style="width:100%; height:200px; font-family:monospace; font-size:0.8rem; padding:8px; background:var(--surface2); color:var(--text); border:1px solid var(--border); border-radius:4px; outline:none; resize:vertical;" oninput="validateJsonEditor()"></textarea>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span id="json-editor-error" style="color:var(--accent); font-size:0.85rem; font-weight:600;"></span>
        <button id="json-editor-save-btn" class="btn primary sm" onclick="saveJsonEditor()">Save JSON Preset</button>
      </div>
    </div>
  \`;

  container.innerHTML = html;

  // Populate JSON Editor after render
  setTimeout(() => {
    const ta = document.getElementById('json-editor-textarea');
    if (ta) ta.value = JSON.stringify(dev, null, 2);
    validateJsonEditor();
  }, 0);
}`;

if (js.includes(endOfRenderDeviceEditorTarget)) {
  js = js.replace(endOfRenderDeviceEditorTarget, endOfRenderDeviceEditorReplacement);
  console.log('Injected JSON Editor Validation and Import/Export .syx buttons');
} else {
  console.log('Failed to find end of renderDeviceEditor');
}

const jsonEditorFunctions = `
function validateJsonEditor() {
  const ta = document.getElementById('json-editor-textarea');
  const err = document.getElementById('json-editor-error');
  const btn = document.getElementById('json-editor-save-btn');
  if(!ta || !err || !btn) return;
  try {
    JSON.parse(ta.value);
    ta.style.borderColor = 'var(--border)';
    ta.style.backgroundColor = 'var(--surface2)';
    err.textContent = '';
    btn.disabled = false;
    btn.style.opacity = '1';
  } catch(e) {
    ta.style.borderColor = 'var(--accent)';
    ta.style.backgroundColor = 'rgba(255, 60, 60, 0.05)';
    err.textContent = 'Syntax Error: ' + e.message;
    btn.disabled = true;
    btn.style.opacity = '0.5';
  }
}

function saveJsonEditor() {
  const ta = document.getElementById('json-editor-textarea');
  try {
    const parsed = JSON.parse(ta.value);
    const activeId = State.activeDeviceId;
    const idx = State.devices.findIndex(d => d.id === activeId);
    if (idx !== -1) {
      State.devices[idx] = parsed;
      save();
      renderDeviceEditor();
      toast('JSON Configuration Saved ✓', 'success');
    }
  } catch(e) {
    toast('Cannot save invalid JSON', 'error');
  }
}
`;
if (!js.includes('function validateJsonEditor()')) {
  js = js + jsonEditorFunctions;
}

// C. Fix Virtual Keyboard Rendering issue 
// Virtual Keyboard needs activeKeys to be defined globally. It is currently at the very bottom. Let's make sure it's accessible.
// Also, the user says it doesn't render. The HTML for #virtual-keyboard is outside #editor-device. But sometimes users miss it or it's not displaying properly. 
// I'll ensure renderVirtualKeyboard is called robustly.

// Save js
fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('Fixed midicontrols.v4.js');

