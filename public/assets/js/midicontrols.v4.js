let activeKeys = new Set();
/* =============================================================
   MidiControls v2 — assets/js/midicontrols.v2.js
   Full application logic — WebMIDI · Device Editor · Monitor
   SysEx · Backup · Device Manager · Settings · MIDI Learn
   ============================================================= */

/* ═══════════════════════════════════════════════════════════
   PWA — Install prompt + Service Worker registration
════════════════════════════════════════════════════════════ */

// ── Service Worker ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] registered, scope:', reg.scope))
      .catch(err => console.warn('[SW] registration failed:', err));
  });
}

// ── PWA Install prompt state ────────────────────────────────
let _pwaInstallEvent = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _pwaInstallEvent = e;

  // Show topnav install button
  const btn = document.getElementById('btn-pwa-install');
  if (btn) btn.removeAttribute('hidden');

  // Show settings panel install button
  const btnS = document.getElementById('btn-pwa-install-settings');
  if (btnS) btnS.removeAttribute('hidden');

  // Show mobile banner (only if not dismissed this session)
  if (!sessionStorage.getItem('pwa_banner_dismissed')) {
    showPwaBanner();
  }
});

window.addEventListener('appinstalled', () => {
  _pwaInstallEvent = null;
  hidePwaBannerAndButtons();
  const note = document.getElementById('pwa-installed-note');
  if (note) note.removeAttribute('hidden');
  toast('MidiControls installed ✓', 'success');
});

function triggerPwaInstall() {
  if (!_pwaInstallEvent) {
    // Fallback: guide user manually
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) {
      toast('Tap the Share button → "Add to Home Screen" to install', 'info');
    } else {
      toast('Look for the install icon ⊕ in your browser address bar', 'info');
    }
    return;
  }
  _pwaInstallEvent.prompt();
  _pwaInstallEvent.userChoice.then(result => {
    if (result.outcome === 'accepted') {
      hidePwaBannerAndButtons();
      toast('Installing MidiControls…', 'success');
    } else {
      toast('Install dismissed — you can install anytime from Settings', 'info');
    }
    _pwaInstallEvent = null;
  });
}

function showPwaBanner() {
  const banner = document.getElementById('pwa-banner');
  if (!banner) return;
  banner.removeAttribute('hidden');
  banner.classList.add('visible');
  // Push content down so banner doesn't overlap
  document.getElementById('app').style.paddingTop =
    banner.offsetHeight + 'px';
}

function dismissPwaBanner() {
  hidePwaBanner();
  sessionStorage.setItem('pwa_banner_dismissed', '1');
}

function hidePwaBanner() {
  const banner = document.getElementById('pwa-banner');
  if (!banner) return;
  banner.setAttribute('hidden', '');
  banner.classList.remove('visible');
  document.getElementById('app').style.paddingTop = '';
}

function hidePwaBannerAndButtons() {
  hidePwaBanner();
  const btn  = document.getElementById('btn-pwa-install');
  const btnS = document.getElementById('btn-pwa-install-settings');
  if (btn)  btn.setAttribute('hidden', '');
  if (btnS) btnS.setAttribute('hidden', '');
}



'use strict';

// ============================================================
//  DEVICE MANIFEST — add folder name here to register a device
// ============================================================
const DEVICE_MANIFEST = [
  'akai_lpd8_v1',
  'akai_midimix',
  'novation_launchcontrol_mk1',
  'novation_nocturn',
  'novation_remote_zero_sl_mk1',
  'novation_remote25_sl_compact_mk1'
];

// ============================================================
//  STATE
// ============================================================
const State = {
  devices:          [],
  activeDeviceId:   null,
  activePresetIndex: 0,
  midiAccess:       null,
  midiIn:           null,
  midiOut:          null,
  monitorMsgs:      [],
  monitorPaused:    false,
  settings: {
    thru: false, highlight: true, autorefresh: true,
    notenames: true, hex: false, compact: false
  },
  backups:    [],
  liveValues: {}   // { "cc_CH_NUM": 0-127, "note_CH_NUM": 0-127 }
};

// ============================================================
//  NOTE NAMES
// ============================================================
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function noteName(n) {
  if (!State.settings.notenames) return String(n);
  const oct = Math.floor(n / 12) - 1;
  return `${NOTE_NAMES[n % 12]}${oct}`;
}

// ============================================================
//  PERSIST
// ============================================================
function saveState() {
  const overrides = {};
  State.devices.forEach(d => { overrides[d.id] = d.defaultPresets; });
  localStorage.setItem('mc_presets',      JSON.stringify(overrides));
  localStorage.setItem('mc_backups',      JSON.stringify(State.backups));
  localStorage.setItem('mc_settings',     JSON.stringify(State.settings));
  const userDevices = State.devices.filter(d => !DEVICE_MANIFEST.includes(d.id));
  localStorage.setItem('mc_user_devices', JSON.stringify(userDevices));
}
const save = saveState; // alias

// ============================================================
//  LOAD DEVICES — async fetch from devices/FOLDER/device.json
// ============================================================
async function loadDevices() {
  // document.getElementById('device-list').innerHTML =
  //   '<div style="padding:8px 12px;font-size:0.75rem;color:var(--text3);">Loading devices…</div>';
  // const container = document.getElementById('device-list');
  // if (!container) {
  //   console.warn('[loadDevices] #device-list not found in DOM yet');
  //   return;
  // }
  // container.innerHTML = buildDeviceHTML(); // your existing logic

  const fetches = DEVICE_MANIFEST.map(async folder => {
    try {
      const res = await fetch(`devices/${folder}/device.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[MidiControls] Could not load devices/${folder}/device.json —`, e.message);
      return null;
    }
  });

  const loaded = (await Promise.all(fetches)).filter(Boolean);

  // User-added devices from localStorage
  try {
    const ud = localStorage.getItem('mc_user_devices');
    if (ud) {
      JSON.parse(ud).forEach(dev => {
        if (!loaded.find(d => d.id === dev.id)) loaded.push(dev);
      });
    }
  } catch(e) { console.warn('mc_user_devices parse error', e); }

  // Merge saved preset overrides
  try {
    const po = localStorage.getItem('mc_presets');
    if (po) {
      const overrides = JSON.parse(po);
      loaded.forEach(dev => {
        if (overrides[dev.id]) dev.defaultPresets = overrides[dev.id];
      });
    }
  } catch(e) { console.warn('mc_presets parse error', e); }

  // Backups + settings
  try {
    const b = localStorage.getItem('mc_backups');
    if (b) State.backups = JSON.parse(b);
    const s = localStorage.getItem('mc_settings');
    if (s) State.settings = { ...State.settings, ...JSON.parse(s) };
  } catch(e) {}

  State.devices = loaded;

  if (!loaded.length) showNoDevicesWarning();
  return loaded;
}

function showNoDevicesWarning() {
  document.getElementById('editor-welcome').innerHTML = `
    <div class="big-icon">⚠️</div>
    <h2>Devices could not be loaded</h2>
    <p>
      <strong>fetch()</strong> is blocked when opening as a <code>file://</code> URL.<br><br>
      Start a local HTTP server:<br><br>
      <code style="background:var(--surface2);padding:6px 12px;border-radius:6px;
        display:inline-block;margin:4px 0;">npx serve .</code><br>
      <code style="background:var(--surface2);padding:6px 12px;border-radius:6px;
        display:inline-block;margin:4px 0;">python3 -m http.server 8080</code><br><br>
      Then open <strong>http://localhost:8080</strong><br><br>
      Or drag &amp; drop a <code>device.json</code> onto this page to import directly.
    </p>`;
}

// ── Device dropdown sync ─────────────────────────────────────
// Call this after loadDevices() populates State.devices
function populateDeviceDropdown() {
  const sel = document.getElementById('device-select');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">— Select Device —</option>';
  State.devices.forEach(dev => {
    const opt = document.createElement('option');
    opt.value       = dev.id;
    opt.textContent = `${dev.icon || '🎹'} ${dev.name}`;
    if (dev.id === current || dev.id === State.activeDeviceId) opt.selected = true;
    sel.appendChild(opt);
  });
}

function onDeviceSelectChange(id) {
  if (!id) return;
  selectDevice(id);
}

// ============================================================
//  PANEL SWITCHING
// ============================================================
function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const targetPanel = document.getElementById(`panel-${name}`);
  if (!targetPanel) return;
  targetPanel.classList.add('active');
  
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById(`tab-${name}`);
  if (tab) tab.classList.add('active');
  
  try {
    if (name === 'backup')   renderBackupList();
    if (name === 'manager')  renderDeviceManager();
    if (name === 'settings') renderSettings();
    if (name === 'editor')   {
        if (State.activeDeviceId) renderDeviceEditor();
    }
  } catch (e) {
    console.error('Error rendering panel ' + name, e);
    targetPanel.innerHTML = `
      <div style="padding: 20px; background: rgba(220,38,38,0.1); border: 1px solid #dc2626; border-radius: 8px; text-align: center;">
        <h3 style="color: #ef4444; margin-bottom: 12px;">⚠️ Failed to load ${name} panel</h3>
        <p style="font-size: 0.85rem; color: var(--text2); margin-bottom: 16px;">An unexpected rendering error occurred.</p>
        <button class="btn sm" onclick="showPanel('${name}')">↻ Retry</button>
      </div>
    `;
  }
}

// ============================================================
//  SIDEBAR
// ============================================================
function renderSidebar() {
  const el = document.getElementById('device-list');
  el.innerHTML = '';
  State.devices.forEach(dev => {
    const isConn = !!(State.midiIn && (dev.midiName || [])
      .some(n => State.midiIn.name.includes(n)));
    const card = document.createElement('div');
    card.className = 'device-card' + (State.activeDeviceId === dev.id ? ' active' : '');
    card.innerHTML = `
      <div class="device-icon">${dev.icon || '🎹'}</div>
      <div>
        <div class="dname">${dev.name}</div>
        <div class="dmfr">${dev.manufacturer || ''}</div>
      </div>
      <div class="dstatus ${isConn ? 'on' : ''}"></div>`;
    card.onclick = () => selectDevice(dev.id);
    el.appendChild(card);
  });
}

function selectDevice(id) {
  State.activeDeviceId    = id;
  State.activePresetIndex = 0;
  populateDeviceDropdown();
  renderDeviceEditor();
  renderSysExQuickCmds();
}

// ============================================================
//  HELPERS
// ============================================================
function getActiveDev()    { return State.devices.find(d => d.id === State.activeDeviceId); }
function getActivePreset() {
  const dev = getActiveDev(); if (!dev) return null;
  return (dev.defaultPresets || [])[State.activePresetIndex] || null;
}

