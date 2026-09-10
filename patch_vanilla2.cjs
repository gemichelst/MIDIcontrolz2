const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// 1. ADD MIDI PANIC TO TOPNAV HTML
const topnavTarget = `<div class="select-group">
          <label>Out</label>
          <select id="midi-out" onchange="onMidiOutChange(this.value)">
            <option value="">(None)</option>
          </select>
        </div>`;
const topnavReplacement = `<div class="select-group">
          <label>Out</label>
          <select id="midi-out" onchange="onMidiOutChange(this.value)">
            <option value="">(None)</option>
          </select>
        </div>
        <button class="btn sm danger" onclick="midiPanic()" style="margin-left:8px;" title="Send All Notes Off / All Sound Off">🛑 Panic</button>`;
html = html.replace(topnavTarget, topnavReplacement);

// 2. ADD SYSEX BULK & TEMPLATE RECEIVER TO HTML
const sysexPanelTarget = `<div class="sysex-area" id="device-sysex-cmds">
        <h3>Device Quick Commands</h3>
        <div id="device-quick-cmds-list" style="display:flex;gap:8px;flex-wrap:wrap;">
          <span style="font-size:0.8rem;color:var(--text3);">Select a device to see device-specific commands.</span>
        </div>
      </div>`;
const sysexPanelReplacement = `<div class="sysex-area" id="device-sysex-cmds">
        <h3>Device Quick Commands</h3>
        <div id="device-quick-cmds-list" style="display:flex;gap:8px;flex-wrap:wrap;">
          <span style="font-size:0.8rem;color:var(--text3);">Select a device to see device-specific commands.</span>
        </div>
      </div>
      
      <div class="sysex-area" style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:300px;border:1px solid var(--border);border-radius:6px;padding:12px;background:var(--surface2);">
          <h3 style="margin-top:0;font-size:1rem;">SysEx Bulk Queue</h3>
          <p style="font-size:0.8rem;color:var(--text3);margin-bottom:12px;">Queue multiple .syx files and send sequentially.</p>
          <input type="file" id="sysex-queue-input" accept=".syx,.sys" multiple style="display:none" onchange="handleSysexQueueFiles(event)">
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <button class="btn" onclick="document.getElementById('sysex-queue-input').click()">📁 Select Files</button>
            <button class="btn primary" onclick="sendSysexQueue()">▶ Send Queue</button>
          </div>
          <div id="sysex-queue-list" style="font-size:0.8rem;background:var(--surface3);padding:8px;border-radius:4px;min-height:60px;max-height:120px;overflow-y:auto;">
            <span style="color:var(--text3);">No files queued.</span>
          </div>
        </div>
        
        <div style="flex:1;min-width:300px;border:1px solid var(--border);border-radius:6px;padding:12px;background:var(--surface2);">
          <h3 style="margin-top:0;font-size:1rem;">Template Receive Manager</h3>
          <p style="font-size:0.8rem;color:var(--text3);margin-bottom:12px;">Incoming bulk SysEx templates from devices like Novation SL will appear here.</p>
          <div id="sysex-receive-list" style="display:flex;flex-direction:column;gap:8px;font-size:0.8rem;background:var(--surface3);padding:8px;border-radius:4px;min-height:95px;max-height:150px;overflow-y:auto;">
            <span style="color:var(--text3);text-align:center;padding-top:10px;">Waiting for dumps...</span>
          </div>
        </div>
      </div>`;
html = html.replace(sysexPanelTarget, sysexPanelReplacement);

// 3. ADD EXPORT .SYX BUTTON TO DEVICE MANAGER
const exportBtnTarget = `<button class="btn sm" onclick="exportDeviceJSON('\${dev.id}')">📤 Export</button>`;
const exportBtnReplacement = `<button class="btn sm" onclick="exportDeviceJSON('\${dev.id}')">📤 .json</button>
        <button class="btn sm" onclick="exportDeviceSyx('\${dev.id}')">📤 .syx</button>`;
