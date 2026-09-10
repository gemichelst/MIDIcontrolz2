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
  document.getElementById(`panel-${name}`).classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  if (name === 'backup')   renderBackupList();
  if (name === 'manager')  renderDeviceManager();
  if (name === 'settings') renderSettings();
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
      html += `<button class="preset-tab ${i === State.activePresetIndex ? 'active' : ''}"
        onclick="selectPreset(${i})">${p.name || `Preset ${i+1}`}</button>`;
    });
    html += `</div>`;
  }

  // Channel bar
  html += `
  <div class="channel-bar">
    <label>MIDI Channel:</label>
    <select onchange="setPresetChannel(this.value)">
      ${Array.from({length:16},(_,i) =>
        `<option value="${i}" ${preset.channel === i ? 'selected' : ''}>Ch ${i+1}</option>`
      ).join('')}
    </select>
    <span style="font-size:0.75rem;color:var(--text3);">
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

  container.innerHTML = html;

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
    State.midiIn.onmidimessage = onMidiMessage;
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
  if (!dot) return;
  if (type === 'in') {
    dot.style.backgroundColor = '#22c55e';
    dot.style.boxShadow = '0 0 10px #22c55e';
  } else if (type === 'out') {
    dot.style.backgroundColor = '#3b82f6';
    dot.style.boxShadow = '0 0 10px #3b82f6';
  }
  clearTimeout(flashActivity._t);
  flashActivity._t = setTimeout(() => {
    dot.style.backgroundColor = '';
    dot.style.boxShadow = '';
  }, 150);
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
      case 'note_on':  return `${ts}<span class="msg-note">▶ Note On  Ch${m.ch+1} ${noteName(m.note)} (${m.note}) vel:${m.vel}</span>`;
      case 'note_off': return `${ts}<span class="msg-note">◼ Note Off Ch${m.ch+1} ${noteName(m.note)} (${m.note})</span>`;
      case 'cc':       return `${ts}<span class="msg-cc">◈ CC ${hexV(m.cc)} = ${hexV(m.val)}  Ch${m.ch+1}</span>`;
      case 'pc':       return `${ts}<span class="msg-pc">⬡ PC ${m.pc}  Ch${m.ch+1}</span>`;
      case 'sysex':    return `${ts}<span class="msg-sysex">⚡ SysEx [${m.bytes.length}B] ${m.bytes.map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ')}</span>`;
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
  el.innerHTML = [...State.backups].reverse().map(b => `
    <div class="backup-item">
      <div class="bname">${b.name} — ${b.presets?.length ?? 0} preset(s)</div>
      <div class="bdate">${b.date}</div>
      <button class="btn sm success" onclick="restoreBackupById(${b.id})">↩ Restore</button>
      <button class="btn sm danger"  onclick="deleteBackup(${b.id})">🗑</button>
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
  const filtered = State.devices.filter(dev => 
    (dev.name || '').toLowerCase().includes(term) ||
    (dev.manufacturer || '').toLowerCase().includes(term) ||
    (dev.description || '').toLowerCase().includes(term)
  );
  grid.innerHTML = filtered.map(dev => `

    <div class="dm-card">
      <div class="dm-card-header">
        <div class="icon">${dev.icon || '🎹'}</div>
        <div>
          <div class="name">${dev.name}</div>
          <div class="mfr">${dev.manufacturer || ''}</div>
        </div>
      </div>
      <div style="font-size:0.75rem;color:var(--text3);">${dev.description || ''}</div>
      <div style="font-size:0.72rem;color:var(--text3);">
        ${(dev.controls?.pads?.length||0)} pads ·
        ${(dev.controls?.knobs?.length||0)} knobs ·
        ${(dev.controls?.faders?.length||0)} faders ·
        ${(dev.controls?.buttons?.length||0)} btns ·
        ${dev.presets||1} preset(s)
      </div>
      <div class="dm-card-actions">
        <button class="btn sm primary" onclick="selectDevice('${dev.id}');showPanel('editor')">Edit</button>
        <button class="btn sm" onclick="previewPresetFromManager('${dev.id}')">👁 Preview</button>
        <button class="btn sm" onclick="exportDeviceJSON('${dev.id}')">📤 .json</button>
        <button class="btn sm" onclick="exportDeviceSyx('${dev.id}')">📤 .syx</button>
        ${!DEVICE_MANIFEST.includes(dev.id)
          ? `<button class="btn sm danger" onclick="removeDevice('${dev.id}')">🗑 Remove</button>`
          : '<span style="font-size:0.7rem;color:var(--text3);">built-in</span>'
        }
      </div>
    </div>`).join('');
}

function exportDeviceJSON(id) {
  const dev = State.devices.find(d => d.id === id); if (!dev) return;
  downloadJSON(dev, `${dev.id}.json`);
  toast(`${dev.name} exported ✓`, 'success');
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

function createNewDevice() {
  const id    = document.getElementById('new-dev-id')?.value.trim().replace(/\s+/g,'_');
  const name  = document.getElementById('new-dev-name')?.value.trim();
  if (!id || !name) { toast('ID and Name are required', 'error'); return; }
  if (State.devices.find(d => d.id === id)) { toast('Device ID already exists', 'error'); return; }

  const dev = {
    id,
    name,
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
if ('serviceWorker' in navigator) {
  const sw = `
    const CACHE='mc-v1';
    self.addEventListener('install', () => self.skipWaiting());
    self.addEventListener('activate', e => e.waitUntil(
      caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    ));
    self.addEventListener('fetch', e => {
      if (e.request.method !== 'GET') return;
      e.respondWith(caches.open(CACHE).then(c =>
        c.match(e.request).then(r => r || fetch(e.request).then(res => {
          c.put(e.request, res.clone()); return res;
        }))
      ));
    });`;
  try {
    const blob = new Blob([sw], { type:'application/javascript' });
    navigator.serviceWorker.register(URL.createObjectURL(blob))
      .catch(() => {}); // silent fail — blob SW blocked in some contexts
  } catch(e) {}
}

// ============================================================
//  INIT — async entry point
// ============================================================
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
function vkSendNoteOn(note) {
  highlightKey(note, true);
  if (State.midiOut) {
    const ch = State.activePresetIndex !== undefined && getActiveDev()?.defaultPresets?.[State.activePresetIndex]?.channel || 0;
    const vel = document.getElementById('vk-velocity') ? parseInt(document.getElementById('vk-velocity').value) : 100;
    sendMidiOut([0x90 + ch, note, vel]);
  }
}
function vkSendNoteOff(note) {
  highlightKey(note, false);
  if (State.midiOut) {
    const ch = State.activePresetIndex !== undefined && getActiveDev()?.defaultPresets?.[State.activePresetIndex]?.channel || 0;
    sendMidiOut([0x80 + ch, note, 0]);
  }
}

function renderVirtualKeyboard() {
  const vk = document.getElementById('virtual-keyboard');
  console.log('virtual-keyboard element exists:', !!vk);
  if(!vk) return;
  const startNote = 48; // C3
  let html = '';
  for(let i = 0; i < 25; i++) {
    const note = startNote + i;
    const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
    const active = activeKeys.has(note);
    if(isBlack) {
      html += `<div id="vk-${note}" 
        onmousedown="vkSendNoteOn(${note})" onmouseup="vkSendNoteOff(${note})" onmouseleave="vkSendNoteOff(${note})" ontouchstart="vkSendNoteOn(${note})" ontouchend="vkSendNoteOff(${note})"
        style="width:20px;height:50px;background:${active ? '#ef4444' : '#1e293b'};margin:0 -10px;z-index:10;border:1px solid #0f172a;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer; transition: background 0.1s;"></div>`;
    } else {
      html += `<div id="vk-${note}" 
        onmousedown="vkSendNoteOn(${note})" onmouseup="vkSendNoteOff(${note})" onmouseleave="vkSendNoteOff(${note})" ontouchstart="vkSendNoteOn(${note})" ontouchend="vkSendNoteOff(${note})"
        style="width:30px;height:80px;background:${active ? '#f87171' : '#f1f5f9'};border-right:1px solid #cbd5e1;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer;z-index:0; transition: background 0.1s;"></div>`;
    }
  }
  vk.innerHTML = html;
}
function highlightKey(note, state) {
  if(state) activeKeys.add(note);
  else activeKeys.delete(note);
  renderVirtualKeyboard();
}

function midiPanic() {
  if (!State.midiOut) {
    toast("No MIDI Out selected", "error");
    return;
  }
  for (let ch = 0; ch < 16; ch++) {
    sendMidiOut([0xB0 + ch, 0x7B, 0]); // All Notes Off (B0 7B 00)
    sendMidiOut([0xB0 + ch, 120, 0]); // All Sound Off
    sendMidiOut([0xB0 + ch, 64, 0]);  // Sustain off
  }
  toast("MIDI Panic: All Notes Off (B0 7B 00) sent", "info");
}

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
  container.innerHTML = sysexQueue.map(f => `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding:4px 0;"><span>${f.name}</span><span style="opacity:0.6">${(f.size/1024).toFixed(1)} KB</span></div>`).join('');
}


async function sendSysexQueue() {
  if (!State.midiOut) return toast("No MIDI Out selected", "error");
  if (sysexQueue.length === 0) return toast("No files queued", "error");
  
  toast(`Sending ${sysexQueue.length} files...`, "info");
  
  const pContainer = document.getElementById('sysex-progress-container');
  const pBar = document.getElementById('sysex-progress-bar');
  if (pContainer && pBar) {
    pContainer.style.display = 'block';
    pBar.style.width = '0%';
  }

  for (let i=0; i<sysexQueue.length; i++) {
    const file = sysexQueue[i];
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    sendMidiOut(data);
    
    if (pBar) {
      const pct = Math.round(((i + 1) / sysexQueue.length) * 100);
      pBar.style.width = pct + '%';
    }

    await new Promise(r => setTimeout(r, 200)); // Delay for buffer
  }
  
  if (pContainer) {
    setTimeout(() => { pContainer.style.display = 'none'; }, 1000);
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
  container.innerHTML = receivedTemplates.map((tmpl, i) => `
    <div style="background:var(--surface2);border:1px solid var(--border);padding:6px;border-radius:4px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-weight:bold;">
        <span>Captured Template ${i+1}</span>
        <span style="opacity:0.6">${tmpl.length} bytes</span>
      </div>
      <div style="display:flex;gap:4px;">
        <button class="btn sm" style="flex:1;" onclick="sendCapturedTemplate(${i})">▶ Send Back</button>
        <button class="btn sm" style="flex:1;" onclick="downloadCapturedTemplate(${i})">💾 Save .syx</button>
      </div>
    </div>
  `).join('');
}

function sendCapturedTemplate(i) {
  if (!State.midiOut) return toast("No MIDI Out selected", "error");
  sendMidiOut(receivedTemplates[i]);
  toast("Template sent", "info");
}

function downloadCapturedTemplate(i) {
  const data = receivedTemplates[i];
  const blob = new Blob([data], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; 
  a.download = `captured_template_${i+1}.syx`;
  a.click();
  URL.revokeObjectURL(url);
}

// Hook into SysEx listener to capture templates (like Novation Dumps)
const originalOnMidiMessage = onMidiMessage;
onMidiMessage = function(event) {
  const data = event.data;
  if(data[0] === 0xF0 && data.length > 8) {
    // Looks like a bulk dump
    receivedTemplates.push(data);
    if(typeof renderReceivedTemplates === 'function') renderReceivedTemplates();
    toast("SysEx Template Captured", "info");
  }
  originalOnMidiMessage(event);
};

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
  a.download = (dev.name || "preset").replace(/\s+/g, '_') + ".syx";
  a.click();
  URL.revokeObjectURL(url);
}

function previewPresetFromManager(id) {
  const dev = State.devices.find(d => d.id === id);
  if (!dev) return;
  
  const preset = dev.defaultPresets?.[0] || {};
  const tags = dev.tags && dev.tags.length > 0 ? dev.tags.join(', ') : 'None';
  
  let knobsHtml = (preset.knobs || dev.controls?.knobs || []).map(k => `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--surface3);padding:2px 0;"><span>${k.label || 'Knob'}</span><span>CC ${k.cc}</span></div>`).join('');
  let padsHtml = (preset.pads || dev.controls?.pads || []).map(p => `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--surface3);padding:2px 0;"><span>${p.label || 'Pad'}</span><span>Note ${p.note}</span></div>`).join('');
  
  const html = `
    <h3 style="margin-top:0;font-size:1.2rem;border-bottom:1px solid var(--border);padding-bottom:8px;">Preview: ${dev.name}</h3>
    <p style="font-size:0.85rem;color:var(--text2);margin-bottom:12px;">${dev.description||'No description provided.'}</p>
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
      <button class="btn" onclick="closeModal()">Close Preview</button>
      <button class="btn primary" onclick="closeModal(); selectDevice('${dev.id}'); showPanel('editor');">Load in Editor</button>
    </div>
  `;
  openModal(html);
}

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




let midiOutQueue = [];
let isFlushingMidi = false;

function flushMidiQueue() {
  if (midiOutQueue.length === 0) {
    isFlushingMidi = false;
    return;
  }
  // take up to 20 messages at once
  const batch = midiOutQueue.splice(0, 20);
  batch.forEach(data => {
    try {
      State.midiOut.send(data);
    } catch(e) {
      console.error('MIDI Send Error:', e);
    }
  });
  if (midiOutQueue.length > 0) {
    setTimeout(flushMidiQueue, 10);
  } else {
    isFlushingMidi = false;
  }
}

function sendMidiOut(data) {
  if (State.midiOut) {
    flashActivity('out');
    midiOutQueue.push(data);
    if (!isFlushingMidi) {
      isFlushingMidi = true;
      flushMidiQueue();
    }
  }
}


window.sendFactoryReset = function() {
  if (!State.midiOut) return toast("No MIDI Out selected", "error");
  // F0 7E 7F 09 01 F7
  sendMidiOut([0xF0, 0x7E, 0x7F, 0x09, 0x01, 0xF7]);
  toast('Factory Reset (All-System-Reset) Sent', 'warning');
};


let recentCCs = [];
window.trackRecentCC = function(cc, ch) {
  const label = `CC ${cc} (Ch ${ch+1})`;
  // remove if exists
  recentCCs = recentCCs.filter(x => x !== label);
  recentCCs.unshift(label);
  if (recentCCs.length > 5) recentCCs.pop();
  
  const container = document.getElementById('recent-cc-monitor');
  if (container) {
    container.innerHTML = recentCCs.map(r => `
      <span style="background:var(--surface3); border:1px solid var(--border); padding:2px 8px; border-radius:12px; font-size:0.75rem; color:var(--text2); display:inline-block;">
        ${r}
      </span>
    `).join('');
  }
};