// ============================================================
//  DEVICE EDITOR — master render
// ============================================================
function renderDeviceEditor() {
  const welcome   = document.getElementById('editor-welcome');
  const container = document.getElementById('editor-device');
  const dev = getActiveDev();
  if (!dev) { welcome.style.display = ''; container.style.display = 'none'; return; }
  welcome.style.display = 'none';
  container.style.display = '';
  renderVirtualKeyboard();
  if (typeof renderMacros === "function") renderMacros();

  const presets = dev.defaultPresets || [];
  const preset  = presets[State.activePresetIndex] || {};
  const ch      = (preset.channel ?? 0) + 1;

  let html = `
  <div class="device-header">
    <div class="device-thumb" style="border-color:${dev.color || 'var(--border)'}">
      ${dev.icon || '🎹'}
    </div>
    <div class="device-info">
      <h1>${dev.name}</h1>
      <div class="mfr">${dev.manufacturer || ''} — ${dev.description || ''}</div>
      <div class="device-actions">
        <button class="btn primary" onclick="readFromDevice()">⬇ Read Device</button>
        <button class="btn success" onclick="writeToDevice()">⬆ Write Device</button>
        <button class="btn" onclick="document.getElementById('import-device-input').click()">📥 Import</button>
        <button class="btn" onclick="exportPresetJSON()">📤 Export JSON</button>
        <button class="btn" onclick="exportDeviceSyx('${dev.id}')">📤 Export .syx</button>
        <button class="btn" onclick="saveBackup()">💾 Backup</button>
        <button class="btn" onclick="copyCCMap()">📋 Copy CC Map</button>
      </div>
    </div>
  </div>`;

  // Preset tabs
  if (presets.length > 1) {
    html += `<div class="preset-tabs">`;
    presets.forEach((p, i) => {
      html += `<button class="preset-tab ${i === State.activePresetIndex ? 'active' : ''}" onmouseenter="showPresetPreview(event, ${i})" onmouseleave="hidePresetPreview()" onmousemove="showPresetPreview(event, ${i})" 
        onclick="selectPreset(${i})">${p.name || `Preset ${i+1}`}</button>`;
    });
    html += `</div>`;
  }

  // Channel bar
  html += `
  <div class="channel-bar" style="display:flex;align-items:center;gap:12px;background:var(--surface2);padding:10px;border-radius:6px;margin-bottom:20px;">
    <label style="font-weight:bold;">MIDI Channel:</label>
    <select onchange="setPresetChannel(this.value)" style="background:var(--surface3);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:4px;">
      ${Array.from({length:16},(_,i) =>
        `<option value="${i}" ${preset.channel === i ? 'selected' : ''}>Ch ${i+1}</option>`
      ).join('')}
    </select>
    
    <div style="width:1px;height:24px;background:var(--border);margin:0 4px;"></div>
    
    <button class="btn sm" onclick="savePresetVersion()">💾 Save Version</button>
    
    
    <span style="font-size:0.8rem;color:var(--accent);margin-left:auto;font-weight:bold;">v${preset.version || 1}</span>
    
    <span style="font-size:0.75rem;color:var(--text3);margin-left:12px;">
      ${dev.sysex ? '⚡ SysEx supported' : '— No SysEx'}
    </span>
  </div>`;

  const ctrl = dev.controls || {};

  // ── PADS ──────────────────────────────────────────────────
  if (ctrl.pads && ctrl.pads.length) {
    html += sectionHeader('Pads');
    html += `<div class="controls-grid">`;
    ctrl.pads.forEach((pad, pi) => {
      const pd = (preset.pads && preset.pads[pi]) ? { ...pad, ...preset.pads[pi] } : pad;
      const isToggle = (pd.mode || 'Momentary') === 'Toggle';
      html += `
      <div class="ctrl-pad" id="ctrl-pad-${pi}">
        <div class="pad-label">
          <span>${pd.label}</span>
          <button class="midi-learn-btn" onclick="startMidiLearn('pad','${pi}',this)">LEARN</button>
        </div>
        <div class="pad-surface">
          <span class="note-display">${noteName(pd.note ?? 36)} · vel</span>
        </div>
        <div class="ctrl-row">
          <label>Note</label>
          <input type="number" min="0" max="127" value="${pd.note ?? 36}"
            onchange="updatePad(${pi},'note',this.value)">
        </div>
        <div class="ctrl-row">
          <label>CC</label>
          <input type="number" min="0" max="127" value="${pd.cc ?? 0}"
            onchange="updatePad(${pi},'cc',this.value)">
        </div>
        <div class="ctrl-row">
          <label>PC</label>
          <input type="number" min="0" max="127" value="${pd.pc ?? 0}"
            onchange="updatePad(${pi},'pc',this.value)">
        </div>
        <button class="mode-toggle ${isToggle ? 'toggle-mode' : ''}"
          onclick="togglePadMode(${pi},this)">
          ${isToggle ? '⊙ Toggle' : '◉ Momentary'}
        </button>
      </div>`;
    });
    html += `</div>`;
  }

  // ── KNOBS ─────────────────────────────────────────────────
  if (ctrl.knobs && ctrl.knobs.length) {
    html += sectionHeader('Knobs / Encoders');
    html += `<div class="controls-grid">`;
    ctrl.knobs.forEach((knob, ki) => {
      const kd  = (preset.knobs && preset.knobs[ki]) ? { ...knob, ...preset.knobs[ki] } : knob;
      const val = State.liveValues[`cc_${(preset.channel ?? 0)}_${kd.cc}`] ?? 0;
      const deg = Math.round((val / 127) * 270 - 135);
      html += `
      <div class="ctrl-knob">
        <div class="knob-label" style="display:flex; justify-content:space-between; align-items:center; padding:0 4px;">
          <span>${kd.label}</span>
          <button class="midi-learn-btn" onclick="startMidiLearn('knob','${ki}',this)" style="font-size:0.5rem; padding:1px 4px; opacity:0.7;">LEARN</button>
        </div>
        <div class="knob-vis" id="knob-vis-${ki}"
          data-ki="${ki}" data-val="${val}"
          style="transform:rotate(${deg}deg)"
          onmousedown="knobMouseDown(event,${ki})"
          title="Drag up/down · CC ${kd.cc}">${val}
        </div>
        <div class="ctrl-row">
          <label>CC</label>
          <input type="number" min="0" max="127" value="${kd.cc ?? 0}"
            onchange="updateKnob(${ki},'cc',this.value)">
        </div>
        <div class="knob-range">
          <input type="number" min="0" max="127" value="${kd.lo ?? 0}"
            onchange="updateKnob(${ki},'lo',this.value)" title="Lo">
          <input type="number" min="0" max="127" value="${kd.hi ?? 127}"
            onchange="updateKnob(${ki},'hi',this.value)" title="Hi">
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  // ── FADERS ────────────────────────────────────────────────
  if (ctrl.faders && ctrl.faders.length) {
    html += sectionHeader('Faders');
    html += `<div class="controls-grid">`;
    ctrl.faders.forEach((fdr, fi) => {
      const fd  = (preset.faders && preset.faders[fi]) ? { ...fdr, ...preset.faders[fi] } : fdr;
      const val = State.liveValues[`cc_${(preset.channel ?? 0)}_${fd.cc}`] ?? 0;
      const pct = Math.round((val / 127) * 100);
      html += `
      <div class="ctrl-fader">
        <div class="fader-label">${fd.label}</div>
        <div class="fader-track">
          <div class="fader-fill" style="height:${pct}%"></div>
          <div class="fader-thumb" style="bottom:${pct}%"></div>
        </div>
        <div class="fader-cc">CC ${fd.cc}</div>
        <div class="fader-val">${val}</div>
      </div>`;
    });
    html += `</div>`;
  }

  // ── BUTTONS / LEDs ────────────────────────────────────────
  if (ctrl.buttons && ctrl.buttons.length) {
    html += sectionHeader('Buttons / LEDs');
    html += `<div class="controls-grid">`;
    ctrl.buttons.forEach((btn, bi) => {
      const bd    = (preset.buttons && preset.buttons[bi]) ? { ...btn, ...preset.buttons[bi] } : btn;
      const color = bd.color || 'green';
      html += `
      <div class="ctrl-button" id="ctrl-btn-${bi}">
        <div class="btn-surface led-off" id="led-${bi}"
          onclick="triggerButton(${bi})"
          title="Click to send Note ${bd.note ?? 0}">
          <span style="font-size:0.65rem;color:rgba(255,255,255,0.4)">▶</span>
        </div>
        <div style="font-size:0.7rem;font-weight:600;margin-bottom:4px;">${bd.label}</div>
        <div class="ctrl-row">
          <label>Note</label>
          <input type="number" min="0" max="127" value="${bd.note ?? 0}"
            onchange="updateButton(${bi},'note',this.value)">
        </div>
        <div class="ctrl-row">
          <label>CC</label>
          <input type="number" min="0" max="127" value="${bd.cc ?? 0}"
            onchange="updateButton(${bi},'cc',this.value)">
        </div>
        <div style="display:flex;gap:4px;margin-top:4px;">
          ${['red','green','amber'].map(c =>
            `<button class="btn sm" style="padding:2px 6px;${color===c?'outline:2px solid var(--text);':''}"
              onclick="setButtonColor(${bi},'${c}')">${c[0].toUpperCase()}</button>`
          ).join('')}
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  // JSON EDITOR & Import/Export .syx SECTION
  html += sectionHeader('JSON Config Draft (Hardware Mapping Editor)');
  html += `
    <div style="display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; gap:8px; justify-content:space-between; margin-bottom:4px;">
        <div style="font-size:0.8rem;color:var(--text3);">Edit JSON below or use UI controls.</div>
        <div style="display:flex; gap:8px;">
          <button class="btn sm" onclick="document.getElementById('import-device-input').click()">📥 Import from .syx</button>
          <button class="btn sm" onclick="exportDeviceSyx('${dev.id}')">📤 Export as .syx</button>
        </div>
      </div>
      <textarea id="json-editor-textarea" style="width:100%; height:200px; font-family:monospace; font-size:0.8rem; padding:8px; background:var(--surface2); color:var(--text); border:1px solid var(--border); border-radius:4px; outline:none; resize:vertical;" oninput="validateJsonEditor()"></textarea>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span id="json-editor-error" style="color:var(--accent); font-size:0.85rem; font-weight:600;"></span>
        <button id="json-editor-save-btn" class="btn primary sm" onclick="saveJsonEditor()">Save JSON Preset</button>
      </div>
    </div>
  `;

  
  const historyHtml = (preset.history || []).map((h, i) => `
    <div style="background:var(--surface2); padding:8px; border-radius:6px; margin-bottom:8px; border:1px solid var(--border);">
      <div style="font-size:0.85rem; font-weight:bold; color:var(--text);">Version ${h.version}</div>
      <div style="font-size:0.7rem; color:var(--text3); margin-bottom:6px;">${new Date(h.timestamp).toLocaleString()}</div>
      <button class="btn sm" onclick="restoreHistoryVersion(${i})" style="width:100%; justify-content:center;">↩ Restore</button>
    </div>
  `).join('');

  const finalHtml = `
    <div style="display:grid; grid-template-columns: 1fr 240px; gap:20px; align-items:start;">
      <div style="min-width:0;">${html}</div>
      <div style="background:var(--surface3); border:1px solid var(--border); border-radius:8px; padding:12px; position:sticky; top:20px;">
        <h3 style="font-size:1rem; margin-top:0; margin-bottom:12px;">Version History</h3>
        <p style="font-size:0.75rem; color:var(--text3); margin-bottom:12px;">Click 'Save Version' in the channel bar to snapshot your mappings.</p>
        <div style="max-height:600px; overflow-y:auto;">${historyHtml || '<div style="font-size:0.75rem; color:var(--text3);">No history saved.</div>'}</div>
      </div>
    </div>
  `;
  container.innerHTML = finalHtml;


  // Populate JSON Editor after render
  setTimeout(() => {
    const ta = document.getElementById('json-editor-textarea');
    if (ta) ta.value = JSON.stringify(dev, null, 2);
    validateJsonEditor();
  }, 0);
}

function sectionHeader(title) {
  return `<div class="section-header">
    <h3>${title}</h3><div class="section-line"></div>
  </div>`;
}

// ============================================================
//  PRESET / CONTROL MUTATIONS
// ============================================================
function selectPreset(i) {
  State.activePresetIndex = i;
  renderDeviceEditor();
}

function setPresetChannel(val) {
  const dev = getActiveDev(); if (!dev) return;
  ensurePreset(dev);
  dev.defaultPresets[State.activePresetIndex].channel = parseInt(val);
  save();
}

function ensurePreset(dev) {
  if (!dev.defaultPresets) dev.defaultPresets = [];
  if (!dev.defaultPresets[State.activePresetIndex])
    dev.defaultPresets[State.activePresetIndex] = { name: `Preset ${State.activePresetIndex+1}`, channel: 0 };
}

function ensurePadArray(dev) {
  ensurePreset(dev);
  const p = dev.defaultPresets[State.activePresetIndex];
  if (!p.pads) p.pads = (dev.controls.pads || []).map(pd => ({ ...pd }));
}

function ensureKnobArray(dev) {
  ensurePreset(dev);
  const p = dev.defaultPresets[State.activePresetIndex];
  if (!p.knobs) p.knobs = (dev.controls.knobs || []).map(k => ({ ...k }));
}

function ensureButtonArray(dev) {
  ensurePreset(dev);
  const p = dev.defaultPresets[State.activePresetIndex];
  if (!p.buttons) p.buttons = (dev.controls.buttons || []).map(b => ({ ...b }));
}

function updatePad(pi, field, val) {
  const dev = getActiveDev(); if (!dev) return;
  ensurePadArray(dev);
  const p = dev.defaultPresets[State.activePresetIndex];
  p.pads[pi] = p.pads[pi] || {};
  p.pads[pi][field] = field === 'mode' ? val : parseInt(val);
  // update note display live
  if (field === 'note') {
    const ns = document.querySelector(`#ctrl-pad-${pi} .note-display`);
    if (ns) ns.textContent = `${noteName(parseInt(val))} · vel`;
  }
  save();
}

function togglePadMode(pi, btn) {
  const dev = getActiveDev(); if (!dev) return;
  ensurePadArray(dev);
  const p   = dev.defaultPresets[State.activePresetIndex];
  p.pads[pi]      = p.pads[pi] || {};
  const isToggle  = (p.pads[pi].mode || 'Momentary') === 'Momentary';
  p.pads[pi].mode = isToggle ? 'Toggle' : 'Momentary';
  btn.textContent = isToggle ? '⊙ Toggle' : '◉ Momentary';
  btn.classList.toggle('toggle-mode', isToggle);
  save();
}

function updateKnob(ki, field, val) {
  const dev = getActiveDev(); if (!dev) return;
  ensureKnobArray(dev);
  const p = dev.defaultPresets[State.activePresetIndex];
  p.knobs[ki]       = p.knobs[ki] || {};
  p.knobs[ki][field] = parseInt(val);
  save();
}

function updateButton(bi, field, val) {
  const dev = getActiveDev(); if (!dev) return;
  ensureButtonArray(dev);
  const p = dev.defaultPresets[State.activePresetIndex];
  p.buttons[bi]        = p.buttons[bi] || {};
  p.buttons[bi][field] = parseInt(val);
  save();
}

function setButtonColor(bi, color) {
  const dev = getActiveDev(); if (!dev) return;
  ensureButtonArray(dev);
  dev.defaultPresets[State.activePresetIndex].buttons[bi].color = color;
  save();
  renderDeviceEditor();
}

// Trigger button — send Note On then Note Off
function triggerButton(bi) {
  const dev = getActiveDev(); if (!dev) return;
  const p   = getActivePreset();
  const btn = (p?.buttons && p.buttons[bi]) || (dev.controls.buttons || [])[bi];
  if (!btn) return;
  const ch    = p?.channel ?? 0;
  const note  = btn.note ?? 0;
  const color = btn.color || 'green';
  // Visual flash
  const led = document.getElementById(`led-${bi}`);
  if (led) {
    led.className = `btn-surface led-${color}`;
    setTimeout(() => { if(led) led.className = 'btn-surface led-off'; }, 150);
  }
  if (!State.midiOut) { toast('No MIDI Out connected', 'error'); return; }
  sendMidiOut([0x90 | ch, note, 127]);
  setTimeout(() => sendMidiOut([0x80 | ch, note, 0]), 100);
}

// ============================================================
//  KNOB DRAG — mouse interaction
// ============================================================
let _knobDrag = null;

function knobMouseDown(e, ki) {
  _knobDrag = { ki, startY: e.clientY, startVal: parseInt(
    document.getElementById(`knob-vis-${ki}`)?.dataset.val ?? '0'
  )};
  document.addEventListener('mousemove', knobMouseMove);
  document.addEventListener('mouseup',   knobMouseUp);
  e.preventDefault();
}

function knobMouseMove(e) {
  if (!_knobDrag) return;
  const { ki, startY, startVal } = _knobDrag;
  const delta = startY - e.clientY;  // drag up = increase
  const newVal = Math.max(0, Math.min(127, startVal + Math.round(delta * 0.8)));
  const el = document.getElementById(`knob-vis-${ki}`);
  if (el) {
    const deg = Math.round((newVal / 127) * 270 - 135);
    el.style.transform = `rotate(${deg}deg)`;
    el.textContent     = newVal;
    el.dataset.val     = newVal;
  }
  // Send CC live
  const dev = getActiveDev(); if (!dev) return;
  const p   = getActivePreset();
  const kd  = (p?.knobs && p.knobs[ki]) || (dev.controls.knobs || [])[ki];
  if (!kd) return;
  const ch = p?.channel ?? 0;
  State.liveValues[`cc_${ch}_${kd.cc}`] = newVal;
  if (State.midiOut) sendMidiOut([0xB0 | ch, kd.cc, newVal]);
}

function knobMouseUp() {
  _knobDrag = null;
  document.removeEventListener('mousemove', knobMouseMove);
  document.removeEventListener('mouseup',   knobMouseUp);
}

// ============================================================
//  MIDI LEARN
// ============================================================
let _learnTarget = null;

function startMidiLearn(type, index, btn) {
  if (_learnTarget) {
    // Cancel existing learn
    if (_learnTarget.btn) _learnTarget.btn.classList.remove('learning');
    const oldSvg = document.getElementById('svg-' + _learnTarget.type + '-' + _learnTarget.index);
    if (oldSvg) oldSvg.classList.remove('svg-learning');
    _learnTarget = null;
    return;
  }
  _learnTarget = { type, index: parseInt(index), btn };
  btn.classList.add('learning');
  const svgEl = document.getElementById('svg-' + type + '-' + index);
  if (svgEl) svgEl.classList.add('svg-learning');
  toast(`MIDI Learn active — press a pad/key on your hardware`, 'info');
}

function handleMidiLearn(data) {
  if (!_learnTarget) return;
  const status = data[0];
  const type   = status >> 4;
  const ch     = status & 0x0F;
  const dev    = getActiveDev();
  if (!dev) { cancelLearn(); return; }

  
  if (type === 0x9 && data[2] > 0) {
    data[2] = typeof applyVelocityCurve === 'function' ? applyVelocityCurve(data[2]) : data[2];

    // Note On — map to pad
    if (_learnTarget.type === 'pad') {
      ensurePadArray(dev);
      const p  = dev.defaultPresets[State.activePresetIndex];
      const pi = _learnTarget.index;
      p.pads[pi]      = p.pads[pi] || {};
      p.pads[pi].note = data[1];
      save();
      renderDeviceEditor();
      toast(`Pad ${pi+1} → Note ${noteName(data[1])} (${data[1]}) on Ch ${ch+1} ✓`, 'success');
    }
  } else if (type === 0xB) {
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

    if (typeof window.trackRecentCC === 'function') window.trackRecentCC(data[1], ch);
    // CC — map to knob
    if (_learnTarget.type === 'knob') {
      ensureKnobArray(dev);
      const p  = dev.defaultPresets[State.activePresetIndex];
      const ki = _learnTarget.index;
      p.knobs[ki]    = p.knobs[ki] || {};
      p.knobs[ki].cc = data[1];
      save();
      renderDeviceEditor();
      toast(`Knob ${ki+1} → CC ${data[1]} on Ch ${ch+1} ✓`, 'success');
    }
  }
  cancelLearn();
}

function cancelLearn() {
  if (!_learnTarget) return;
  if (_learnTarget.btn) _learnTarget.btn.classList.remove('learning');
  const oldSvg = document.getElementById('svg-' + _learnTarget.type + '-' + _learnTarget.index);
  if (oldSvg) oldSvg.classList.remove('svg-learning');
  _learnTarget = null;
}

// ============================================================
//  WEBMIDI INIT
// ============================================================
function initMidi() {
  if (!navigator.requestMIDIAccess) {
    document.getElementById('midi-status-text').textContent = 'WebMIDI not supported';
    toast('WebMIDI not supported — use Chrome or Edge', 'error');
    return;
  }
  navigator.requestMIDIAccess({ sysex: true })
    .then(access => {
      State.midiAccess = access;
      document.getElementById('midi-dot').classList.add('connected');
      document.getElementById('midi-status-text').textContent = 'WebMIDI ready';
      populatePorts();
      access.onstatechange = () => {
        if (State.settings.autorefresh) populatePorts();
        populateDeviceDropdown();
      };
      toast('WebMIDI connected ✓', 'success');
    })
    .catch(err => {
      document.getElementById('midi-status-text').textContent = 'MIDI access denied';
      toast('MIDI access denied: ' + err.message, 'error');
    });
}

function populatePorts() {
  if (!State.midiAccess) return;
  const selIn  = document.getElementById('sel-in');
  const selOut = document.getElementById('sel-out');
  const prevIn  = selIn.value;
  const prevOut = selOut.value;

  selIn.innerHTML  = '<option value="">— MIDI In —</option>';
  selOut.innerHTML = '<option value="">— MIDI Out —</option>';

  State.midiAccess.inputs.forEach(port => {
    const opt = document.createElement('option');
    opt.value = port.id; opt.textContent = port.name;
    if (port.id === prevIn) opt.selected = true;
    selIn.appendChild(opt);
  });
  State.midiAccess.outputs.forEach(port => {
    const opt = document.createElement('option');
    opt.value = port.id; opt.textContent = port.name;
    if (port.id === prevOut) opt.selected = true;
    selOut.appendChild(opt);
  });

  // Re-connect if same ports still present
  if (prevIn  && selIn.value  === prevIn)  connectMidiPorts();
  if (prevOut && selOut.value === prevOut) connectMidiPorts();
}

function connectMidiPorts() {
  if (!State.midiAccess) return;
  const inId  = document.getElementById('sel-in').value;
  const outId = document.getElementById('sel-out').value;
  if (State.midiIn) State.midiIn.onmidimessage = null;
  State.midiIn  = inId  ? State.midiAccess.inputs.get(inId)   : null;
  State.midiOut = outId ? State.midiAccess.outputs.get(outId) : null;
  if (State.midiIn) {
    State.midiIn.onmidimessage = (e) => { if(window.onMidiMessage) window.onMidiMessage(e); else onMidiMessage(e); };
    document.getElementById('midi-dot').classList.add('connected');
    document.getElementById('midi-status-text').textContent = State.midiIn.name;
  }
  populateDeviceDropdown();
}

// ============================================================
//  MIDI MESSAGE HANDLER
// ============================================================
function onMidiMessage(event) {
  const data = event.data;
  const ts   = event.timeStamp || Date.now();

  flashActivity('in');

  if (State.settings.thru && State.midiOut) sendMidiOut(data);

  
  if (window.mapperLearnMode && window.mapperLearnTarget && window.handleMapperMidiLearn) {
    if (window.handleMapperMidiLearn(data)) return;
  }

  if (_learnTarget) { handleMidiLearn(data); return; }

  const status = data[0];
  const type   = status >> 4;
  const ch     = status & 0x0F;

  // MIDI Clock — detect BPM
  if (status === 0xF8) { handleMidiClock(ts); return; }

  // SysEx
  if (status === 0xF0) {
    logMonitor({ type:'sysex', bytes: Array.from(data), timestamp:ts });
    handleSysExIn(data);
    return;
  }

  let msg;
  if (type === 0x9 && data[2] > 0) {
    msg = { type:'note_on', ch, note:data[1], vel:data[2], timestamp:ts };
    State.liveValues[`note_${ch}_${data[1]}`] = data[2];
    if (State.settings.highlight) highlightPad(ch, data[1], true);
    if (typeof highlightKey === 'function') highlightKey(data[1], true);
  } else if (type === 0x8 || (type === 0x9 && data[2] === 0)) {
    msg = { type:'note_off', ch, note:data[1], vel:0, timestamp:ts };
    State.liveValues[`note_${ch}_${data[1]}`] = 0;
    if (State.settings.highlight) highlightPad(ch, data[1], false);
    if (typeof highlightKey === 'function') highlightKey(data[1], false);
  } else if (type === 0xB) {
    if (typeof window.trackRecentCC === 'function') window.trackRecentCC(data[1], ch);
    msg = { type:'cc', ch, cc:data[1], val:data[2], timestamp:ts };
    State.liveValues[`cc_${ch}_${data[1]}`] = data[2];
    if (State.settings.highlight) updateLiveKnob(ch, data[1], data[2]);
    updateLiveFader(ch, data[1], data[2]);
  } else if (type === 0xC) {
    msg = { type:'pc', ch, pc:data[1], timestamp:ts };
  } else {
    msg = { type:'other', raw: Array.from(data), timestamp:ts };
  }

  logMonitor(msg);
}

// ============================================================
//  SYSEX INCOMING — parse LPD8 preset dump
// ============================================================
function handleSysExIn(data) {
  if (data[0] === 0xF0 && data[1] === 0x7E && data[3] === 0x06 && data[4] === 0x02) {
    if (window.pingStartTime) {
      const ms = Math.round(performance.now() - window.pingStartTime);
      const span = document.getElementById('ping-result');
      if (span) span.innerHTML = `Latency: <strong>${ms}ms</strong>`;
      window.pingStartTime = 0;
    }
  }


  // Akai LPD8 preset dump: F0 47 7F 75 63 ...
  if (data[0]===0xF0 && data[1]===0x47 && data[2]===0x7F &&
      data[3]===0x75 && data[4]===0x63) {
    const presetNum = data[7] - 1;
    const dev = State.devices.find(d => d.id === 'akai_lpd8_v1');
    if (!dev) return;
    if (!dev.defaultPresets[presetNum])
      dev.defaultPresets[presetNum] = { name:`Preset ${presetNum+1}` };
    const p = dev.defaultPresets[presetNum];
    p.channel = data[8];
    p.pads = [];
    for (let i = 0; i < 8; i++) {
      const b = 9 + i * 4;
      p.pads.push({ note:data[b], pc:data[b+1], cc:data[b+2], mode:data[b+3]?'Toggle':'Momentary' });
    }
    p.knobs = [];
    for (let i = 0; i < 8; i++) {
      const b = 9 + 32 + i * 3;
      p.knobs.push({ cc:data[b], lo:data[b+1], hi:data[b+2] });
    }
    save();
    if (State.activeDeviceId === 'akai_lpd8_v1') renderDeviceEditor();
    toast(`LPD8 Preset ${presetNum+1} read from device ✓`, 'success');
  }
}

// ============================================================
//  READ / WRITE DEVICE
// ============================================================
function readFromDevice() {
  const dev = getActiveDev(); if (!dev) return;
  if (!State.midiOut) { toast('No MIDI Out connected', 'error'); return; }
  if (dev.id === 'akai_lpd8_v1') {
    const pn = State.activePresetIndex + 1;
    sendMidiOut([0xF0,0x47,0x7F,0x75,0x61,0x00,0x01, pn, 0xF7]);
    toast(`Reading Preset ${pn} from LPD8…`, 'info');
  } else {
    toast(`Read not implemented for ${dev.name} — use SysEx panel`, 'info');
  }
}

function writeToDevice() {
  const dev = getActiveDev(); if (!dev) return;
  if (!State.midiOut) { toast('No MIDI Out connected', 'error'); return; }
  if (dev.id === 'akai_lpd8_v1') {
    writeLPD8Preset();
  } else {
    toast(`Write not implemented for ${dev.name} — use SysEx panel`, 'info');
  }
}

function writeLPD8Preset() {
  const dev    = getActiveDev();
  const p      = getActivePreset();
  const pn     = State.activePresetIndex + 1;
  const ch     = p?.channel ?? 0;
  const pads   = p?.pads   || dev.controls.pads   || [];
  const knobs  = p?.knobs  || dev.controls.knobs  || [];

  let msg = [0xF0,0x47,0x7F,0x75,0x62,0x00,0x00,0x3F, pn, ch];
  for (let i=0;i<8;i++) {
    const pd = pads[i] || {}; const note=pd.note??36;const pc=pd.pc??0;const cc=pd.cc??1;
    const mode = (pd.mode==='Toggle')?1:0;
    msg.push(note, pc, cc, mode);
  }
  for (let i=0;i<8;i++) {
    const k = knobs[i] || {}; msg.push(k.cc??i+1, k.lo??0, k.hi??127);
  }
  msg.push(0xF7);
  sendMidiOut(msg);
  toast(`Preset ${pn} written to LPD8 ✓`, 'success');
}

// ============================================================
//  LIVE UI HIGHLIGHT
// ============================================================


function flashActivity(type = 'in') {
  const dot = document.getElementById('midi-dot');
  const led = document.getElementById('global-midi-led');
  
  if (type === 'in') {
    if (dot) { dot.style.backgroundColor = '#22c55e'; dot.style.boxShadow = '0 0 10px #22c55e'; }
    if (led) { led.style.backgroundColor = '#22c55e'; led.style.boxShadow = '0 0 8px #22c55e'; }
  } else if (type === 'out') {
    if (dot) { dot.style.backgroundColor = '#3b82f6'; dot.style.boxShadow = '0 0 10px #3b82f6'; }
    if (led) { led.style.backgroundColor = '#3b82f6'; led.style.boxShadow = '0 0 8px #3b82f6'; }
  }
  
  clearTimeout(flashActivity._t);
  flashActivity._t = setTimeout(() => {
    if (dot) { dot.style.backgroundColor = ''; dot.style.boxShadow = ''; }
    if (led) { led.style.backgroundColor = 'var(--surface3)'; led.style.boxShadow = 'none'; }
  }, 100);
}



function highlightPad(ch, note, on) {
  const dev = getActiveDev(); if (!dev?.controls?.pads) return;
  const p   = getActivePreset();
  dev.controls.pads.forEach((pad, pi) => {
    const pd = (p?.pads && p.pads[pi]) ? { ...pad, ...p.pads[pi] } : pad;
    if (pd.note === note) {
      const el = document.getElementById(`ctrl-pad-${pi}`);
      if (el) el.classList.toggle('triggered', on);
    }
  });
}

function updateLiveKnob(ch, cc, val) {
  const dev = getActiveDev(); if (!dev?.controls?.knobs) return;
  const p   = getActivePreset();
  dev.controls.knobs.forEach((knob, ki) => {
    const kd = (p?.knobs && p.knobs[ki]) ? { ...knob, ...p.knobs[ki] } : knob;
    if (kd.cc === cc) {
      const el = document.getElementById(`knob-vis-${ki}`);
      if (el) {
        const deg = Math.round((val / 127) * 270 - 135);
        el.style.transform = `rotate(${deg}deg)`;
        el.textContent     = val;
        el.dataset.val     = val;
      }
    }
  });
}

function updateLiveFader(ch, cc, val) {
  const dev = getActiveDev(); if (!dev?.controls?.faders) return;
  const p   = getActivePreset();
  dev.controls.faders.forEach((fdr, fi) => {
    const fd = (p?.faders && p.faders[fi]) ? { ...fdr, ...p.faders[fi] } : fdr;
    if (fd.cc === cc) {
      const faders = document.querySelectorAll('.ctrl-fader');
      if (!faders[fi]) return;
      const pct   = Math.round((val / 127) * 100);
      const fill  = faders[fi].querySelector('.fader-fill');
      const thumb = faders[fi].querySelector('.fader-thumb');
      const valEl = faders[fi].querySelector('.fader-val');
      if (fill)  fill.style.height  = `${pct}%`;
      if (thumb) thumb.style.bottom = `${pct}%`;
      if (valEl) valEl.textContent  = val;
    }
  });
}

// ============================================================
//  MIDI MONITOR
// ============================================================
function logMonitor(msg) {
  if (State.monitorPaused) return;
  State.monitorMsgs.push(msg);
  if (State.monitorMsgs.length > 500) State.monitorMsgs.shift();
  renderMonitor();
}

function renderMonitor() {
  const el = document.getElementById('midi-monitor');
  if (!el) return;
  const showNote  = document.getElementById('filter-note')?.checked ?? true;
  const showCC    = document.getElementById('filter-cc')?.checked   ?? true;
  const showPC    = document.getElementById('filter-pc')?.checked   ?? true;
  const showSysEx = document.getElementById('filter-sysex')?.checked ?? true;

  const filtered = State.monitorMsgs.filter(m => {
    if ((m.type==='note_on'||m.type==='note_off') && !showNote)  return false;
    if (m.type==='cc'    && !showCC)    return false;
    if (m.type==='pc'    && !showPC)    return false;
    if (m.type==='sysex' && !showSysEx) return false;
    return true;
  });

  el.innerHTML = filtered.slice(-200).reverse().map(m => {
    const ts   = `<span class="msg-ts">${new Date(m.timestamp).toLocaleTimeString()}</span>`;
    const hexV = (n) => State.settings.hex ? `0x${n.toString(16).toUpperCase().padStart(2,'0')}` : n;
    switch (m.type) {
      case 'note_on':  return `${ts}<span class="msg-note" style="color:#3b82f6;font-weight:bold;">▶ Note On  Ch${m.ch+1} ${noteName(m.note)} (${m.note}) vel:${m.vel}</span>`;
      case 'note_off': return `${ts}<span class="msg-note" style="color:#60a5fa;opacity:0.8;">◼ Note Off Ch${m.ch+1} ${noteName(m.note)} (${m.note})</span>`;
      case 'cc':       return `${ts}<span class="msg-cc" style="color:#10b981;">◈ CC ${hexV(m.cc)} = ${hexV(m.val)}  Ch${m.ch+1}</span>`;
      case 'pc':       return `${ts}<span class="msg-pc" style="color:#a855f7;">⬡ PC ${m.pc}  Ch${m.ch+1}</span>`;
      case 'panic':    return `${ts}<span style="color:#ef4444;font-weight:bold;">🚨 ${m.message}</span>`;
      case 'sysex':    return `${ts}<span class="msg-sysex" style="color:#eab308;">⚡ SysEx [${m.bytes.length}B] ${m.bytes.map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ')}</span>`;
      default:         return `${ts}<span style="color:var(--text3)">${(m.raw||[]).map(b=>b.toString(16).toUpperCase()).join(' ')}</span>`;
    }
    }).join('\n');

  document.getElementById('monitor-count').textContent = State.monitorMsgs.length;
}

function clearMonitor()  { State.monitorMsgs = []; renderMonitor(); }
function toggleMonitorPause() {
  State.monitorPaused = !State.monitorPaused;
  const btn = document.getElementById('btn-monitor-pause');
  if (btn) btn.textContent = State.monitorPaused ? '▶ Resume' : '⏸ Pause';
}

// ============================================================
//  SYSEX PANEL
// ============================================================
function sendSysEx() {
  if (!State.midiOut) { toast('No MIDI Out connected', 'error'); return; }
  const raw = document.getElementById('sysex-input')?.value.trim();
  if (!raw) { toast('Enter SysEx bytes first', 'error'); return; }
  try {
    const bytes = parseHexBytes(raw);
    if (bytes[0] !== 0xF0 || bytes[bytes.length-1] !== 0xF7)
      throw new Error('Must start with F0 and end with F7');
    sendMidiOut(bytes);
    toast(`SysEx sent — ${bytes.length} bytes ✓`, 'success');
    logMonitor({ type:'sysex', bytes, timestamp: Date.now() });
  } catch(e) { toast('SysEx error: ' + e.message, 'error'); }
}

function parseSysExInput() {
  const raw = document.getElementById('sysex-input')?.value.trim();
  const out = document.getElementById('sysex-parse-result');
  if (!out) return;
  try {
    const bytes = parseHexBytes(raw);
    out.textContent = `${bytes.length} bytes: ${bytes.map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ')}`;
  } catch(e) { out.textContent = 'Parse error: ' + e.message; }
}

function sendRawMidi() {
  if (!State.midiOut) { toast('No MIDI Out connected', 'error'); return; }
  const type = document.getElementById('raw-type')?.value;
  const ch   = parseInt(document.getElementById('raw-ch')?.value ?? '1') - 1;
  const num  = parseInt(document.getElementById('raw-num')?.value ?? '0');
  const val  = parseInt(document.getElementById('raw-val')?.value ?? '127');
  let msg;
  switch(type) {
    case 'cc':       msg = [0xB0|ch, num, val]; break;
    case 'note_on':  msg = [0x90|ch, num, val]; break;
    case 'note_off': msg = [0x80|ch, num, 0];   break;
    case 'pc':       msg = [0xC0|ch, num];       break;
    default: return;
  }
  sendMidiOut(msg);
  toast(`Sent: ${msg.map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ')} ✓`, 'success');
}

function renderSysExQuickCmds() {
  const container = document.getElementById('device-quick-cmds-list');
  if (!container) return;
  const dev = getActiveDev();
  if (!dev || !dev.quickSysEx || !dev.quickSysEx.length) {
    container.innerHTML = '<span style="font-size:0.8rem;color:var(--text3);">Select a device with SysEx commands.</span>';
    return;
  }
  container.innerHTML = dev.quickSysEx.map(cmd =>
    `<button class="btn sm" onclick="sendQuickSysEx('${escAttr(cmd.bytes)}')">${cmd.label}</button>`
  ).join('');
}

function sendQuickSysEx(bytesStr) {
  if (!State.midiOut) { toast('No MIDI Out connected', 'error'); return; }
  try {
    const bytes = parseHexBytes(bytesStr);
    sendMidiOut(bytes);
    toast(`Quick cmd sent — ${bytes.length}B ✓`, 'success');
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}

// ============================================================
//  BACKUP
// ============================================================
function saveBackup() {
  const dev = getActiveDev(); if (!dev) { toast('Select a device first', 'error'); return; }
  State.backups.push({
    id:       Date.now(),
    device:   dev.id,
    name:     dev.name,
    date:     new Date().toLocaleString(),
    presets:  JSON.parse(JSON.stringify(dev.defaultPresets || []))
  });
  save();
  renderBackupList();
  toast(`Backup saved for ${dev.name} ✓`, 'success');
}

function renderBackupList() {
  const el = document.getElementById('backup-list');
  if (!el) return;
  if (!State.backups.length) {
    el.innerHTML = '<div style="color:var(--text3);font-size:0.82rem;">No backups yet. Select a device and click 💾 Backup.</div>';
    return;
  }
  
  const searchInput = document.getElementById('backup-search');
  const term = searchInput ? searchInput.value.toLowerCase() : '';
  
  const filtered = State.backups.filter(b => 
    (b.name || '').toLowerCase().includes(term) ||
    (b.date || '').toLowerCase().includes(term)
  );

  el.innerHTML = [...filtered].reverse().map(b => `
    <div class="backup-item">
      <div class="bname">${b.name} — ${b.presets?.length ?? 0} preset(s)</div>
      <div class="bdate">${b.date}</div>
      <button class="btn sm success" onclick="restoreBackupById('${b.id}')">↩ Restore</button>
      <button class="btn sm danger"  onclick="deleteBackup('${b.id}')">🗑</button>
    </div>`).join('');
}

function restoreBackupById(id) {
  const bk  = State.backups.find(b => b.id === id); if (!bk) return;
  const dev = State.devices.find(d => d.id === bk.device);
  if (!dev) { toast(`Device "${bk.name}" not found`, 'error'); return; }
  dev.defaultPresets = JSON.parse(JSON.stringify(bk.presets));
  save();
  if (State.activeDeviceId === dev.id) renderDeviceEditor();
  toast(`Backup restored for ${dev.name} ✓`, 'success');
}

function deleteBackup(id) {
  State.backups = State.backups.filter(b => b.id !== id);
  save(); renderBackupList();
  toast('Backup deleted', 'info');
}

function backupAll() {
  const data = {
    version:  '1.0',
    exported: new Date().toISOString(),
    devices:  State.devices,
    backups:  State.backups
  };
  downloadJSON(data, `midicontrols-backup-${Date.now()}.json`);
  toast('Full backup exported ✓', 'success');
}

function restoreBackup(evt) {
  const file = evt.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.devices) { State.devices = data.devices; }
      if (data.backups)  { State.backups  = data.backups;  }
      save(); populateDeviceDropdown(); renderBackupList();
      toast('Backup restored ✓', 'success');
    } catch { toast('Invalid backup file', 'error'); }
  };
  reader.readAsText(file);
  evt.target.value = '';
}

function exportPresetJSON() {
  const dev = getActiveDev(); if (!dev) return;
  const p   = getActivePreset();
  downloadJSON({ device: dev.id, preset: p }, `${dev.id}-preset${State.activePresetIndex+1}.json`);
  toast('Preset JSON exported ✓', 'success');
}

// ============================================================
//  DEVICE MANAGER
// ============================================================

function renderDeviceManager() {
  const grid = document.getElementById('device-manager-grid');
  if (!grid) return;
  const searchInput = document.getElementById('dm-search');
  const term = searchInput ? searchInput.value.toLowerCase() : '';
  
  const categorySelect = document.getElementById('dm-category');
  const selectedTag = categorySelect ? categorySelect.value : 'All';

  // Extract tags
  const allTags = new Set();
  State.devices.forEach(d => {
    if (d.tags && Array.isArray(d.tags)) d.tags.forEach(t => allTags.add(t));
  });
  
  if (categorySelect) {
    let opts = '<option value="All">All Tags</option>';
    Array.from(allTags).sort().forEach(tag => {
      opts += `<option value="${tag}">${tag}</option>`;
    });
    if (categorySelect.innerHTML !== opts) {
      categorySelect.innerHTML = opts;
      categorySelect.value = selectedTag;
    }
  }

  // Filter
  const filtered = State.devices.filter(dev => {
    const matchTerm = (dev.name || '').toLowerCase().includes(term) ||
                      (dev.manufacturer || '').toLowerCase().includes(term) ||
                      (dev.description || '').toLowerCase().includes(term);
    const matchTag = selectedTag === 'All' || (dev.tags && dev.tags.includes(selectedTag));
    return matchTerm && matchTag;
  });

  grid.innerHTML = filtered.map(dev => {
    const tagsHtml = (dev.tags || []).map(t => `<span style="background:var(--surface3);padding:2px 6px;border-radius:4px;font-size:0.65rem;margin-right:4px;">${t}</span>`).join('');
    
    return `
    <div class="dm-card" onmouseenter="showDmCardPreview(event, '${dev.id}')" onmouseleave="hideDmCardPreview()" onmousemove="showDmCardPreview(event, '${dev.id}')">
      <div class="dm-card-header">
        <div class="icon">${dev.icon || '🎹'}</div>
        <div>
          <div class="name">${dev.name}</div>
          <div class="mfr">${dev.manufacturer || ''}</div>
        </div>
      </div>
      <div style="font-size:0.75rem;color:var(--text3);">${dev.description || ''}</div>
      <div style="margin-top:6px;">${tagsHtml}</div>
      <div style="font-size:0.72rem;color:var(--text3);margin-top:6px;">
        ${(dev.controls?.pads?.length||0)} pads ·
        ${(dev.controls?.knobs?.length||0)} knobs ·
        ${(dev.controls?.faders?.length||0)} faders ·
        ${(dev.controls?.buttons?.length||0)} btns ·
        ${dev.presets||1} preset(s)
      </div>
      <div class="dm-card-actions">
        <button class="btn sm primary" onclick="selectDevice('${dev.id}');showPanel('editor')">Edit Map</button>
        ${!DEVICE_MANIFEST.includes(dev.id)
          ? `<button class="btn sm" onclick="openEditDeviceModal('${dev.id}')">⚙️ Config</button>`
          : ''
        }
        <button class="btn sm" onclick="exportDeviceJSON('${dev.id}')">📤 .json</button>
        ${!DEVICE_MANIFEST.includes(dev.id)
          ? `<button class="btn sm danger" onclick="removeDevice('${dev.id}')">🗑</button>`
          : '<span style="font-size:0.7rem;color:var(--text3);">built-in</span>'
        }
      </div>
    </div>`;
  }).join('');
}

function removeDevice(id) {
  if (!confirm('Remove this device? This cannot be undone.')) return;
  State.devices = State.devices.filter(d => d.id !== id);
  if (State.activeDeviceId === id) { State.activeDeviceId = null; renderDeviceEditor(); }
  save(); populateDeviceDropdown(); renderDeviceManager();
  toast('Device removed', 'info');
}

function importDeviceJSON() {
  document.getElementById('import-device-input')?.click();
}

let previewDraft = null;
function handleImportDevice(evt) {
  const file = evt.target.files[0]; if (!file) return;
  const isSyx = file.name.toLowerCase().endsWith('.syx');
  const reader = new FileReader();
  
  reader.onload = e => {
    try {
      let data;
      if (isSyx) {
        const bytes = new Uint8Array(e.target.result);
        if (bytes[0] === 0xF0 && bytes[1] === 0x7D && bytes[bytes.length - 1] === 0xF7) {
          const jsonBytes = bytes.slice(2, bytes.length - 1);
          const jsonStr = new TextDecoder().decode(jsonBytes);
          data = JSON.parse(jsonStr);
        } else {
          throw new Error("Invalid .syx format (Not generated by MIDIcontrolz2)");
        }
      } else {
        data = JSON.parse(e.target.result);
      }
      
      if (!data.id || !data.name) throw new Error('Missing id or name');
      
      previewDraft = data;
      
      const preset = data.defaultPresets?.[0] || {};
      const tags = data.tags && data.tags.length > 0 ? data.tags.join(', ') : 'None';
      
      let knobsHtml = (preset.knobs || data.controls?.knobs || []).map(k => `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--surface3);padding:2px 0;"><span>${k.label || 'Knob'}</span><span>CC ${k.cc}</span></div>`).join('');
      let padsHtml = (preset.pads || data.controls?.pads || []).map(p => `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--surface3);padding:2px 0;"><span>${p.label || 'Pad'}</span><span>Note ${p.note}</span></div>`).join('');
      
      const html = `
        <h3 style="margin-top:0;font-size:1.2rem;border-bottom:1px solid var(--border);padding-bottom:8px;">Preview Import: ${data.name}</h3>
        <p style="font-size:0.85rem;color:var(--text2);margin-bottom:12px;">${data.description||'No description provided.'}</p>
        <div style="font-size:0.85rem;margin-bottom:12px;background:var(--surface2);padding:6px;border-radius:4px;"><strong>Tags:</strong> ${tags}</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <h4 style="border-bottom:1px solid var(--border);padding-bottom:4px;margin-bottom:8px;font-size:1rem;">Mapped Knobs</h4>
            <div style="font-size:0.8rem;height:140px;overflow-y:auto;background:var(--surface2);padding:8px;border-radius:6px;border:1px solid var(--border);">
              ${knobsHtml || '<span style="color:var(--text3);">No knobs mapped</span>'}
            </div>
          </div>
          <div style="flex:1;min-width:200px;">
            <h4 style="border-bottom:1px solid var(--border);padding-bottom:4px;margin-bottom:8px;font-size:1rem;">Mapped Pads</h4>
            <div style="font-size:0.8rem;height:140px;overflow-y:auto;background:var(--surface2);padding:8px;border-radius:6px;border:1px solid var(--border);">
              ${padsHtml || '<span style="color:var(--text3);">No pads mapped</span>'}
            </div>
          </div>
        </div>
        <div style="margin-top:20px;display:flex;gap:12px;justify-content:flex-end;">
          <button class="btn" onclick="closeModal()">Cancel</button>
          <button class="btn primary" onclick="confirmImportDevice()">Import Preset</button>
        </div>
      `;
      openModal(html);
      
    } catch(err) { toast('Invalid file: ' + err.message, 'error'); }
  };
  
  if (isSyx) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
  evt.target.value = '';
}

function confirmImportDevice() {
  if (!previewDraft) return;
  const dev = previewDraft;
  const idx = State.devices.findIndex(d => d.id === dev.id);
  if (idx >= 0) State.devices[idx] = dev; else State.devices.push(dev);
  save(); populateDeviceDropdown(); renderDeviceManager();
  toast(`Device "${dev.name}" imported ✓`, 'success');
  closeModal();
  previewDraft = null;
}

// ============================================================
//  ADD DEVICE MODAL
// ============================================================
function openAddDeviceModal() {
  openModal(`
    <h2>➕ Add New Device</h2>
    <div class="form-group">
      <label>Device ID (unique, no spaces)</label>
      <input type="text" id="new-dev-id" placeholder="my_controller_v1">
    </div>
        <div class="form-group">
      <label>Name</label>
      <input type="text" id="new-dev-name" placeholder="My Controller">
    </div>
    <div class="form-group">
      <label>Tags (comma-separated)</label>
      <input type="text" id="new-dev-tags" placeholder="synth, live, studio">
    </div>
    <div class="form-group">
      <label>Manufacturer</label>
      <input type="text" id="new-dev-mfr" placeholder="ACME">
    </div>
    <div class="form-group">
      <label>MIDI Name (as reported by OS, comma-separated)</label>
      <input type="text" id="new-dev-midiname" placeholder="My Controller, ACME MIDI">
    </div>
    <div class="form-group">
      <label>Icon (emoji)</label>
      <input type="text" id="new-dev-icon" value="🎹" maxlength="4">
    </div>
    <div class="form-group">
      <label>Color (hex)</label>
      <input type="color" id="new-dev-color" value="#6c63ff">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;">
      <div class="form-group">
        <label>Pads</label>
        <input type="number" id="new-dev-pads" value="0" min="0" max="64">
      </div>
      <div class="form-group">
        <label>Knobs</label>
        <input type="number" id="new-dev-knobs" value="0" min="0" max="64">
      </div>
      <div class="form-group">
        <label>Faders</label>
        <input type="number" id="new-dev-faders" value="0" min="0" max="32">
      </div>
      <div class="form-group">
        <label>Buttons</label>
        <input type="number" id="new-dev-buttons" value="0" min="0" max="64">
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="createNewDevice()">Create Device</button>
    </div>`);
}


function openEditDeviceModal(id) {
  const dev = State.devices.find(d => d.id === id);
  if (!dev) return;
  
  openModal(`
    <h2>⚙️ Edit Device Config</h2>
    <div class="form-group">
      <label>Name</label>
      <input type="text" id="edit-dev-name" value="${dev.name || ''}">
    </div>
    <div class="form-group">
      <label>Tags (comma-separated)</label>
      <input type="text" id="edit-dev-tags" value="${(dev.tags || []).join(', ')}">
    </div>
    <div class="form-group">
      <label>Manufacturer</label>
      <input type="text" id="edit-dev-mfr" value="${dev.manufacturer || ''}">
    </div>
    <div class="form-group">
      <label>Icon (emoji)</label>
      <input type="text" id="edit-dev-icon" value="${dev.icon || '🎹'}" maxlength="4">
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveEditDevice('${dev.id}')">Save Changes</button>
    </div>
  `);
}

function saveEditDevice(id) {
  const dev = State.devices.find(d => d.id === id);
  if (!dev) return;

  dev.name = document.getElementById('edit-dev-name')?.value.trim() || dev.name;
  dev.manufacturer = document.getElementById('edit-dev-mfr')?.value.trim() || dev.manufacturer;
  dev.icon = document.getElementById('edit-dev-icon')?.value || dev.icon;
  
  const tagsInput = document.getElementById('edit-dev-tags')?.value || '';
  dev.tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);
  
  save();
  closeModal();
  populateDeviceDropdown();
  renderDeviceManager();
  toast('Device updated ✓', 'success');
}