js = js.replace(exportBtnTarget, exportBtnReplacement);

// 4. JS: MIDI PANIC LOGIC
const jsPanic = `
function midiPanic() {
  if (!State.midiOut) {
    toast("No MIDI Out selected", "error");
    return;
  }
  for (let ch = 0; ch < 16; ch++) {
    State.midiOut.send([0xB0 + ch, 120, 0]); // All Sound Off
    State.midiOut.send([0xB0 + ch, 123, 0]); // All Notes Off
    State.midiOut.send([0xB0 + ch, 64, 0]);  // Sustain off
  }
  toast("MIDI Panic: All Notes & Sound Off sent", "info");
}
`;
js = js + jsPanic;

// 5. JS: SYSEX BULK & RECEIVE LOGIC
const jsSysexFeatures = `
let sysexQueue = [];
let receivedTemplates = [];

function handleSysexQueueFiles(evt) {
  const files = Array.from(evt.target.files);
  if(files.length > 0) {
    sysexQueue = files;
    renderSysexQueue();
  }
}

function renderSysexQueue() {
  const container = document.getElementById('sysex-queue-list');
  if(!container) return;
  if(sysexQueue.length === 0) {
    container.innerHTML = '<span style="color:var(--text3);">No files queued.</span>';
    return;
  }
  container.innerHTML = sysexQueue.map(f => \`<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding:4px 0;"><span>\${f.name}</span><span style="opacity:0.6">\${(f.size/1024).toFixed(1)} KB</span></div>\`).join('');
}

async function sendSysexQueue() {
  if (!State.midiOut) return toast("No MIDI Out selected", "error");
  if (sysexQueue.length === 0) return toast("No files queued", "error");
  
  toast(\`Sending \${sysexQueue.length} files...\`, "info");
  for (let i=0; i<sysexQueue.length; i++) {
    const file = sysexQueue[i];
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    State.midiOut.send(data);
    await new Promise(r => setTimeout(r, 200)); // Delay for buffer
  }
  toast("SysEx Queue sent successfully!", "success");
  sysexQueue = [];
  renderSysexQueue();
}

function renderReceivedTemplates() {
  const container = document.getElementById('sysex-receive-list');
  if(!container) return;
  if(receivedTemplates.length === 0) {
    container.innerHTML = '<span style="color:var(--text3);text-align:center;padding-top:10px;">Waiting for dumps...</span>';
    return;
  }
  container.innerHTML = receivedTemplates.map((tmpl, i) => \`
    <div style="background:var(--surface2);border:1px solid var(--border);padding:6px;border-radius:4px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-weight:bold;">
        <span>Captured Template \${i+1}</span>
        <span style="opacity:0.6">\${tmpl.length} bytes</span>
      </div>
      <div style="display:flex;gap:4px;">
        <button class="btn sm" style="flex:1;" onclick="sendCapturedTemplate(\${i})">▶ Send Back</button>
        <button class="btn sm" style="flex:1;" onclick="downloadCapturedTemplate(\${i})">💾 Save .syx</button>
      </div>
    </div>
  \`).join('');
}

function sendCapturedTemplate(i) {
  if (!State.midiOut) return toast("No MIDI Out selected", "error");
  State.midiOut.send(receivedTemplates[i]);
  toast("Template sent", "info");
}

function downloadCapturedTemplate(i) {
  const data = receivedTemplates[i];
  const blob = new Blob([data], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; 
  a.download = \`captured_template_\${i+1}.syx\`;
  a.click();
  URL.revokeObjectURL(url);
}

// Hook into SysEx listener to capture templates (like Novation Dumps)
const originalHandleMidiMessage = handleMidiMessage;
handleMidiMessage = function(portId, e) {
  const data = e.data;
  if(data[0] === 0xF0 && data.length > 50) {
    // Looks like a bulk dump
    receivedTemplates.push(data);
    renderReceivedTemplates();
    toast("SysEx Template Captured", "info");
  }
  originalHandleMidiMessage(portId, e);
};
`;
js = js + jsSysexFeatures;

