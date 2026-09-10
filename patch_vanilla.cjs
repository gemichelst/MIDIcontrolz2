const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// 1. ADD SEARCH AND CATEGORY TO HTML
const managerHeaderTarget = `<h2 style="font-size:1.1rem;">Device Manager</h2>`;
const managerHeaderReplacement = `<div style="display:flex;align-items:center;gap:16px;">
          <h2 style="font-size:1.1rem;">Device Manager</h2>
          <input type="text" id="dm-search" placeholder="Search devices..." oninput="renderDeviceManager()" style="background:var(--surface3);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:4px;outline:none;font-size:0.8rem;">
          <select id="dm-category" onchange="renderDeviceManager()" style="background:var(--surface3);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:4px;outline:none;font-size:0.8rem;">
            <option value="All">All Tags</option>
          </select>
        </div>`;
html = html.replace(managerHeaderTarget, managerHeaderReplacement);

// 2. VIRTUAL KEYBOARD HTML
const editorWelcomeTarget = `<div class="panel active" id="panel-editor">`;
const editorWelcomeReplacement = `<div class="panel active" id="panel-editor">
      <!-- Virtual Keyboard -->
      <div style="margin-bottom:16px;background:var(--surface2);padding:12px;border-radius:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <h3 style="font-size:0.9rem;margin:0;">Virtual Keyboard</h3>
          <span style="font-size:0.75rem;color:var(--text3);">Incoming Note-On events highlight keys</span>
        </div>
        <div id="virtual-keyboard" style="display:flex;height:80px;position:relative;width:max-content;background:var(--surface3);border:1px solid var(--border);border-radius:4px;overflow:hidden;"></div>
      </div>`;
html = html.replace(editorWelcomeTarget, editorWelcomeReplacement);

// 3. MIDI LEARN HTML IN DEVICE EDITOR
const deviceEditorHTML = js.indexOf('function renderDeviceEditor()');

// 4. JS: RENDER DEVICE MANAGER (Search + Categories)
const renderDMTarget = `function renderDeviceManager() {
  const grid = document.getElementById('device-manager-grid');
  if (!grid) return;

  grid.innerHTML = State.devices.map(dev => \``;

const renderDMReplacement = `function updateCategories() {
  const select = document.getElementById('dm-category');
  if(!select) return;
  const current = select.value;
  const tags = new Set();
  State.devices.forEach(d => { if(d.tags) d.tags.forEach(t => tags.add(t)); });
  select.innerHTML = '<option value="All">All Tags</option>' + Array.from(tags).map(t => \`<option value="\${t}">\${t}</option>\`).join('');
  select.value = current || 'All';
}

function renderDeviceManager() {
  updateCategories();
  const grid = document.getElementById('device-manager-grid');
  const searchInput = document.getElementById('dm-search');
  const categorySelect = document.getElementById('dm-category');
  if (!grid) return;
  
  const q = searchInput ? searchInput.value.toLowerCase() : '';
  const c = categorySelect ? categorySelect.value : 'All';

  const filtered = State.devices.filter(dev => {
    const matchQ = dev.name.toLowerCase().includes(q) || (dev.manufacturer||'').toLowerCase().includes(q);
    const matchC = c === 'All' || (dev.tags && dev.tags.includes(c));
    return matchQ && matchC;
  });

  grid.innerHTML = filtered.map(dev => \``;

js = js.replace(renderDMTarget, renderDMReplacement);
// Fix the map logic inside renderDeviceManager
js = js.replace("grid.innerHTML = State.devices.map(dev => `", "grid.innerHTML = filtered.map(dev => `");

// 5. JS: PREVIEW MODAL ON IMPORT
const importTarget = `function handleImportDevice(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.id || !data.controls) throw new Error("Invalid structure");`;

const importReplacement = `let previewDraft = null;
function handleImportDevice(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.id || !data.controls) throw new Error("Invalid structure");
      
      previewDraft = data;
      // Show Preview Modal
      const html = \`
        <h3 style="margin-top:0;">Preview Preset: \${data.name}</h3>
        <p style="font-size:0.8rem;color:var(--text2);margin-bottom:12px;">\${data.description||''}</p>
        <div style="font-size:0.8rem;margin-bottom:8px;"><strong>Tags:</strong> \${(data.tags||[]).join(', ')||'None'}</div>
        <div style="display:flex;gap:16px;">
          <div style="flex:1;">
            <h4 style="border-bottom:1px solid var(--border);padding-bottom:4px;margin-bottom:4px;">Knobs</h4>
            <div style="font-size:0.75rem;height:120px;overflow-y:auto;background:var(--surface2);padding:4px;border-radius:4px;">
              \${(data.controls.knobs||[]).map(k => \`<div>\${k.label} (CC \${k.cc})</div>\`).join('')}
            </div>
          </div>
          <div style="flex:1;">
            <h4 style="border-bottom:1px solid var(--border);padding-bottom:4px;margin-bottom:4px;">Pads</h4>
            <div style="font-size:0.75rem;height:120px;overflow-y:auto;background:var(--surface2);padding:4px;border-radius:4px;">
              \${(data.controls.pads||[]).map(p => \`<div>\${p.label} (Note \${p.note})</div>\`).join('')}
            </div>
          </div>
        </div>
        <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn sm" onclick="closeModal()">Cancel</button>
          <button class="btn sm primary" onclick="confirmImportDevice()">Import Preset</button>
        </div>
      \`;
      openModal(html);
    } catch(err) {
      toast("Invalid JSON file.", "error");
    }
    evt.target.value = "";
  };
  reader.readAsText(file);
}

function confirmImportDevice() {
  if(!previewDraft) return;
  const data = previewDraft;`;