function createNewDevice() {
  const id    = document.getElementById('new-dev-id')?.value.trim().replace(/\s+/g,'_');
  const name  = document.getElementById('new-dev-name')?.value.trim();
  if (!id || !name) { toast('ID and Name are required', 'error'); return; }
  if (State.devices.find(d => d.id === id)) { toast('Device ID already exists', 'error'); return; }

    const tagsInput = document.getElementById('new-dev-tags')?.value || '';
  const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);

  const dev = {
    id,
    name,
    tags,
    manufacturer: document.getElementById('new-dev-mfr')?.value.trim() || '',
    icon:  document.getElementById('new-dev-icon')?.value  || '🎹',
    color: document.getElementById('new-dev-color')?.value || '#6c63ff',
    midiName: (document.getElementById('new-dev-midiname')?.value || '')
      .split(',').map(s=>s.trim()).filter(Boolean),
    sysex:   false,
    presets: 1,
    description: `${document.getElementById('new-dev-pads')?.value||0} pads · ` +
                 `${document.getElementById('new-dev-knobs')?.value||0} knobs`,
    controls: {
      pads:    genControls('pad',    parseInt(document.getElementById('new-dev-pads')?.value)||0,    pad => ({id:`pad${pad}`,label:`Pad ${pad}`,note:35+pad,cc:pad,pc:pad-1,mode:'Momentary'})),
      knobs:   genControls('knob',   parseInt(document.getElementById('new-dev-knobs')?.value)||0,   k   => ({id:`k${k}`,label:`K${k}`,cc:k,lo:0,hi:127})),
      faders:  genControls('fader',  parseInt(document.getElementById('new-dev-faders')?.value)||0,  f   => ({id:`f${f}`,label:`Fader ${f}`,cc:f})),
      buttons: genControls('button', parseInt(document.getElementById('new-dev-buttons')?.value)||0, b   => ({id:`btn${b}`,label:`Btn ${b}`,note:b-1,cc:b-1,color:'green'}))
    },
    defaultPresets: [{ name:'Preset 1', channel:0 }],
    quickSysEx: []
  };

  State.devices.push(dev);
  save(); closeModal(); populateDeviceDropdown(); renderDeviceManager();
  selectDevice(dev.id);
  toast(`Device "${dev.name}" created ✓`, 'success');
}

