// ============================================================
//  DEVICE MANIFEST — add folder names here to auto-load
// ============================================================
const DEVICE_MANIFEST = [
  "akai_lpd8_v1",
  "akai_midimix",
  "novation_launchcontrol_mk1",
  "novation_nocturn",
  "novation_remote_zero_sl_mk1",
  "novation_remote25_sl_compact_mk1"
];

// ============================================================
//  STATE
// ============================================================
const State = {
  devices: [],
  activeDeviceId: null,
  activePresetIndex: 0,
  midiAccess: null,
  midiIn: null,
  midiOut: null,
  monitorMsgs: [],
  monitorPaused: false,
  settings: { thru:false, highlight:true, autorefresh:true, notenames:true, hex:false, compact:false },
  backups: [],
  liveValues: {},
};

// ============================================================
//  PERSIST (localStorage — presets + backups only, not base config)
// ============================================================
function saveState() {
  // Save only user-modified preset data keyed by device id
  const presetOverrides = {};
  State.devices.forEach(d => {
    presetOverrides[d.id] = d.defaultPresets;
  });
  localStorage.setItem('mc_presets',  JSON.stringify(presetOverrides));
  localStorage.setItem('mc_backups',  JSON.stringify(State.backups));
  localStorage.setItem('mc_settings', JSON.stringify(State.settings));
  // Save any user-added devices (those not in DEVICE_MANIFEST)
  const userDevices = State.devices.filter(d => !DEVICE_MANIFEST.includes(d.id));
  localStorage.setItem('mc_user_devices', JSON.stringify(userDevices));
}
// Keep old alias so all existing code that calls save() still works
const save = saveState;

// ============================================================
//  LOAD — fetch device JSONs, then merge saved state
// ============================================================
async function loadDevices() {
  const loaded = [];

  // Show loading state in sidebar
  document.getElementById('device-list').innerHTML =
    '<div style="padding:8px 12px;font-size:0.75rem;color:var(--text3);">Loading devices…</div>';

  // 1. Fetch all devices from DEVICE_MANIFEST in parallel
  const fetches = DEVICE_MANIFEST.map(async (folder) => {
    try {
      const res = await fetch(`devices/${folder}/device.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const dev = await res.json();
      return dev;
    } catch (e) {
      console.warn(`[MidiControls] Could not load devices/${folder}/device.json:`, e.message);
      return null;
    }
  });

  const results = await Promise.all(fetches);
  results.forEach(dev => { if (dev) loaded.push(dev); });

  // 2. Load user-added devices from localStorage
  try {
    const ud = localStorage.getItem('mc_user_devices');
    if (ud) {
      const userDevices = JSON.parse(ud);
      userDevices.forEach(dev => {
        if (!loaded.find(d => d.id === dev.id)) loaded.push(dev);
      });
    }
  } catch(e) { console.warn('Could not load user devices:', e); }

  // 3. Merge saved preset overrides back into loaded devices
  try {
    const po = localStorage.getItem('mc_presets');
    if (po) {
      const overrides = JSON.parse(po);
      loaded.forEach(dev => {
        if (overrides[dev.id]) dev.defaultPresets = overrides[dev.id];
      });
    }
  } catch(e) { console.warn('Could not restore presets:', e); }

  // 4. Load backups + settings
  try {
    const b = localStorage.getItem('mc_backups');
    if (b) State.backups = JSON.parse(b);
    const s = localStorage.getItem('mc_settings');
    if (s) State.settings = { ...State.settings, ...JSON.parse(s) };
  } catch(e) {}

  State.devices = loaded;

  // 5. Warn if no devices loaded at all (file:// protocol)
  if (!loaded.length) {
    showNoDevicesWarning();
  }

  return loaded;
}

function showNoDevicesWarning() {
  document.getElementById('editor-welcome').innerHTML = `
    <div class="big-icon">⚠️</div>
    <h2>Devices could not be loaded</h2>
    <p>
      <strong>fetch()</strong> is blocked when opening as a local <code>file://</code> URL.<br><br>
      Run a local HTTP server instead:<br><br>
      <code style="background:var(--surface2);padding:6px 12px;border-radius:6px;display:inline-block;margin:4px 0;">
        npx serve .
      </code><br>
      <code style="background:var(--surface2);padding:6px 12px;border-radius:6px;display:inline-block;margin:4px 0;">
        python3 -m http.server 8080
      </code><br><br>
      Then open <strong>http://localhost:8080</strong><br><br>
      Or drag & drop a <code>device.json</code> file onto this page to import directly.
    </p>`;
}

// ============================================================
//  DEVICE MANAGER — import helper updated to call saveState
// ============================================================
function handleImportDevice(evt) {
  const file = evt.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const dev = JSON.parse(e.target.result);
      if (!dev.id || !dev.name) throw new Error('Missing id or name');
      const exists = State.devices.findIndex(d => d.id === dev.id);
      if (exists >= 0) State.devices[exists] = dev; else State.devices.push(dev);
      saveState(); renderSidebar(); renderDeviceManager();
      toast(`Device "${dev.name}" imported ✓`, 'success');
    } catch(e) { toast('Invalid device JSON: ' + e.message, 'error'); }
  };
  reader.readAsText(file);
}

// ============================================================
//  INIT — async, waits for device JSONs
// ============================================================
async function init() {
  await loadDevices();
  renderSidebar();
  renderSettings();
  renderBackupList();
  initMidi();
  if (State.devices.length) {
    selectDevice(State.devices[0].id);
  }
}

init();