// 6. JS: EXPORT DEVICE SYX LOGIC
const jsExportSyx = `
function exportDeviceSyx(id) {
  const dev = State.devices.find(d => d.id === id);
  if (!dev) return;
  const jsonStr = JSON.stringify(dev);
  const jsonBytes = new TextEncoder().encode(jsonStr);
  
  // Custom non-commercial SysEx header: F0 7D (Educational)
  const syx = new Uint8Array(jsonBytes.length + 3);
  syx[0] = 0xF0; 
  syx[1] = 0x7D;
  syx.set(jsonBytes, 2);
  syx[syx.length - 1] = 0xF7;
  
  const blob = new Blob([syx], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; 
  a.download = (dev.name || "preset").replace(/\\s+/g, '_') + ".syx";
  a.click();
  URL.revokeObjectURL(url);
}
`;
js = js + jsExportSyx;

// 7. HTML: MOBILE SIDEBAR TOGGLE
// The original layout uses `#sidebar` and `.sidebar`. Let's add a toggle button to topnav for mobile.
const topNavBurgerTarget = `<div class="brand">`;
const topNavBurgerReplacement = `<button class="btn sm" id="mobile-menu-btn" onclick="document.getElementById('sidebar').classList.toggle('open')" style="margin-right:8px;font-size:1.2rem;padding:2px 8px;background:transparent;border:none;color:var(--text);">☰</button>
        <div class="brand">`;
html = html.replace(topNavBurgerTarget, topNavBurgerReplacement);

// Ensure CSS exists to hide/show sidebar on mobile
const cssSidebarTarget = `</head>`;
const cssSidebarReplacement = `  <style>
    @media (max-width: 768px) {
      #mobile-menu-btn { display: inline-block !important; }
      #sidebar { 
        position: absolute; 
        z-index: 100; 
        left: 0; 
        top: 60px; /* height of topnav */
        bottom: 0;
        transform: translateX(-100%); 
        transition: transform 0.3s ease; 
        box-shadow: 2px 0 10px rgba(0,0,0,0.5);
      }
      #sidebar.open { transform: translateX(0); }
    }
    @media (min-width: 769px) {
      #mobile-menu-btn { display: none !important; }
    }
  </style>
</head>`;
html = html.replace(cssSidebarTarget, cssSidebarReplacement);

// 8. Make sure closing sidebar on mobile works when clicking a menu item
const navItemTarget = `<button class="nav-item active" onclick="showPanel('editor')">`;
const navItemReplacement = `<button class="nav-item active" onclick="showPanel('editor');document.getElementById('sidebar').classList.remove('open')">`;
html = html.replace(navItemTarget, navItemReplacement);

const navItemMonitorTarget = `<button class="nav-item" onclick="showPanel('monitor')">`;
const navItemMonitorReplacement = `<button class="nav-item" onclick="showPanel('monitor');document.getElementById('sidebar').classList.remove('open')">`;
html = html.replace(navItemMonitorTarget, navItemMonitorReplacement);

const navItemSysexTarget = `<button class="nav-item" onclick="showPanel('sysex')">`;
const navItemSysexReplacement = `<button class="nav-item" onclick="showPanel('sysex');document.getElementById('sidebar').classList.remove('open')">`;
html = html.replace(navItemSysexTarget, navItemSysexReplacement);

const navItemSettingsTarget = `<button class="nav-item" onclick="showPanel('settings')">`;
const navItemSettingsReplacement = `<button class="nav-item" onclick="showPanel('settings');document.getElementById('sidebar').classList.remove('open')">`;
html = html.replace(navItemSettingsTarget, navItemSettingsReplacement);

fs.writeFileSync('index.html', html);
fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('Vanilla patched part 2 successfully!');