function genControls(prefix, count, factory) {
  return Array.from({ length: count }, (_, i) => factory(i + 1));
}

// ============================================================
//  SETTINGS
// ============================================================
function renderSettings() {
  Object.keys(State.settings).forEach(key => {
    const el = document.getElementById(`tog-${key}`);
    if (el) el.classList.toggle('on', !!State.settings[key]);
  });
}

function toggleSetting(key) {
  State.settings[key] = !State.settings[key];
  renderSettings();
  save();
  if (key === 'compact') document.body.classList.toggle('compact', State.settings.compact);
}

function clearAllData() {
  if (!confirm('Clear ALL data? Devices, presets, and backups will be reset.')) return;
  localStorage.removeItem('mc_presets');
  localStorage.removeItem('mc_backups');
  localStorage.removeItem('mc_settings');
  localStorage.removeItem('mc_user_devices');
  toast('All data cleared — reloading…', 'info');
  setTimeout(() => location.reload(), 1000);
}

// ============================================================
//  CC MAP CLIPBOARD COPY
// ============================================================
function copyCCMap() {
  const dev = getActiveDev(); if (!dev) return;
  const p   = getActivePreset();
  const lines = [`# ${dev.name} — Preset ${State.activePresetIndex+1} CC Map\n`];
  (p?.pads   || dev.controls.pads   || []).forEach((pd,i) =>
    lines.push(`Pad ${i+1}:   Note ${noteName(pd.note??36)} (${pd.note??36}), CC ${pd.cc??0}, PC ${pd.pc??0}, Mode: ${pd.mode||'Momentary'}`));
  (p?.knobs  || dev.controls.knobs  || []).forEach((k,i)  =>
    lines.push(`Knob ${i+1}:  CC ${k.cc??0}, Lo ${k.lo??0}, Hi ${k.hi??127}`));
  (p?.faders || dev.controls.faders || []).forEach((f,i)  =>
    lines.push(`Fader ${i+1}: CC ${f.cc??0}`));
  (p?.buttons|| dev.controls.buttons|| []).forEach((b,i)  =>
    lines.push(`Btn ${i+1}:   Note ${b.note??0}, CC ${b.cc??0}, Color: ${b.color||'green'}`));
  navigator.clipboard.writeText(lines.join('\n'))
    .then(()  => toast('CC map copied to clipboard ✓', 'success'))
    .catch(()  => toast('Clipboard not available', 'error'));
}