const importTargetEnd = `toast("Device imported", "success");
    } catch(err) {
      toast("Invalid JSON file.", "error");
    }
    evt.target.value = "";
  };
  reader.readAsText(file);
}`;
const importReplacementEnd = `toast("Device imported", "success");
  closeModal();
  previewDraft = null;
}`;

js = js.replace(importTarget, importReplacement);
js = js.replace(importTargetEnd, importReplacementEnd);


// 6. JS: LOCALSTORAGE AUTOSAVE (Hook to periodic persist)
// The vanilla JS already has \`saveState()\` which saves to localStorage.
// We'll add a periodic autosave.
const initTarget = `async function init() {`;
const initReplacement = `async function init() {
  // Setup Virtual Keyboard
  renderVirtualKeyboard();
  // Auto-save every 5 seconds
  setInterval(() => {
    saveState();
  }, 5000);`;
js = js.replace(initTarget, initReplacement);


// 7. JS: VIRTUAL KEYBOARD
const keyboardLogic = `
let activeKeys = new Set();
function renderVirtualKeyboard() {
  const vk = document.getElementById('virtual-keyboard');
  if(!vk) return;
  const startNote = 48; // C3
  let html = '';
  for(let i = 0; i < 25; i++) {
    const note = startNote + i;
    const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
    const active = activeKeys.has(note);
    if(isBlack) {
      html += \`<div id="vk-\${note}" style="width:20px;height:50px;background:\${active ? '#ef4444' : '#1e293b'};margin:0 -10px;z-index:10;border:1px solid #0f172a;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer;"></div>\`;
    } else {
      html += \`<div id="vk-\${note}" style="width:30px;height:80px;background:\${active ? '#f87171' : '#f1f5f9'};border-right:1px solid #cbd5e1;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer;z-index:0;"></div>\`;
    }
  }
  vk.innerHTML = html;
}
function highlightKey(note, state) {
  if(state) activeKeys.add(note);
  else activeKeys.delete(note);
  renderVirtualKeyboard();
}
`;
js = js + keyboardLogic;

// 8. JS: Highlight keys on handleMidiMessage
const midiMessageTarget = `if (Settings.highlight) {
      highlightActiveElement(msgType, data1);
    }`;
const midiMessageReplacement = `if (Settings.highlight) {
      highlightActiveElement(msgType, data1);
    }
    if (msgType === 'note_on') highlightKey(data1, true);
    if (msgType === 'note_off') highlightKey(data1, false);`;
js = js.replace(midiMessageTarget, midiMessageReplacement);

// 9. MIDI LEARN logic
const handleMidiTarget = `function handleMidiMessage(portId, e) {
    const data = e.data;`;
const handleMidiReplacement = `let midiLearnTarget = null;
function activateMidiLearn(type, idx) {
  midiLearnTarget = { type, idx };
  toast("MIDI Learn active. Send a message...", "info");
}

function handleMidiMessage(portId, e) {
    const data = e.data;
    const isNoteOn = (data[0] & 0xF0) === 0x90;
    const isNoteOff = (data[0] & 0xF0) === 0x80;
    const isCC = (data[0] & 0xF0) === 0xB0;
    const data1 = data[1];
    
    if (midiLearnTarget) {
      const dev = getActiveDev();
      if(dev) {
        if(midiLearnTarget.type === 'knobs' && isCC) {
          dev.controls.knobs[midiLearnTarget.idx].cc = data1;
        } else if(midiLearnTarget.type === 'pads' && isNoteOn) {
          dev.controls.pads[midiLearnTarget.idx].note = data1;
        }
        midiLearnTarget = null;
        saveState();
        renderDeviceEditor();
        toast("Learned!", "success");
      }
    }
`;
js = js.replace(handleMidiTarget, handleMidiReplacement);

// Update Editor UI to include Learn button
const renderKnobTarget = `<input type="number" value="\${k.cc}" onchange="updateKnob(\${i}, 'cc', this.value)" style="width:50px;">`;
const renderKnobReplacement = `<input type="number" value="\${k.cc}" onchange="updateKnob(\${i}, 'cc', this.value)" style="width:50px;"><button onclick="activateMidiLearn('knobs', \${i})" style="font-size:0.6rem;padding:2px 4px;margin-left:4px;">Learn</button>`;
js = js.replace(renderKnobTarget, renderKnobReplacement);

const renderPadTarget = `<input type="number" value="\${p.note}" onchange="updatePad(\${i}, 'note', this.value)" style="width:50px;">`;
const renderPadReplacement = `<input type="number" value="\${p.note}" onchange="updatePad(\${i}, 'note', this.value)" style="width:50px;"><button onclick="activateMidiLearn('pads', \${i})" style="font-size:0.6rem;padding:2px 4px;margin-left:4px;">Learn</button>`;
js = js.replace(renderPadTarget, renderPadReplacement);

fs.writeFileSync('index.html', html);
fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('Vanilla patched successfully!');