// ============================================================
//  MODAL
// ============================================================
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

// ============================================================
//  TOAST
// ============================================================
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ============================================================
//  DRAG & DROP — device or backup JSON
// ============================================================
document.body.addEventListener('dragover',  e => { e.preventDefault(); document.body.style.outline = '2px dashed var(--accent)'; });
document.body.addEventListener('dragleave', () => { document.body.style.outline = ''; });
document.body.addEventListener('drop', e => {
  e.preventDefault();
  document.body.style.outline = '';
  const file = e.dataTransfer.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.devices) {
        // Full backup
        State.devices = data.devices;
        if (data.backups) State.backups = data.backups;
        save(); populateDeviceDropdown();
        toast('Full backup restored via drag & drop ✓', 'success');
      } else if (data.id && data.name) {
        // Single device
        const idx = State.devices.findIndex(d => d.id === data.id);
        if (idx >= 0) State.devices[idx] = data; else State.devices.push(data);
        save(); populateDeviceDropdown(); renderDeviceManager();
        toast(`Device "${data.name}" imported ✓`, 'success');
      } else if (data.device && data.preset) {
        // Single preset
        const dev = State.devices.find(d => d.id === data.device);
        if (dev) {
          dev.defaultPresets[State.activePresetIndex] = data.preset;
          save(); renderDeviceEditor();
          toast('Preset imported ✓', 'success');
        }
      } else {
        toast('Unknown JSON format', 'error');
      }
    } catch { toast('Could not parse dropped file', 'error'); }
  };
  reader.readAsText(file);
});

// ============================================================
//  KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')                  closeModal();
  if (e.ctrlKey && e.key === 's')        { e.preventDefault(); saveBackup(); }
  if (e.ctrlKey && e.key === 'm')        { e.preventDefault(); showPanel('monitor'); }
  if (e.ctrlKey && e.key === 'e')        { e.preventDefault(); showPanel('editor'); }
});

// ============================================================
//  MIDI CLOCK / BPM DETECTION
// ============================================================
let _clockCount = 0, _clockLastTs = 0;

function handleMidiClock(ts) {
  _clockCount++;
  if (_clockCount >= 24) {
    const elapsed = ts - _clockLastTs;
    if (elapsed > 0) {
      const bpm = Math.round(60000 / elapsed);
      document.getElementById('midi-status-text').textContent =
        `${State.midiIn?.name || 'MIDI'} ♩ ${bpm} BPM`;
    }
    _clockCount  = 0;
    _clockLastTs = ts;
  }
}

// ============================================================
//  UTILITY
// ============================================================
function parseHexBytes(str) {
  return str.trim().split(/[\s,]+/)
    .filter(s => s.length > 0)
    .map(s => {
      const n = parseInt(s, 16);
      if (isNaN(n) || n < 0 || n > 255) throw new Error(`Invalid byte: ${s}`);
      return n;
    });
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function escAttr(str) {
  return str.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

// ============================================================
//  HELP MODAL
// ============================================================
function showHelp() {
  openModal(`
    <h2>⌨ Keyboard Shortcuts</h2>
    <div style="font-size:0.83rem;line-height:2.2;color:var(--text2);">
      <div><kbd style="background:var(--surface3);padding:2px 8px;border-radius:4px;font-family:monospace;">Ctrl+S</kbd> &nbsp;Save backup of current device</div>
      <div><kbd style="background:var(--surface3);padding:2px 8px;border-radius:4px;font-family:monospace;">Ctrl+M</kbd> &nbsp;Open MIDI Monitor</div>
      <div><kbd style="background:var(--surface3);padding:2px 8px;border-radius:4px;font-family:monospace;">Ctrl+E</kbd> &nbsp;Open Editor</div>
      <div><kbd style="background:var(--surface3);padding:2px 8px;border-radius:4px;font-family:monospace;">Escape</kbd> &nbsp;Close modal / cancel MIDI Learn</div>
    </div>
    <h2 style="margin-top:18px;">💡 Tips</h2>
    <ul style="font-size:0.83rem;line-height:2;color:var(--text2);padding-left:18px;">
      <li>Drag &amp; drop any <code>device.json</code> or backup onto the page to import</li>
      <li>Click <strong>LEARN</strong> on any pad, then press a hardware key to auto-map</li>
      <li>Drag a <strong>knob</strong> up/down — sends live CC to MIDI Out instantly</li>
      <li>Click a <strong>button LED</strong> to trigger Note On/Off via MIDI Out</li>
      <li><strong>Read Device</strong> requests a SysEx preset dump (LPD8 supported)</li>
      <li><strong>Write Device</strong> sends current preset to hardware (LPD8 supported)</li>
      <li>Add devices in <code>devices/YOUR_ID/device.json</code> + add ID to <code>DEVICE_MANIFEST</code></li>
      <li>WebMIDI requires <strong>Chrome or Edge</strong> (not Firefox without flags)</li>
    </ul>
    <div class="modal-actions">
      <button class="btn primary" onclick="closeModal()">Got it ✓</button>
    </div>`);
}

// ============================================================
//  INJECT HELP BUTTON INTO NAV
// ============================================================
(function addHelpBtn() {
  const nav = document.getElementById('topnav');
  if (!nav) return;
  const btn = document.createElement('button');
  btn.className   = 'btn sm';
  btn.textContent = '?';
  btn.title       = 'Keyboard shortcuts & tips';
  btn.onclick     = showHelp;
  nav.appendChild(btn);
})();

// ============================================================
//  PWA — inline service worker via blob URL
// ============================================================


// ============================================================
//  INIT — async entry point
// ============================================================

window.vkOctaveShift = 0;

function changeVkOctave(dir) {
  window.vkOctaveShift += dir;
  if (window.vkOctaveShift < -2) window.vkOctaveShift = -2;
  if (window.vkOctaveShift > 2)  window.vkOctaveShift = 2;
  renderVirtualKeyboard();
}

function renderVirtualKeyboard() {
  const vk = document.getElementById('virtual-keyboard');
  if(!vk) return;
  const startNote = 48 + (window.vkOctaveShift * 12); 
  let html = '';
  for(let i = 0; i < 25; i++) {
    const note = startNote + i;
    const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
    const active = activeKeys.has(note);
    if(isBlack) {
      html += `<div id="vk-${note}" 
        onmousedown="vkSendNoteOn(${note})" onmouseup="vkSendNoteOff(${note})" onmouseleave="vkSendNoteOff(${note})" onmouseenter="vkMouseEnter(${note})"
        ontouchstart="vkSendNoteOn(${note})" ontouchend="vkSendNoteOff(${note})"
        style="width:20px;height:50px;background:${active ? '#ef4444' : '#1e293b'};margin:0 -10px;z-index:10;border:1px solid #0f172a;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer; transition: background 0.1s;"></div>`;
    } else {
      html += `<div id="vk-${note}" 
        onmousedown="vkSendNoteOn(${note})" onmouseup="vkSendNoteOff(${note})" onmouseleave="vkSendNoteOff(${note})" onmouseenter="vkMouseEnter(${note})"
        ontouchstart="vkSendNoteOn(${note})" ontouchend="vkSendNoteOff(${note})"
        style="width:30px;height:80px;background:${active ? '#f87171' : '#f1f5f9'};border-right:1px solid #cbd5e1;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer;z-index:0; transition: background 0.1s;"></div>`;
    }
  }
  vk.innerHTML = html;
  
  if (typeof drawVkCurve === 'function') drawVkCurve();
  const display = document.getElementById('vk-octave-display');
  if(display) {
    display.textContent = noteName(startNote) + ' - ' + noteName(startNote + 24);
  }
}

function highlightKey(note, state) {
  if(state) activeKeys.add(note);
  else activeKeys.delete(note);
  const el = document.getElementById('vk-' + note);
  if(!el) return;
  const isBlack = el.style.width === '20px';
  if(state) el.style.background = isBlack ? '#ef4444' : '#f87171';
  else      el.style.background = isBlack ? '#1e293b' : '#f1f5f9';
}

async function init() {
  // Setup Virtual Keyboard
  renderVirtualKeyboard();
  // Auto-save every 5 seconds
  setInterval(() => {
    saveState();
  }, 5000);
  await loadDevices();
  populateDeviceDropdown();   // ← add this
  renderSettings();
  renderBackupList();
  initMidi();
  if (State.devices.length) selectDevice(State.devices[0].id);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init(); // DOM already parsed (e.g. script is at bottom of <body>)
}


window.vkIsDragging = false;
document.addEventListener('mouseup', () => { window.vkIsDragging = false; });

window.vkSendNoteOnRaw = function(note) {
  window.vkIsDragging = true;
  const qNote = typeof quantizeNote === 'function' ? quantizeNote(note) : note;
  if (State.midiOut) {
    const ch = State.activePresetIndex !== undefined && getActiveDev()?.defaultPresets?.[State.activePresetIndex]?.channel || 0;
    const velRaw = parseInt(document.getElementById('vk-velocity')?.value || 100);
    const vel = typeof applyVelocityCurve === 'function' ? applyVelocityCurve(velRaw) : velRaw;
    sendMidiOut([0x90 + ch, qNote, vel]);
  }
  highlightKey(note, true);
};

window.vkSendNoteOffRaw = function(note) {
  const qNote = typeof quantizeNote === 'function' ? quantizeNote(note) : note;
  if (State.midiOut && activeKeys.has(note)) {
    const ch = State.activePresetIndex !== undefined && getActiveDev()?.defaultPresets?.[State.activePresetIndex]?.channel || 0;
    sendMidiOut([0x80 + ch, qNote, 0]);
  }
  highlightKey(note, false);
};

window.vkMouseEnterRaw = function(note) {
  if (window.vkIsDragging && !activeKeys.has(note)) {
    window.vkSendNoteOnRaw(note);
  }
};


// CHORD GENERATOR
const CHORD_INTERVALS = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dim: [0, 3, 6]
};

let activeUtilityChords = [];

function playUtilityChordQuick(root, type) {
  playChordRaw(root, type);
}

function playUtilityChord() {
  const root = parseInt(document.getElementById('chord-root').value);
  const type = document.getElementById('chord-type').value;
  playChordRaw(root, type);
}

function playChordRaw(root, type) {
  if (!State.midiOut) return toast('No MIDI Out connected', 'error');
  const intervals = CHORD_INTERVALS[type];
  const notes = intervals.map(i => root + i);
  const ch = 0; // Default to ch 1
  notes.forEach(n => {
    if (n <= 127) {
      sendMidiOut([0x90 | ch, n, 100]);
      activeUtilityChords.push({note: n, ch});
    }
  });
}

function stopUtilityChord() {
  stopAllChords();
}

function stopAllChords() {
  activeUtilityChords.forEach(c => {
    sendMidiOut([0x80 | c.ch, c.note, 0]);
  });
  activeUtilityChords = [];
}

// MIDI CLOCK
window.internalClockTimer = null;
window.internalClockBpm = 120;

function updateInternalClockBPM(val) {
  window.internalClockBpm = parseInt(val);
  document.getElementById('clock-bpm-val').textContent = window.internalClockBpm;
  if (window.internalClockTimer) {
    toggleInternalClock(); 
    toggleInternalClock();
  }
}

function toggleInternalClock() {
  const btn = document.getElementById('btn-clock-toggle');
  if (window.internalClockTimer) {
    clearInterval(window.internalClockTimer);
    window.internalClockTimer = null;
    btn.textContent = 'Start Clock';
    btn.classList.remove('danger');
    btn.classList.add('primary');
  } else {
    // MIDI clock is 24 PPQN (Pulses Per Quarter Note)
    const msPerBeat = 60000 / window.internalClockBpm;
    const msPerPulse = msPerBeat / 24;
    
    sendMidiOut([0xFA]); // Start
    window.internalClockTimer = setInterval(() => {
      sendMidiOut([0xF8]); // Clock
    }, msPerPulse);
    
    btn.textContent = 'Stop Clock';
    btn.classList.remove('primary');
    btn.classList.add('danger');
  }
}

// LFO GENERATOR
window.lfoTimer = null;
window.lfoPhase = 0;

function toggleLFO() {
  const btn = document.getElementById('btn-lfo-toggle');
  if (window.lfoTimer) {
    cancelAnimationFrame(window.lfoTimer);
    window.lfoTimer = null;
    btn.textContent = 'Start LFO';
    btn.classList.remove('danger');
    btn.classList.add('primary');
    document.getElementById('lfo-visualizer').style.width = '0%';
  } else {
    window.lfoLastTime = performance.now();
    window.lfoPhase = 0;
    lfoTick(performance.now());
    btn.textContent = 'Stop LFO';
    btn.classList.remove('primary');
    btn.classList.add('danger');
  }
}

function lfoTick(time) {
  if (!window.lfoTimer && document.getElementById('btn-lfo-toggle').textContent === 'Stop LFO') {
     // Safety catch for React-like unmounts, though we use vanilla
  }
  
  const dt = time - window.lfoLastTime;
  window.lfoLastTime = time;
  
  const speed = parseFloat(document.getElementById('lfo-speed').value) || 1.0;
  const cc = parseInt(document.getElementById('lfo-cc').value) || 74;
  
  // dt is in ms. speed is Hz. 
  window.lfoPhase += (speed * (dt / 1000.0)) * Math.PI * 2;
  
  // sine wave -1 to 1 -> 0 to 1 -> 0 to 127
  const val01 = (Math.sin(window.lfoPhase) + 1) / 2;
  const ccVal = Math.round(val01 * 127);
  
  if (State.midiOut) {
    sendMidiOut([0xB0, cc, ccVal]);
  }
  
  const vis = document.getElementById('lfo-visualizer');
  if (vis) vis.style.width = (val01 * 100) + '%';
  
  window.lfoTimer = requestAnimationFrame(lfoTick);
}

// LATENCY TESTER (Loopback)
window.latencyTestActive = false;
window.latencyTestStart = 0;

function runLatencyTest() {
  if (!State.midiIn || !State.midiOut) {
    toast('Please connect both MIDI In and MIDI Out to run loopback test', 'error');
    return;
  }
  
  const res = document.getElementById('latency-results');
  res.innerHTML = 'Testing... (Ensure MIDI Out is cabled directly to MIDI In)';
  
  window.latencyTestActive = true;
  window.latencyTestStart = performance.now();
  
  // Send a specific CC sequence that we can uniquely identify
  // Let's send CC 111 with value 111
  sendMidiOut([0xB0, 111, 111]);
  
  setTimeout(() => {
    if (window.latencyTestActive) {
      window.latencyTestActive = false;
      res.innerHTML = '<span style="color:#ef4444;">Timeout. No loopback detected. Is the cable connected?</span>';
    }
  }, 1000);
}

// Hook loopback detect into onMidiMessage
const origMidiMsgUtils = window.onMidiMessage || onMidiMessage;
window.onMidiMessage = function(event) {
  const data = event.data;
  
  if (window.latencyTestActive && data[0] === 0xB0 && data[1] === 111 && data[2] === 111) {
    const ms = (performance.now() - window.latencyTestStart).toFixed(2);
    document.getElementById('latency-results').innerHTML = `Loopback successful! Latency: <strong>${ms} ms</strong>`;
    window.latencyTestActive = false;
    return; // consume it
  }
  
  origMidiMsgUtils(event);
};



function vkSendNoteOn(note) { window.vkSendNoteOnRaw(note); }
function vkSendNoteOff(note) { window.vkSendNoteOffRaw(note); }
function vkMouseEnter(note) { window.vkMouseEnterRaw(note); }


window.validateJsonEditor = function() {
  const ta = document.getElementById('json-editor-textarea');
  const err = document.getElementById('json-editor-error');
  const btn = document.getElementById('json-editor-save-btn');
  if (!ta || !err || !btn) return;
  try {
    JSON.parse(ta.value);
    err.textContent = '';
    btn.disabled = false;
  } catch (e) {
    err.textContent = 'Invalid JSON: ' + e.message;
    btn.disabled = true;
  }
};

window.saveJsonEditor = function() {
  const ta = document.getElementById('json-editor-textarea');
  if (!ta) return;
  try {
    const data = JSON.parse(ta.value);
    const dev = State.devices.find(d => d.id === data.id);
    if (dev) {
      Object.assign(dev, data);
      save();
      renderDeviceEditor();
      toast('JSON Config Saved', 'success');
    }
  } catch (e) {
    toast('Error saving JSON: ' + e.message, 'error');
  }
};


// ============================================================
//  MIDI RECORDER
// ============================================================
window.midiRecorder = {
  isRecording: false,
  isPlaying: false,
  startTime: 0,
  events: [], // { offset: ms, data: [bytes] }
  timers: []
};

window.toggleMidiRecord = function() {
  const r = window.midiRecorder;
  if (r.isRecording) {
    r.isRecording = false;
    document.getElementById('btn-recorder-rec').textContent = '🔴 Record';
    document.getElementById('btn-recorder-rec').classList.remove('danger');
    document.getElementById('recorder-status').textContent = 'Stopped';
  } else {
    // Stop playback if running
    if (r.isPlaying) window.toggleMidiPlayback();
    
    r.events = [];
    r.isRecording = true;
    r.startTime = performance.now();
    document.getElementById('btn-recorder-rec').textContent = '⏹ Stop Rec';
    document.getElementById('btn-recorder-rec').classList.add('danger');
    document.getElementById('recorder-status').textContent = 'Recording...';
    document.getElementById('recorder-count').textContent = '0';
  }
};

window.clearMidiRecord = function() {
  const r = window.midiRecorder;
  if (r.isRecording) window.toggleMidiRecord();
  if (r.isPlaying) window.toggleMidiPlayback();
  r.events = [];
  document.getElementById('recorder-count').textContent = '0';
  document.getElementById('recorder-status').textContent = 'Cleared';
};

window.toggleMidiPlayback = function() {
  const r = window.midiRecorder;
  if (r.isRecording) window.toggleMidiRecord();
  
  if (r.isPlaying) {
    r.isPlaying = false;
    r.timers.forEach(t => clearTimeout(t));
    r.timers = [];
    document.getElementById('btn-recorder-play').textContent = '▶ Play';
    document.getElementById('btn-recorder-play').classList.remove('primary');
    document.getElementById('recorder-status').textContent = 'Stopped';
  } else {
    if (r.events.length === 0) return toast('No events to play', 'error');
    r.isPlaying = true;
    document.getElementById('btn-recorder-play').textContent = '⏹ Stop Play';
    document.getElementById('btn-recorder-play').classList.add('primary');
    document.getElementById('recorder-status').textContent = 'Playing...';
    
    // Schedule all events
    r.events.forEach(ev => {
      const t = setTimeout(() => {
        if (State.midiOut) sendMidiOut(ev.data);
      }, ev.offset);
      r.timers.push(t);
    });
    
    // Auto-stop when done
    const maxOffset = Math.max(...r.events.map(e => e.offset));
    const t = setTimeout(() => {
      if (window.midiRecorder.isPlaying) window.toggleMidiPlayback();
    }, maxOffset + 100);
    r.timers.push(t);
  }
};

// ============================================================
//  CHORD MEMORY
// ============================================================
window.chordMemory = {
  active: false,
  triggerNote: null,
  chordNotes: [],
  learnState: 'idle' // 'idle', 'trigger', 'chord'
};

window.toggleChordMemory = function() {
  window.chordMemory.active = !window.chordMemory.active;
  const btn = document.getElementById('btn-cm-active');
  btn.textContent = window.chordMemory.active ? 'Enable: ON' : 'Enable: OFF';
  btn.classList.toggle('primary', window.chordMemory.active);
  if (!window.chordMemory.active) window.chordMemory.learnState = 'idle';
};

window.learnCmTrigger = function() {
  window.chordMemory.learnState = 'trigger';
  toast('Play a note to set as trigger', 'info');
};

window.learnCmChord = function() {
  window.chordMemory.learnState = 'chord';
  window.chordMemory.chordNotes = [];
  toast('Play notes to build the chord. Stop playing when done.', 'info');
};

// Modify onMidiMessage to hook into these tools
const origMidiProcess = window.onMidiMessage || onMidiMessage;
window.onMidiMessage = function(event) {
  const data = event.data;
  const type = data[0] >> 4;
  const ch = data[0] & 0x0F;
  
  // 1. MIDI Recorder Hook
  if (window.midiRecorder && window.midiRecorder.isRecording) {
    window.midiRecorder.events.push({
      offset: performance.now() - window.midiRecorder.startTime,
      data: Array.from(data)
    });
    const countEl = document.getElementById('recorder-count');
    if (countEl) countEl.textContent = window.midiRecorder.events.length;
  }
  
  // 2. Chord Memory Hook
  if (window.chordMemory) {
    if (type === 0x9 && data[2] > 0) { // Note On
      const note = data[1];
      
      if (window.chordMemory.learnState === 'trigger') {
        window.chordMemory.triggerNote = note;
        document.getElementById('cm-trigger-note').textContent = noteName(note) + ' (' + note + ')';
        window.chordMemory.learnState = 'idle';
        toast('Trigger note learned', 'success');
        return; // Consume
      }
      
      if (window.chordMemory.learnState === 'chord') {
        if (!window.chordMemory.chordNotes.includes(note)) {
          window.chordMemory.chordNotes.push(note);
          document.getElementById('cm-chord-notes').textContent = window.chordMemory.chordNotes.map(n => noteName(n)).join(', ');
        }
        return; // Consume
      }
      
      if (window.chordMemory.active && window.chordMemory.triggerNote === note) {
        // Play the chord instead
        window.chordMemory.chordNotes.forEach(n => {
          if (State.midiOut) sendMidiOut([0x90 | ch, n, data[2]]);
        });
        return; // Consume original note
      }
    }
    
    if (type === 0x8 || (type === 0x9 && data[2] === 0)) { // Note Off
      const note = data[1];
      if (window.chordMemory.learnState === 'chord') return; // consume
      
      if (window.chordMemory.active && window.chordMemory.triggerNote === note) {
        // Stop the chord
        window.chordMemory.chordNotes.forEach(n => {
          if (State.midiOut) sendMidiOut([0x80 | ch, n, 0]);
        });
        return; // Consume
      }
    }
  }

  // Fallback to original
  if (origMidiProcess) origMidiProcess(event);
};



// ============================================================

// ============================================================
//  VELOCITY HEATMAP (RECHARTS)
// ============================================================
window.velocityHeatmapData = [];
window.heatmapNoteSequence = 0;

window.renderVelocityChart = function() {
  const container = document.getElementById('velocity-chart-container');
  if (!container || !window.React || !window.Recharts) return;
  
  const e = React.createElement;
  const { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } = window.Recharts;
  
  // We plot the last 50 notes. X = Sequence, Y = Velocity. Color = Intensity
  const chart = e(ResponsiveContainer, { width: '100%', height: '100%' },
    e(ScatterChart, { margin: { top: 10, right: 10, bottom: 0, left: -20 } },
      e(CartesianGrid, { strokeDasharray: '3 3', stroke: '#334155' }),
      e(XAxis, { type: 'number', dataKey: 'seq', hide: true, domain: ['dataMin', 'dataMax'] }),
      e(YAxis, { type: 'number', dataKey: 'vel', domain: [0, 127], stroke: '#94a3b8', fontSize: 10 }),
      e(ZAxis, { type: 'number', dataKey: 'vel', range: [20, 200] }), // Size of the dot based on velocity
      e(Tooltip, { 
        cursor: { strokeDasharray: '3 3' },
        contentStyle: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', fontSize: '12px' },
        formatter: (value, name) => [value, name === 'vel' ? 'Velocity' : name]
      }),
      e(Scatter, { data: window.velocityHeatmapData },
        window.velocityHeatmapData.map((entry, index) => {
          // Color heat: blue (low) -> green (mid) -> red (high)
          const heat = entry.vel / 127;
          const r = Math.round(255 * heat);
          const b = Math.round(255 * (1 - heat));
          const color = `rgb(${r}, 50, ${b})`;
          return e(Cell, { key: `cell-${index}`, fill: color, opacity: 0.8 });
        })
      )
    )
  );
  
  if (!window.velocityChartRoot) {
    window.velocityChartRoot = ReactDOM.createRoot(container);
  }
  window.velocityChartRoot.render(chart);
};

const originalProcessForVelocity = window.onMidiMessage || onMidiMessage;
window.onMidiMessage = function(event) {
  const data = event.data;
  const type = data[0] >> 4;
  
  // Note On
  if (type === 0x9 && data[2] > 0) {
    const vel = data[2];
    const note = data[1];
    
    window.velocityHeatmapData.push({ seq: window.heatmapNoteSequence++, vel: vel, note: note });
    if (window.velocityHeatmapData.length > 50) {
      window.velocityHeatmapData.shift();
    }
    
    if (!window.velocityChartPending) {
      window.velocityChartPending = true;
      requestAnimationFrame(() => {
        if(window.renderVelocityChart) window.renderVelocityChart();
        window.velocityChartPending = false;
      });
    }
  }
  
  if (originalProcessForVelocity) originalProcessForVelocity(event);
};


// Call once on init to draw empty chart
setTimeout(() => {
  if (document.getElementById('velocity-chart-container')) {
    window.renderVelocityChart();
  }
}, 1000);


window.showPresetPreview = function(event, presetIndex) {
  const dev = getActiveDev();
  if (!dev || !dev.defaultPresets || !dev.defaultPresets[presetIndex]) return;
  const p = dev.defaultPresets[presetIndex];
  
  let tooltip = document.getElementById('preset-preview-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'preset-preview-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'var(--surface2)';
    tooltip.style.border = '1px solid var(--border)';
    tooltip.style.borderRadius = '6px';
    tooltip.style.padding = '8px 12px';
    tooltip.style.color = 'var(--text)';
    tooltip.style.zIndex = '9999';
    tooltip.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.fontSize = '0.75rem';
    document.body.appendChild(tooltip);
  }
  
  const pads = (p.pads || []).length || (dev.controls?.pads || []).length;
  const knobs = (p.knobs || []).length || (dev.controls?.knobs || []).length;
  const faders = (p.faders || []).length || (dev.controls?.faders || []).length;
  
  tooltip.innerHTML = `
    <strong style="display:block;margin-bottom:4px;font-size:0.85rem;color:var(--accent);">${p.name || 'Preset ' + (presetIndex+1)} Preview</strong>
    <div style="display:grid;grid-template-columns:auto auto;gap:4px 12px;color:var(--text2);">
      <span>Pads Mapped:</span> <strong>${pads}</strong>
      <span>Knobs Mapped:</span> <strong>${knobs}</strong>
      <span>Faders Mapped:</span> <strong>${faders}</strong>
      <span>MIDI Channel:</span> <strong>${(p.channel ?? 0) + 1}</strong>
    </div>
  `;
  
  tooltip.style.display = 'block';
  tooltip.style.left = (event.pageX + 15) + 'px';
  tooltip.style.top = (event.pageY + 15) + 'px';
};

window.hidePresetPreview = function() {
  const tooltip = document.getElementById('preset-preview-tooltip');
  if (tooltip) tooltip.style.display = 'none';
};


window.showDmCardPreview = function(event, devId) {
  const dev = State.devices.find(d => d.id === devId);
  if (!dev) return;
  
  let tooltip = document.getElementById('dm-card-preview-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'dm-card-preview-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'var(--surface2)';
    tooltip.style.border = '1px solid var(--border)';
    tooltip.style.borderRadius = '6px';
    tooltip.style.padding = '10px 14px';
    tooltip.style.color = 'var(--text)';
    tooltip.style.zIndex = '99999';
    tooltip.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.fontSize = '0.75rem';
    tooltip.style.maxWidth = '250px';
    document.body.appendChild(tooltip);
  }
  
  let content = `<strong style="display:block;margin-bottom:6px;font-size:0.85rem;color:var(--accent);">${dev.name} Core Mappings</strong>`;
  
  if (dev.defaultPresets && dev.defaultPresets.length > 0) {
    dev.defaultPresets.forEach((p, i) => {
      if (i > 3) return; // Limit to 4 presets max to avoid huge tooltips
      const pads = (p.pads || []).length || (dev.controls?.pads || []).length;
      const knobs = (p.knobs || []).length || (dev.controls?.knobs || []).length;
      const faders = (p.faders || []).length || (dev.controls?.faders || []).length;
      content += `
        <div style="margin-bottom:8px; border-bottom: 1px solid var(--border); padding-bottom:4px;">
          <strong style="color:var(--text2);">${p.name || 'Preset ' + (i+1)} (Ch ${(p.channel ?? 0) + 1})</strong><br>
          <span style="color:var(--text3);font-size:0.7rem;">Pads: ${pads} | Knobs: ${knobs} | Faders: ${faders}</span>
        </div>
      `;
    });
    if(dev.defaultPresets.length > 4) {
      content += `<div style="color:var(--text3);font-size:0.7rem;">+ ${dev.defaultPresets.length - 4} more presets</div>`;
    }
  } else {
    content += `<div style="color:var(--text3);">No customized presets defined. Uses default mappings.</div>`;
  }
  
  tooltip.innerHTML = content;
  tooltip.style.display = 'block';
  tooltip.style.left = (event.pageX + 15) + 'px';
  tooltip.style.top = (event.pageY + 15) + 'px';
};

window.hideDmCardPreview = function() {
  const tooltip = document.getElementById('dm-card-preview-tooltip');
  if (tooltip) tooltip.style.display = 'none';
};


// ============================================================
//  SYSEX BULK QUEUE & SAFETY
// ============================================================
window.sysexQueue = [];
window.sysexQueueActive = false;

window.handleSysexQueueFiles = function(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;
  
  window.sysexQueue = files;
  const list = document.getElementById('sysex-queue-list');
  if (list) {
    list.innerHTML = files.map(f => `<div>📄 ${f.name} (${f.size} bytes)</div>`).join('');
  }
};

window.sendSysexQueue = async function() {
  if (!State.midiOut) return toast('No MIDI Out connected', 'error');
  if (!window.sysexQueue.length) return toast('No files queued', 'error');
  
  window.sysexQueueActive = true;
  for (let i = 0; i < window.sysexQueue.length; i++) {
    const file = window.sysexQueue[i];
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      sendMidiOut(bytes);
      toast(`Sent ${file.name}`, 'info');
      // Wait a bit between files to not overwhelm hardware
      await new Promise(r => setTimeout(r, 200));
    } catch(e) {
      toast(`Error sending ${file.name}`, 'error');
    }
  }
  toast('SysEx Queue finished', 'success');
  window.sysexQueueActive = false;
};

window.addEventListener('beforeunload', (e) => {
  const isRecording = window.midiRecorder && window.midiRecorder.isRecording;
  const isSysEx = window.sysexQueueActive;
  
  if (isRecording || isSysEx) {
    e.preventDefault();
    e.returnValue = ''; // Required for modern browsers
  }
});


window.applyMonitorQuickFilter = function() {
  const v = document.getElementById('monitor-quick-filter').value;
  const n = document.getElementById('filter-note');
  const c = document.getElementById('filter-cc');
  const p = document.getElementById('filter-pc');
  const s = document.getElementById('filter-sysex');
  
  if (!n || !c || !p || !s) return;
  
  if(v === 'all') { n.checked = true; c.checked = true; p.checked = true; s.checked = true; }
  else if(v === 'perf') { n.checked = true; c.checked = true; p.checked = true; s.checked = false; }
  else if(v === 'sysex') { n.checked = false; c.checked = false; p.checked = false; s.checked = true; }
  
  if (window.renderMonitor) window.renderMonitor();
};
