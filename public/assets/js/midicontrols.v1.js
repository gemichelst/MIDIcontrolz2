// ============================================================
//  DEVICE DATABASE (JSON templates embedded)
// ============================================================
const BUILTIN_DEVICES = [

// ── AKAI LPD8 v1 ────────────────────────────────────────────
{
  id: "akai_lpd8_v1",
  name: "LPD8",
  manufacturer: "Akai Professional",
  icon: "🥁",
  color: "#cc2929",
  midiName: ["LPD8", "Akai LPD8"],
  sysex: false,
  presets: 4,
  description: "8-pad, 8-knob USB MIDI pad controller",
  controls: {
    pads: [
      { id:"pad1", label:"Pad 1", note:36, cc:1,  pc:0,  mode:"Momentary" },
      { id:"pad2", label:"Pad 2", note:37, cc:2,  pc:1,  mode:"Momentary" },
      { id:"pad3", label:"Pad 3", note:38, cc:3,  pc:2,  mode:"Momentary" },
      { id:"pad4", label:"Pad 4", note:39, cc:4,  pc:3,  mode:"Momentary" },
      { id:"pad5", label:"Pad 5", note:40, cc:1,  pc:4,  mode:"Momentary" },
      { id:"pad6", label:"Pad 6", note:41, cc:2,  pc:5,  mode:"Momentary" },
      { id:"pad7", label:"Pad 7", note:42, cc:3,  pc:6,  mode:"Momentary" },
      { id:"pad8", label:"Pad 8", note:43, cc:4,  pc:7,  mode:"Momentary" }
    ],
    knobs: [
      { id:"k1", label:"K1", cc:1,  lo:0, hi:127 },
      { id:"k2", label:"K2", cc:2,  lo:0, hi:127 },
      { id:"k3", label:"K3", cc:3,  lo:0, hi:127 },
      { id:"k4", label:"K4", cc:4,  lo:0, hi:127 },
      { id:"k5", label:"K5", cc:5,  lo:0, hi:127 },
      { id:"k6", label:"K6", cc:6,  lo:0, hi:127 },
      { id:"k7", label:"K7", cc:7,  lo:0, hi:127 },
      { id:"k8", label:"K8", cc:8,  lo:0, hi:127 }
    ]
  },
  defaultPresets: [
    { name:"Preset 1", channel:1, pads:[
      {note:36,cc:1,pc:0,mode:"Momentary"},{note:37,cc:2,pc:1,mode:"Momentary"},
      {note:38,cc:3,pc:2,mode:"Momentary"},{note:39,cc:4,pc:3,mode:"Momentary"},
      {note:40,cc:1,pc:4,mode:"Momentary"},{note:41,cc:2,pc:5,mode:"Momentary"},
      {note:42,cc:3,pc:6,mode:"Momentary"},{note:43,cc:4,pc:7,mode:"Momentary"}
    ], knobs:[
      {cc:1,lo:0,hi:127},{cc:2,lo:0,hi:127},{cc:3,lo:0,hi:127},{cc:4,lo:0,hi:127},
      {cc:5,lo:0,hi:127},{cc:6,lo:0,hi:127},{cc:7,lo:0,hi:127},{cc:8,lo:0,hi:127}
    ]},
    { name:"Preset 2 (Ableton)", channel:8, pads:[
      {note:88,cc:30,pc:24,mode:"Momentary"},{note:89,cc:31,pc:25,mode:"Momentary"},
      {note:90,cc:32,pc:26,mode:"Momentary"},{note:91,cc:33,pc:27,mode:"Momentary"},
      {note:92,cc:26,pc:28,mode:"Momentary"},{note:93,cc:27,pc:29,mode:"Momentary"},
      {note:94,cc:28,pc:30,mode:"Momentary"},{note:95,cc:29,pc:31,mode:"Momentary"}
    ], knobs:[
      {cc:50,lo:0,hi:127},{cc:51,lo:0,hi:127},{cc:52,lo:0,hi:127},{cc:53,lo:0,hi:127},
      {cc:54,lo:0,hi:127},{cc:55,lo:0,hi:127},{cc:56,lo:0,hi:127},{cc:57,lo:0,hi:127}
    ]},
    { name:"Preset 3 (Toggle)", channel:8, pads:[
      {note:76,cc:30,pc:0,mode:"Toggle"},{note:77,cc:31,pc:1,mode:"Toggle"},
      {note:78,cc:32,pc:2,mode:"Toggle"},{note:79,cc:33,pc:3,mode:"Toggle"},
      {note:80,cc:26,pc:4,mode:"Toggle"},{note:81,cc:27,pc:5,mode:"Toggle"},
      {note:82,cc:28,pc:6,mode:"Toggle"},{note:83,cc:29,pc:7,mode:"Toggle"}
    ], knobs:[
      {cc:42,lo:0,hi:127},{cc:43,lo:0,hi:127},{cc:44,lo:0,hi:127},{cc:45,lo:0,hi:127},
      {cc:46,lo:0,hi:127},{cc:47,lo:0,hi:127},{cc:48,lo:0,hi:127},{cc:49,lo:0,hi:127}
    ]},
    { name:"Preset 4 (Toggle2)", channel:8, pads:[
      {note:64,cc:30,pc:8,mode:"Toggle"},{note:65,cc:31,pc:9,mode:"Toggle"},
      {note:66,cc:32,pc:10,mode:"Toggle"},{note:67,cc:33,pc:11,mode:"Toggle"},
      {note:68,cc:26,pc:12,mode:"Toggle"},{note:69,cc:27,pc:13,mode:"Toggle"},
      {note:70,cc:28,pc:14,mode:"Toggle"},{note:71,cc:29,pc:15,mode:"Toggle"}
    ], knobs:[
      {cc:34,lo:0,hi:127},{cc:35,lo:0,hi:127},{cc:36,lo:0,hi:127},{cc:37,lo:0,hi:127},
      {cc:38,lo:0,hi:127},{cc:39,lo:0,hi:127},{cc:40,lo:0,hi:127},{cc:41,lo:0,hi:127}
    ]}
  ],
  quickSysEx: []
},

// ── AKAI MIDImix ────────────────────────────────────────────
{
  id: "akai_midimix",
  name: "MIDImix",
  manufacturer: "Akai Professional",
  icon: "🎚️",
  color: "#e67e22",
  midiName: ["MIDI Mix", "MIDImix"],
  sysex: false,
  presets: 1,
  description: "8-channel MIDI mixer — 24 knobs, 8 faders, Mute/Solo/RecArm buttons",
  controls: {
    knobs: [
      {id:"ch1k1",label:"Ch1 K1",cc:16},{id:"ch1k2",label:"Ch1 K2",cc:17},{id:"ch1k3",label:"Ch1 K3",cc:18},
      {id:"ch2k1",label:"Ch2 K1",cc:20},{id:"ch2k2",label:"Ch2 K2",cc:21},{id:"ch2k3",label:"Ch2 K3",cc:22},
      {id:"ch3k1",label:"Ch3 K1",cc:24},{id:"ch3k2",label:"Ch3 K2",cc:25},{id:"ch3k3",label:"Ch3 K3",cc:26},
      {id:"ch4k1",label:"Ch4 K1",cc:28},{id:"ch4k2",label:"Ch4 K2",cc:29},{id:"ch4k3",label:"Ch4 K3",cc:30},
      {id:"ch5k1",label:"Ch5 K1",cc:46},{id:"ch5k2",label:"Ch5 K2",cc:47},{id:"ch5k3",label:"Ch5 K3",cc:48},
      {id:"ch6k1",label:"Ch6 K1",cc:50},{id:"ch6k2",label:"Ch6 K2",cc:51},{id:"ch6k3",label:"Ch6 K3",cc:52},
      {id:"ch7k1",label:"Ch7 K1",cc:54},{id:"ch7k2",label:"Ch7 K2",cc:55},{id:"ch7k3",label:"Ch7 K3",cc:56},
      {id:"ch8k1",label:"Ch8 K1",cc:58},{id:"ch8k2",label:"Ch8 K2",cc:59},{id:"ch8k3",label:"Ch8 K3",cc:60}
    ],
    faders: [
      {id:"f1",label:"Ch 1",cc:19},{id:"f2",label:"Ch 2",cc:23},{id:"f3",label:"Ch 3",cc:27},
      {id:"f4",label:"Ch 4",cc:31},{id:"f5",label:"Ch 5",cc:49},{id:"f6",label:"Ch 6",cc:53},
      {id:"f7",label:"Ch 7",cc:57},{id:"f8",label:"Ch 8",cc:61},{id:"master",label:"Master",cc:62}
    ],
    buttons: [
      {id:"mute1",label:"Mute 1",cc:1,note:1,color:"amber"},
      {id:"mute2",label:"Mute 2",cc:2,note:2,color:"amber"},
      {id:"mute3",label:"Mute 3",cc:3,note:3,color:"amber"},
      {id:"mute4",label:"Mute 4",cc:4,note:4,color:"amber"},
      {id:"mute5",label:"Mute 5",cc:5,note:5,color:"amber"},
      {id:"mute6",label:"Mute 6",cc:6,note:6,color:"amber"},
      {id:"mute7",label:"Mute 7",cc:7,note:7,color:"amber"},
      {id:"mute8",label:"Mute 8",cc:8,note:8,color:"amber"},
      {id:"solo",label:"Solo",cc:9,note:9,color:"green"},
      {id:"rec1",label:"RecArm 1",cc:10,note:10,color:"red"},
      {id:"rec2",label:"RecArm 2",cc:11,note:11,color:"red"},
      {id:"rec3",label:"RecArm 3",cc:12,note:12,color:"red"},
      {id:"rec4",label:"RecArm 4",cc:13,note:13,color:"red"},
      {id:"rec5",label:"RecArm 5",cc:14,note:14,color:"red"},
      {id:"rec6",label:"RecArm 6",cc:15,note:15,color:"red"},
      {id:"rec7",label:"RecArm 7",cc:16,note:16,color:"red"},
      {id:"rec8",label:"RecArm 8",cc:17,note:17,color:"red"}
    ]
  },
  defaultPresets: [{
    name:"Default",channel:1,
    knobs:[
      {cc:16},{cc:17},{cc:18},{cc:20},{cc:21},{cc:22},{cc:24},{cc:25},{cc:26},
      {cc:28},{cc:29},{cc:30},{cc:46},{cc:47},{cc:48},{cc:50},{cc:51},{cc:52},
      {cc:54},{cc:55},{cc:56},{cc:58},{cc:59},{cc:60}
    ],
    faders:[{cc:19},{cc:23},{cc:27},{cc:31},{cc:49},{cc:53},{cc:57},{cc:61},{cc:62}],
    buttons:[
      {note:1},{note:2},{note:3},{note:4},{note:5},{note:6},{note:7},{note:8},
      {note:9},{note:10},{note:11},{note:12},{note:13},{note:14},{note:15},{note:16},{note:17}
    ]
  }],
  quickSysEx: []
},

// ── NOVATION LAUNCH CONTROL mk1 ─────────────────────────────
{
  id: "novation_launchcontrol_mk1",
  name: "Launch Control",
  manufacturer: "Novation",
  icon: "🔲",
  color: "#e74c3c",
  midiName: ["Launch Control"],
  sysex: true,
  presets: 16,
  description: "8 pads + 4 buttons, 16 templates, bi-colour LEDs",
  controls: {
    pads: [
      {id:"p1",label:"Pad 1",note:9, cc:9, ledIndex:0},
      {id:"p2",label:"Pad 2",note:10,cc:10,ledIndex:1},
      {id:"p3",label:"Pad 3",note:11,cc:11,ledIndex:2},
      {id:"p4",label:"Pad 4",note:12,cc:12,ledIndex:3},
      {id:"p5",label:"Pad 5",note:25,cc:25,ledIndex:4},
      {id:"p6",label:"Pad 6",note:26,cc:26,ledIndex:5},
      {id:"p7",label:"Pad 7",note:27,cc:27,ledIndex:6},
      {id:"p8",label:"Pad 8",note:28,cc:28,ledIndex:7}
    ],
    buttons: [
      {id:"b1",label:"Btn 1",note:0,ledIndex:8 ,color:"red"},
      {id:"b2",label:"Btn 2",note:1,ledIndex:9 ,color:"red"},
      {id:"b3",label:"Btn 3",note:2,ledIndex:10,color:"red"},
      {id:"b4",label:"Btn 4",note:3,ledIndex:11,color:"red"}
    ]
  },
  defaultPresets: Array.from({length:8},(_,i)=>({
    name:`User Template ${i+1}`,
    templateIndex: i,
    channel: i
  })),
  quickSysEx: [
    { label:"Change Template 0",  bytes:"F0 00 20 29 02 0A 77 00 F7" },
    { label:"Change Template 1",  bytes:"F0 00 20 29 02 0A 77 01 F7" },
    { label:"All LEDs Off (T0)",  bytes:"B0 00 00" },
    { label:"All LEDs Full (T0)", bytes:"B0 00 7F" },
    { label:"LED Red Full (P1)",  bytes:"F0 00 20 29 02 0A 78 00 00 0F F7" },
    { label:"LED Green Full (P1)","bytes":"F0 00 20 29 02 0A 78 00 00 3C F7" }
  ]
},

// ── NOVATION NOCTURN ─────────────────────────────────────────
{
  id: "novation_nocturn",
  name: "Nocturn",
  manufacturer: "Novation",
  icon: "🌙",
  color: "#8e44ad",
  midiName: ["Nocturn"],
  sysex: true,
  presets: 8,
  description: "8 endless encoders + 9th speed dial, 8 buttons, Automap capable",
  controls: {
    knobs: [
      {id:"enc1",label:"Enc 1",cc:74},{id:"enc2",label:"Enc 2",cc:10},
      {id:"enc3",label:"Enc 3",cc:71},{id:"enc4",label:"Enc 4",cc:76},
      {id:"enc5",label:"Enc 5",cc:77},{id:"enc6",label:"Enc 6",cc:93},
      {id:"enc7",label:"Enc 7",cc:73},{id:"enc8",label:"Enc 8",cc:75},
      {id:"speed",label:"Speed",cc:7}
    ],
    buttons: [
      {id:"btn1",label:"Btn 1",note:112},{id:"btn2",label:"Btn 2",note:113},
      {id:"btn3",label:"Btn 3",note:114},{id:"btn4",label:"Btn 4",note:115},
      {id:"btn5",label:"Btn 5",note:116},{id:"btn6",label:"Btn 6",note:117},
      {id:"btn7",label:"Btn 7",note:118},{id:"btn8",label:"Btn 8",note:119}
    ]
  },
  defaultPresets: Array.from({length:8},(_,i)=>({ name:`Preset ${i+1}`, channel:i })),
  quickSysEx: [
    { label:"Automap On",  bytes:"F0 00 20 29 40 5C F7" },
    { label:"Automap Off", bytes:"F0 00 20 29 40 5D F7" }
  ]
},

// ── NOVATION REMOTE ZERO SL mk1 ──────────────────────────────
{
  id: "novation_remote_zero_sl_mk1",
  name: "Remote Zero SL mk1",
  manufacturer: "Novation",
  icon: "🎚️",
  color: "#2980b9",
  midiName: ["SL MkII","Remote SL","Zero SL"],
  sysex: true,
  presets: 40,
  description: "Zero-key Remote SL, 8 encoders, 8 faders, LCD display, Automap",
  controls: {
    knobs: Array.from({length:8},(_,i)=>({id:`enc${i+1}`,label:`Enc ${i+1}`,cc:i+21})),
    faders: Array.from({length:8},(_,i)=>({id:`fdr${i+1}`,label:`Fader ${i+1}`,cc:i+41})),
    buttons: [
      ...Array.from({length:8},(_,i)=>({id:`btn${i+1}`,label:`Btn ${i+1}`,note:i+112})),
      {id:"rewind",label:"Rewind",cc:116,note:116},
      {id:"fwd",label:"Forward",cc:117,note:117},
      {id:"stop",label:"Stop",cc:115,note:115},
      {id:"play",label:"Play",cc:118,note:118},
      {id:"loop",label:"Loop",cc:113,note:113},
      {id:"record",label:"Record",cc:119,note:119}
    ]
  },
  defaultPresets: Array.from({length:8},(_,i)=>({ name:`Preset ${i+1}`, channel:i })),
  quickSysEx: [
    { label:"Init SL (Automap)",  bytes:"F0 00 20 29 03 03 12 01 F7" },
    { label:"LCD Line 1 Hello",   bytes:"F0 00 20 29 03 03 04 00 48 65 6C 6C 6F 00 F7" }
  ]
},

// ── NOVATION REMOTE 25 SL COMPACT mk1 ───────────────────────
{
  id: "novation_remote25_sl_compact_mk1",
  name: "Remote 25 SL Compact",
  manufacturer: "Novation",
  icon: "🎹",
  color: "#27ae60",
  midiName: ["SL Compact","Remote 25","SL MkII"],
  sysex: true,
  presets: 40,
  description: "25-key controller, 8 encoders, 8 drum pads, LCD, Automap",
  controls: {
    pads: Array.from({length:8},(_,i)=>({id:`pad${i+1}`,label:`Pad ${i+1}`,note:i+36,cc:i+36,mode:"Momentary"})),
    knobs: Array.from({length:8},(_,i)=>({id:`enc${i+1}`,label:`Enc ${i+1}`,cc:i+21})),
    buttons: [
      {id:"rewind",label:"Rewind",note:116},{id:"fwd",label:"Forward",note:117},
      {id:"stop",label:"Stop",note:115},   {id:"play",label:"Play",note:118},
      {id:"loop",label:"Loop",note:113},   {id:"record",label:"Record",note:119}
    ]
  },
  defaultPresets: Array.from({length:8},(_,i)=>({ name:`Preset ${i+1}`, channel:0 })),
  quickSysEx: [
    { label:"Init SL",           bytes:"F0 00 20 29 03 03 12 01 F7" },
    { label:"LCD Write 'Hi'",    bytes:"F0 00 20 29 03 03 04 00 48 69 00 F7" }
  ]
}

]; // end BUILTIN_DEVICES

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
  midiLearnTarget: null,
  liveValues: {},   // { "cc_CH_NUM": 0-127 }
};

function save() {
  localStorage.setItem('midicontrols_devices', JSON.stringify(State.devices));
  localStorage.setItem('midicontrols_backups', JSON.stringify(State.backups));
  localStorage.setItem('midicontrols_settings', JSON.stringify(State.settings));
}
function load() {
  try {
    const d = localStorage.getItem('midicontrols_devices');
    State.devices = d ? JSON.parse(d) : JSON.parse(JSON.stringify(BUILTIN_DEVICES));
    const b = localStorage.getItem('midicontrols_backups');
    State.backups = b ? JSON.parse(b) : [];
    const s = localStorage.getItem('midicontrols_settings');
    if (s) State.settings = { ...State.settings, ...JSON.parse(s) };
  } catch(e) {
    State.devices = JSON.parse(JSON.stringify(BUILTIN_DEVICES));
  }
  if (!State.devices.length) State.devices = JSON.parse(JSON.stringify(BUILTIN_DEVICES));
}

// ============================================================
//  NOTE NAMES
// ============================================================
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function noteName(n) {
  if (!State.settings.notenames) return n;
  const oct = Math.floor(n/12)-1;
  return `${NOTE_NAMES[n%12]}${oct}`;
}

// ============================================================
//  PANEL SWITCHING
// ============================================================
function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`panel-${name}`).classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  if (name === 'backup') renderBackupList();
  if (name === 'manager') renderDeviceManager();
  if (name === 'settings') renderSettings();
}

// ============================================================
//  SIDEBAR & DEVICE LIST
// ============================================================
function renderSidebar() {
  const el = document.getElementById('device-list');
  el.innerHTML = '';
  State.devices.forEach(dev => {
    const card = document.createElement('div');
    card.className = 'device-card' + (State.activeDeviceId === dev.id ? ' active' : '');
    const isConn = State.midiIn && State.midiIn.name &&
      (dev.midiName||[]).some(n => State.midiIn.name.includes(n));
    card.innerHTML = `
      <div class="device-icon">${dev.icon||'🎹'}</div>
      <div>
        <div class="dname">${dev.name}</div>
        <div class="dmfr">${dev.manufacturer||''}</div>
      </div>
      <div class="dstatus ${isConn?'on':''}"></div>`;
    card.onclick = () => selectDevice(dev.id);
    el.appendChild(card);
  });
}

function selectDevice(id) {
  State.activeDeviceId = id;
  State.activePresetIndex = 0;
  renderSidebar();
  renderDeviceEditor();
  renderSysExQuickCmds();
}

// ============================================================
//  DEVICE EDITOR
// ============================================================
function renderDeviceEditor() {
  const welcome = document.getElementById('editor-welcome');
  const container = document.getElementById('editor-device');
  if (!State.activeDeviceId) {
    welcome.style.display = '';
    container.style.display = 'none';
    return;
  }
  welcome.style.display = 'none';
  container.style.display = '';
  const dev = State.devices.find(d => d.id === State.activeDeviceId);
  if (!dev) return;

  const presets = dev.defaultPresets || [];
  const preset = presets[State.activePresetIndex] || {};
  const ch = preset.channel ?? 0;

  let html = `
  <div class="device-header">
    <div class="device-thumb" style="border-color:${dev.color||'var(--border)'}">
      ${dev.icon||'🎹'}
    </div>
    <div class="device-info">
      <h1>${dev.name}</h1>
      <div class="mfr">${dev.manufacturer||''} — ${dev.description||''}</div>
      <div class="device-actions">
        <button class="btn primary" onclick="readFromDevice()">⬇ Read Device</button>
        <button class="btn success" onclick="writeToDevice()">⬆ Write Device</button>
        <button class="btn" onclick="exportPresetJSON()">📤 Export JSON</button>
        <button class="btn" onclick="saveBackup()">💾 Backup</button>
      </div>
    </div>
  </div>`;

  // PRESET TABS
  if (presets.length > 1) {
    html += `<div class="preset-tabs">`;
    presets.forEach((p, i) => {
      html += `<button class="preset-tab ${i===State.activePresetIndex?'active':''}"
        onclick="selectPreset(${i})">${p.name || `Preset ${i+1}`}</button>`;
    });
    html += `</div>`;
  }

  // CHANNEL BAR
  html += `<div class="channel-bar">
    <label>MIDI Channel:</label>
    <select onchange="setPresetChannel(this.value)">
      ${Array.from({length:16},(_,i)=>`<option value="${i}" ${ch===i?'selected':''}>Ch ${i+1}</option>`).join('')}
    </select>
    <span style="font-size:0.75rem;color:var(--text3);margin-left:8px;">
      Device: ${State.midiIn ? State.midiIn.name : 'Not connected'}
    </span>
  </div>`;

  // RENDER CONTROLS
  const ctrl = dev.controls || {};

  // PADS
  if (ctrl.pads && ctrl.pads.length) {
    html += `<div class="section-header"><h3>Pads</h3><div class="section-line"></div></div>`;
    html += `<div class="controls-grid">`;
    ctrl.pads.forEach((pad, pi) => {
      const pd = (preset.pads && preset.pads[pi]) || pad;
      const isToggle = (pd.mode||'Momentary') === 'Toggle';
      html += `
      <div class="ctrl-pad" id="ctrl-pad-${pi}">
        <div class="pad-label">
          <span>${pad.label}</span>
          <button class="midi-learn-btn" onclick="startMidiLearn('pad-note-${pi}')">LEARN</button>
        </div>
        <div class="pad-surface" title="Note: ${noteName(pd.note||0)} (${pd.note||0})">
          <span style="font-size:0.9rem;">${noteName(pd.note||0)}</span>
        </div>
        <div class="ctrl-row">
          <label>Note</label>
          <input type="number" min="0" max="127" value="${pd.note||0}"
            onchange="updatePad(${pi},'note',this.value)">
        </div>
        <div class="ctrl-row">
          <label>CC</label>
          <input type="number" min="0" max="127" value="${pd.cc||0}"
            onchange="updatePad(${pi},'cc',this.value)">
        </div>
        <div class="ctrl-row">
          <label>PC</label>
          <input type="number" min="0" max="127" value="${pd.pc||0}"
            onchange="updatePad(${pi},'pc',this.value)">
        </div>
        <button class="mode-toggle ${isToggle?'toggle-mode':''}"
          onclick="togglePadMode(${pi})">${pd.mode||'Momentary'}</button>
      </div>`;
    });
    html += `</div>`;
  }

  // KNOBS
  if (ctrl.knobs && ctrl.knobs.length) {
    html += `<div class="section-header"><h3>Knobs / Encoders</h3><div class="section-line"></div></div>`;
    html += `<div class="controls-grid">`;
    ctrl.knobs.forEach((knob, ki) => {
      const kd = (preset.knobs && preset.knobs[ki]) || knob;
      const liveKey = `cc_${ch}_${kd.cc||0}`;
      const val = State.liveValues[liveKey] ?? 64;
      const deg = Math.round((val/127)*270 - 135);
      html += `
      <div class="ctrl-knob">
        <div class="knob-label">${knob.label}</div>
        <div class="knob-vis" id="knob-vis-${ki}"
          style="transform:rotate(${deg}deg)"
          title="CC ${kd.cc||0} = ${val}"
          data-ki="${ki}" data-val="${val}"
          onmousedown="startKnobDrag(event,${ki})">
          ${val}
        </div>
        <div class="ctrl-row">
          <label>CC</label>
          <input type="number" min="0" max="127" value="${kd.cc||0}"
            onchange="updateKnob(${ki},'cc',this.value)">
        </div>
        <div class="knob-range">
          <input type="number" min="0" max="127" value="${kd.lo??0}"
            title="Lo" onchange="updateKnob(${ki},'lo',this.value)">
          <input type="number" min="0" max="127" value="${kd.hi??127}"
            title="Hi" onchange="updateKnob(${ki},'hi',this.value)">
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  // FADERS
  if (ctrl.faders && ctrl.faders.length) {
    html += `<div class="section-header"><h3>Faders</h3><div class="section-line"></div></div>`;
    html += `<div class="controls-grid">`;
    ctrl.faders.forEach((fdr, fi) => {
      const fd = (preset.faders && preset.faders[fi]) || fdr;
      const liveKey = `cc_${ch}_${fd.cc||0}`;
      const val = State.liveValues[liveKey] ?? 0;
      const pct = Math.round((val/127)*100);
      html += `
      <div class="ctrl-fader">
        <div class="fader-label">${fdr.label}</div>
        <div class="fader-track">
          <div class="fader-fill" style="height:${pct}%"></div>
          <div class="fader-thumb" style="bottom:${pct}%; transform:translateY(50%)"></div>
        </div>
        <div class="fader-cc">CC ${fd.cc||0}</div>
        <div class="fader-val">${val}</div>
      </div>`;
    });
    html += `</div>`;
  }

  // BUTTONS (LED)
  if (ctrl.buttons && ctrl.buttons.length) {
    html += `<div class="section-header"><h3>Buttons / LEDs</h3><div class="section-line"></div></div>`;
    html += `<div class="controls-grid">`;
    ctrl.buttons.forEach((btn, bi) => {
      const liveKey = `note_${ch}_${btn.note||0}`;
      const on = !!State.liveValues[liveKey];
      const colorClass = on ? `led-${btn.color||'green'}` : 'led-off';
      html += `
      <div class="ctrl-button" id="ctrl-btn-${bi}">
        <div class="btn-surface ${colorClass}" onclick="toggleLED(${bi})"
          title="${btn.label} — Note ${btn.note||0} / CC ${btn.cc||0}">
          <span style="font-size:1.2rem">${on?'💡':''}</span>
        </div>
        <div style="font-size:0.7rem;color:var(--text3);text-align:center;">
          ${btn.label}<br>N:${btn.note??'-'} CC:${btn.cc??'-'}
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

// ============================================================
//  PRESET / CONTROL UPDATE HELPERS
// ============================================================
function getActivePreset() {
  const dev = State.devices.find(d => d.id === State.activeDeviceId);
  if (!dev) return null;
  if (!dev.defaultPresets) dev.defaultPresets = [{}];
  return dev.defaultPresets[State.activePresetIndex];
}
function selectPreset(i) { State.activePresetIndex = i; renderDeviceEditor(); }
function setPresetChannel(val) {
  const p = getActivePreset(); if (p) { p.channel = parseInt(val); save(); }
}
function updatePad(pi, key, val) {
  const p = getActivePreset(); if (!p) return;
  if (!p.pads) { const dev=State.devices.find(d=>d.id===State.activeDeviceId); p.pads = JSON.parse(JSON.stringify(dev.controls.pads||[])); }
  p.pads[pi][key] = parseInt(val); save();
  // Update note display
  if (key==='note') {
    const surf = document.querySelector(`#ctrl-pad-${pi} .pad-surface span`);
    if (surf) surf.textContent = noteName(parseInt(val));
  }
}
function togglePadMode(pi) {
  const p = getActivePreset(); if (!p) return;
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  if (!p.pads) p.pads = JSON.parse(JSON.stringify(dev.controls.pads||[]));
  const m = p.pads[pi].mode === 'Toggle' ? 'Momentary' : 'Toggle';
  p.pads[pi].mode = m; save();
  const btn = document.querySelector(`#ctrl-pad-${pi} .mode-toggle`);
  if (btn) { btn.textContent = m; btn.classList.toggle('toggle-mode', m==='Toggle'); }
}
function updateKnob(ki, key, val) {
  const p = getActivePreset(); if (!p) return;
  if (!p.knobs) { const dev=State.devices.find(d=>d.id===State.activeDeviceId); p.knobs = JSON.parse(JSON.stringify(dev.controls.knobs||[])); }
  p.knobs[ki][key] = parseInt(val); save();
}

// ============================================================
//  KNOB DRAG
// ============================================================
let _knobDrag = null;
function startKnobDrag(e, ki) {
  e.preventDefault();
  _knobDrag = { ki, startY: e.clientY, startVal: parseInt(e.target.dataset.val||64) };
  document.onmousemove = onKnobDrag;
  document.onmouseup = () => { _knobDrag=null; document.onmousemove=null; document.onmouseup=null; };
}
function onKnobDrag(e) {
  if (!_knobDrag) return;
  const { ki, startY, startVal } = _knobDrag;
  const delta = startY - e.clientY;
  const val = Math.min(127, Math.max(0, startVal + Math.round(delta*0.8)));
  const el = document.getElementById(`knob-vis-${ki}`);
  if (!el) return;
  const deg = Math.round((val/127)*270 - 135);
  el.style.transform = `rotate(${deg}deg)`;
  el.textContent = val;
  el.dataset.val = val;
  // Send CC if connected
  const p = getActivePreset();
  if (p && State.midiOut) {
    const knobs = (p.knobs) || (State.devices.find(d=>d.id===State.activeDeviceId)?.controls?.knobs||[]);
    const cc = (knobs[ki]||{}).cc || ki+1;
    const ch = p.channel ?? 0;
    State.midiOut.send([0xB0|ch, cc, val]);
    flashActivity();
  }
}

// ============================================================
//  LED TOGGLE
// ============================================================
function toggleLED(bi) {
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  if (!dev || !dev.controls.buttons) return;
  const btn = dev.controls.buttons[bi];
  const p = getActivePreset(); const ch = p?.channel ?? 0;
  const key = `note_${ch}_${btn.note||0}`;
  const newVal = State.liveValues[key] ? 0 : 127;
  State.liveValues[key] = newVal;
  if (State.midiOut) {
    State.midiOut.send([(newVal?0x90:0x80)|ch, btn.note||0, newVal]);
    flashActivity();
  }
  renderDeviceEditor();
}

// ============================================================
//  READ / WRITE DEVICE (SysEx preset dump)
// ============================================================
function readFromDevice() {
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  if (!dev) return;
  if (!State.midiIn) { toast('Connect a MIDI input port first','error'); return; }
  if (dev.id === 'akai_lpd8_v1') {
    // LPD8: send sysex request (Akai proprietary)
    if (State.midiOut) {
      const preset = State.activePresetIndex + 1;
      // Akai LPD8 SysEx request: F0 47 7F 75 61 00 01 [preset] F7
      State.midiOut.send([0xF0,0x47,0x7F,0x75,0x61,0x00,0x01,preset,0xF7]);
      toast(`Reading Preset ${preset} from LPD8…`,'info');
      flashActivity();
    } else { toast('Connect MIDI Out first','error'); }
  } else {
    toast(`Reading from ${dev.name}… (listen for SysEx response)`,'info');
  }
}
function writeToDevice() {
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  if (!dev || !State.midiOut) { toast('Connect MIDI Out first','error'); return; }
  const p = getActivePreset();
  if (!p) return;
  if (dev.id === 'akai_lpd8_v1') {
    // Build LPD8 SysEx preset upload
    const pads  = p.pads  || dev.controls.pads;
    const knobs = p.knobs || dev.controls.knobs;
    const ch    = p.channel ?? 0;
    const presetNum = State.activePresetIndex + 1;
    // SysEx format: F0 47 7F 75 62 00 [len_hi] [len_lo] [preset] [ch] [pad data...] [knob data...] F7
    // Per Akai LPD8: 63 bytes data
    const data = [0xF0,0x47,0x7F,0x75,0x62,0x00,0x00,0x3F, presetNum, ch];
    pads.forEach(pad => {
      data.push(pad.note||0, pad.pc||0, pad.cc||0, pad.mode==='Toggle'?1:0);
    });
    knobs.forEach(k => { data.push(k.cc||0, k.lo??0, k.hi??127); });
    data.push(0xF7);
    State.midiOut.send(data);
    toast(`Preset ${presetNum} written to LPD8 ✓`,'success');
    flashActivity();
  } else {
    // Generic: send all CC values
    const ch = p.channel ?? 0;
    const knobs = p.knobs || dev.controls.knobs || [];
    knobs.forEach(k => {
      const val = State.liveValues[`cc_${ch}_${k.cc}`] ?? 64;
      State.midiOut.send([0xB0|ch, k.cc||0, val]);
    });
    const faders = p.faders || dev.controls.faders || [];
    faders.forEach(f => {
      const val = State.liveValues[`cc_${ch}_${f.cc}`] ?? 0;
      State.midiOut.send([0xB0|ch, f.cc||0, val]);
    });
    toast(`All values sent to ${dev.name} ✓`,'success');
    flashActivity();
  }
}

// ============================================================
//  EXPORT PRESET JSON
// ============================================================
function exportPresetJSON() {
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  if (!dev) return;
  const p = getActivePreset();
  const blob = new Blob([JSON.stringify({device:dev.id,preset:p},null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${dev.id}_preset${State.activePresetIndex+1}.json`;
  a.click();
}

// ============================================================
//  SYSEX PANEL
// ============================================================
function sendSysEx() {
  if (!State.midiOut) { toast('No MIDI output connected','error'); return; }
  const raw = document.getElementById('sysex-input').value.trim();
  if (!raw) return;
  try {
    const bytes = raw.split(/[\s,]+/).map(h => parseInt(h,16));
    if (bytes.some(isNaN)) throw new Error('Invalid hex');
    State.midiOut.send(bytes);
    toast('SysEx sent ✓','success');
    flashActivity();
    logMonitor({ type:'sysex', bytes, timestamp: Date.now() });
  } catch(e) { toast('Invalid SysEx hex: '+e.message,'error'); }
}
function parseSysExInput() {
  const raw = document.getElementById('sysex-input').value.trim();
  const bytes = raw.split(/[\s,]+/).map(h=>parseInt(h,16));
  const result = document.getElementById('sysex-parse-result');
  const desc = bytes.map(b=>`${b.toString(16).toUpperCase().padStart(2,'0')} (${b})`).join(' › ');
  result.textContent = `${bytes.length} bytes: ${desc}`;
}
function sendRawMidi() {
  if (!State.midiOut) { toast('No MIDI output connected','error'); return; }
  const type = document.getElementById('raw-type').value;
  const ch   = parseInt(document.getElementById('raw-ch').value)-1;
  const num  = parseInt(document.getElementById('raw-num').value);
  const val  = parseInt(document.getElementById('raw-val').value);
  let msg;
  if      (type==='cc')       msg = [0xB0|ch, num, val];
  else if (type==='note_on')  msg = [0x90|ch, num, val];
  else if (type==='note_off') msg = [0x80|ch, num, 0];
  else if (type==='pc')       msg = [0xC0|ch, num];
  State.midiOut.send(msg);
  flashActivity();
  toast('MIDI sent ✓','success');
}
function renderSysExQuickCmds() {
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  const el = document.getElementById('device-quick-cmds-list');
  if (!el) return;
  if (!dev || !dev.quickSysEx || !dev.quickSysEx.length) {
    el.innerHTML = `<span style="font-size:0.8rem;color:var(--text3);">No quick commands for this device.</span>`;
    return;
  }
  el.innerHTML = dev.quickSysEx.map(cmd=>
    `<button class="btn sm" onclick="sendQuickSysEx('${cmd.bytes}')">${cmd.label}</button>`
  ).join('');
}
function sendQuickSysEx(bytes) {
  document.getElementById('sysex-input').value = bytes;
  sendSysEx();
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
  const el = document.getElementById('midi-monitor'); if (!el) return;
  const showNote  = document.getElementById('filter-note')?.checked;
  const showCC    = document.getElementById('filter-cc')?.checked;
  const showPC    = document.getElementById('filter-pc')?.checked;
  const showSysex = document.getElementById('filter-sysex')?.checked;
  const filtered = State.monitorMsgs.filter(m => {
    if (m.type==='note_on'||m.type==='note_off') return showNote;
    if (m.type==='cc') return showCC;
    if (m.type==='pc') return showPC;
    if (m.type==='sysex') return showSysex;
    return true;
  });
  el.innerHTML = filtered.slice(-150).reverse().map(m => {
    const ts = new Date(m.timestamp).toISOString().slice(11,23);
    let cls, text;
    if (m.type==='note_on')  { cls='msg-note';  text=`NOTE ON  Ch${(m.ch||0)+1} Note:${noteName(m.note||0)}(${m.note}) Vel:${m.vel}`; }
    else if (m.type==='note_off'){ cls='msg-note'; text=`NOTE OFF Ch${(m.ch||0)+1} Note:${noteName(m.note||0)}(${m.note})`; }
    else if (m.type==='cc')  { cls='msg-cc';    text=`CC       Ch${(m.ch||0)+1} CC:${m.cc} Val:${m.val}${State.settings.hex?' (0x'+m.val.toString(16).toUpperCase()+')'  :''}`; }
    else if (m.type==='pc')  { cls='msg-pc';    text=`PC       Ch${(m.ch||0)+1} Prog:${m.pc}`; }
    else if (m.type==='sysex'){ cls='msg-sysex'; text=`SYSEX    ${m.bytes.map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ')}`; }
    else { cls=''; text = JSON.stringify(m); }
    return `<div><span class="msg-ts">${ts}</span><span class="${cls}">${text}</span></div>`;
  }).join('');
  document.getElementById('monitor-count').textContent = State.monitorMsgs.length;
}
function clearMonitor() { State.monitorMsgs=[]; renderMonitor(); }
function toggleMonitorPause() {
  State.monitorPaused = !State.monitorPaused;
  document.getElementById('btn-monitor-pause').textContent =
    State.monitorPaused ? '▶ Resume' : '⏸ Pause';
}

// ============================================================
//  BACKUP
// ============================================================
function saveBackup() {
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  if (!dev) return;
  const entry = {
    id: Date.now(),
    deviceId: dev.id,
    deviceName: dev.name,
    date: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(dev.defaultPresets||[]))
  };
  State.backups.unshift(entry);
  if (State.backups.length > 100) State.backups.pop();
  save();
  toast(`Backup saved for ${dev.name} ✓`,'success');
  renderBackupList();
}
function renderBackupList() {
  const el = document.getElementById('backup-list'); if (!el) return;
  if (!State.backups.length) { el.innerHTML = '<p style="color:var(--text3);font-size:0.82rem;">No backups yet.</p>'; return; }
  el.innerHTML = State.backups.map((b,i)=>`
    <div class="backup-item">
      <span class="bname">🎹 ${b.deviceName} — ${b.data.length} preset(s)</span>
      <span class="bdate">${new Date(b.date).toLocaleString()}</span>
      <button class="btn sm" onclick="restoreFromEntry(${i})">Restore</button>
      <button class="btn sm danger" onclick="deleteBackup(${i})">🗑</button>
    </div>`).join('');
}
function backupAll() {
  const blob = new Blob([JSON.stringify({version:'1.0',devices:State.devices,backups:State.backups},null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `midicontrols_backup_${Date.now()}.json`;
  a.click();
}
function restoreBackup(evt) {
  const file = evt.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.devices) State.devices = data.devices;
      if (data.backups) State.backups = data.backups;
      save(); renderSidebar(); renderBackupList();
      toast('Backup restored ✓','success');
    } catch { toast('Invalid backup file','error'); }
  };
  reader.readAsText(file);
}
function restoreFromEntry(i) {
  const entry = State.backups[i]; if (!entry) return;
  const dev = State.devices.find(d=>d.id===entry.deviceId); if (!dev) { toast('Device not found','error'); return; }
  dev.defaultPresets = JSON.parse(JSON.stringify(entry.data));
  save(); renderDeviceEditor();
  toast(`Restored ${dev.name} from backup ✓`,'success');
}
function deleteBackup(i) { State.backups.splice(i,1); save(); renderBackupList(); }

// ============================================================
//  DEVICE MANAGER
// ============================================================
function renderDeviceManager() {
  const grid = document.getElementById('device-manager-grid'); if (!grid) return;
  grid.innerHTML = State.devices.map((dev,i)=>`
    <div class="dm-card">
      <div class="dm-card-header">
        <span class="icon">${dev.icon||'🎹'}</span>
        <div>
          <div class="name">${dev.name}</div>
          <div class="mfr">${dev.manufacturer||''}</div>
        </div>
      </div>
      <div style="font-size:0.75rem;color:var(--text3);line-height:1.5;">
        ${dev.description||''}<br>
        Presets: ${dev.presets||1} · Controls: ${Object.values(dev.controls||{}).flat().length}
        ${dev.sysex?'· SysEx ✓':''}
      </div>
      <div class="dm-card-actions">
        <button class="btn sm" onclick="editDevice(${i})">✏ Edit</button>
        <button class="btn sm" onclick="exportDevice(${i})">📤 Export</button>
        <button class="btn sm danger" onclick="removeDevice(${i})">🗑</button>
      </div>
    </div>`).join('');
}
function exportDevice(i) {
  const dev = State.devices[i];
  const blob = new Blob([JSON.stringify(dev,null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${dev.id}.json`;
  a.click();
}
function removeDevice(i) {
  if (!confirm(`Remove ${State.devices[i].name}?`)) return;
  State.devices.splice(i,1); save(); renderSidebar(); renderDeviceManager();
  toast('Device removed','info');
}
function importDeviceJSON() { document.getElementById('import-device-input').click(); }
function handleImportDevice(evt) {
  const file = evt.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const dev = JSON.parse(e.target.result);
      if (!dev.id||!dev.name) throw new Error('Missing id or name');
      const exists = State.devices.findIndex(d=>d.id===dev.id);
      if (exists>=0) State.devices[exists]=dev; else State.devices.push(dev);
      save(); renderSidebar(); renderDeviceManager();
      toast(`Device "${dev.name}" imported ✓`,'success');
    } catch(e) { toast('Invalid device JSON: '+e.message,'error'); }
  };
  reader.readAsText(file);
}
function editDevice(i) {
  const dev = State.devices[i];
  openModal(`
    <h2>Edit Device</h2>
    <div class="form-group"><label>Name</label>
      <input id="ed-name" value="${dev.name}"></div>
    <div class="form-group"><label>Manufacturer</label>
      <input id="ed-mfr" value="${dev.manufacturer||''}"></div>
    <div class="form-group"><label>Icon (emoji)</label>
      <input id="ed-icon" value="${dev.icon||'🎹'}"></div>
    <div class="form-group"><label>Description</label>
      <input id="ed-desc" value="${dev.description||''}"></div>
    <div class="form-group"><label>MIDI Name(s) (comma separated, for auto-detect)</label>
      <input id="ed-midiname" value="${(dev.midiName||[]).join(', ')}"></div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveEditDevice(${i})">Save</button>
    </div>`);
}
function saveEditDevice(i) {
  const dev = State.devices[i];
  dev.name         = document.getElementById('ed-name').value;
  dev.manufacturer = document.getElementById('ed-mfr').value;
  dev.icon         = document.getElementById('ed-icon').value;
  dev.description  = document.getElementById('ed-desc').value;
  dev.midiName     = document.getElementById('ed-midiname').value.split(',').map(s=>s.trim()).filter(Boolean);
  save(); renderSidebar(); renderDeviceManager();
  closeModal(); toast('Device updated ✓','success');
}
function openAddDeviceModal() {
  openModal(`
    <h2>Add New Device</h2>
    <div class="form-group"><label>Device ID (unique slug)</label>
      <input id="nd-id" placeholder="my_device_v1"></div>
    <div class="form-group"><label>Name</label>
      <input id="nd-name" placeholder="My Controller"></div>
    <div class="form-group"><label>Manufacturer</label>
      <input id="nd-mfr" placeholder="ACME"></div>
    <div class="form-group"><label>Icon (emoji)</label>
      <input id="nd-icon" value="🎹"></div>
    <div class="form-group"><label>Description</label>
      <input id="nd-desc" placeholder="Pad/knob controller…"></div>
    <div class="form-group"><label>MIDI Port Name(s) for auto-detect (comma separated)</label>
      <input id="nd-midiname" placeholder="My Controller, MyCtrl MIDI"></div>
    <div class="form-group"><label>Presets</label>
      <input type="number" id="nd-presets" value="1" min="1" max="16"></div>
    <p style="font-size:0.78rem;color:var(--text3);margin-top:4px;">
      After adding, export the device JSON and edit controls manually, then re-import.
    </p>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="createNewDevice()">Add Device</button>
    </div>`);
}
function createNewDevice() {
  const id   = document.getElementById('nd-id').value.trim().replace(/\s+/g,'_');
  const name = document.getElementById('nd-name').value.trim();
  if (!id||!name) { toast('ID and Name required','error'); return; }
  const dev = {
    id, name,
    manufacturer: document.getElementById('nd-mfr').value,
    icon: document.getElementById('nd-icon').value || '🎹',
    description: document.getElementById('nd-desc').value,
    midiName: document.getElementById('nd-midiname').value.split(',').map(s=>s.trim()).filter(Boolean),
    presets: parseInt(document.getElementById('nd-presets').value)||1,
    sysex: false, controls: { pads:[], knobs:[], faders:[], buttons:[] },
    defaultPresets: [{ name:'Preset 1', channel:0 }],
    quickSysEx: []
  };
  State.devices.push(dev); save(); renderSidebar(); renderDeviceManager();
  closeModal(); toast(`"${name}" added ✓ — Export JSON to edit controls`,'success');
}

// ============================================================
//  MIDI LEARN
// ============================================================
let _learnTarget = null;
function startMidiLearn(target) {
  if (_learnTarget === target) { _learnTarget = null; toast('MIDI Learn cancelled','info'); return; }
  _learnTarget = target;
  document.querySelectorAll('.midi-learn-btn').forEach(b => b.classList.remove('learning'));
  document.querySelector(`[onclick="startMidiLearn('${target}')"]`)?.classList.add('learning');
  toast('MIDI Learn: press a pad/key…','info');
}
function handleMidiLearn(msg) {
  if (!_learnTarget) return;
  const [status,data1,data2] = msg;
  const type = status >> 4;
  if (type === 0x9 && data2 > 0) {
    // Note On — map to pad note
    const m = _learnTarget.match(/^pad-note-(\d+)$/);
    if (m) {
      updatePad(parseInt(m[1]),'note',data1);
      const inp = document.querySelector(`#ctrl-pad-${m[1]} input[onchange*="'note'"]`);
      if (inp) inp.value = data1;
      const surf = document.querySelector(`#ctrl-pad-${m[1]} .pad-surface span`);
      if (surf) surf.textContent = noteName(data1);
    }
    toast(`Learned: Note ${noteName(data1)} (${data1})`,'success');
    _learnTarget = null;
    document.querySelectorAll('.midi-learn-btn').forEach(b=>b.classList.remove('learning'));
  } else if (type === 0xB) {
    toast(`Learned: CC ${data1}`,'success');
    _learnTarget = null;
    document.querySelectorAll('.midi-learn-btn').forEach(b=>b.classList.remove('learning'));
  }
}

// ============================================================
//  SETTINGS
// ============================================================
function renderSettings() {
  Object.entries(State.settings).forEach(([k,v]) => {
    const el = document.getElementById(`tog-${k}`);
    if (el) { el.classList.toggle('on',!!v); }
  });
}
function toggleSetting(key) {
  State.settings[key] = !State.settings[key];
  renderSettings(); save();
}
function clearAllData() {
  if (!confirm('Clear ALL data? This cannot be undone.')) return;
  localStorage.removeItem('midicontrols_devices');
  localStorage.removeItem('midicontrols_backups');
  localStorage.removeItem('midicontrols_settings');
  location.reload();
}

// ============================================================
//  MODAL
// ============================================================
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }
function closeModalOutside(e) { if (e.target.id==='modal-overlay') closeModal(); }

// ============================================================
//  TOAST
// ============================================================
function toast(msg, type='info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ============================================================
//  WebMIDI
// ============================================================
function initMidi() {
  if (!navigator.requestMIDIAccess) {
    document.getElementById('midi-status-text').textContent = 'WebMIDI not supported';
    toast('WebMIDI not supported in this browser. Use Chrome/Edge.','error');
    return;
  }
  navigator.requestMIDIAccess({ sysex: true }).then(access => {
    State.midiAccess = access;
    document.getElementById('midi-dot').classList.add('connected');
    document.getElementById('midi-status-text').textContent = 'WebMIDI ready';
    populatePorts();
    access.onstatechange = () => { populatePorts(); renderSidebar(); };
    toast('WebMIDI connected ✓','success');
  }).catch(err => {
    document.getElementById('midi-status-text').textContent = 'MIDI denied';
    toast('MIDI access denied: '+err,'error');
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
  // Auto-connect if previously selected ports still exist
  if (prevIn  && selIn.value  === prevIn)  connectMidiPorts();
  if (prevOut && selOut.value === prevOut) connectMidiPorts();
}

function connectMidiPorts() {
  if (!State.midiAccess) return;
  const inId  = document.getElementById('sel-in').value;
  const outId = document.getElementById('sel-out').value;

  // Disconnect old input handler
  if (State.midiIn) { State.midiIn.onmidimessage = null; }

  State.midiIn  = inId  ? State.midiAccess.inputs.get(inId)   : null;
  State.midiOut = outId ? State.midiAccess.outputs.get(outId) : null;

  if (State.midiIn) {
    State.midiIn.onmidimessage = onMidiMessage;
    document.getElementById('midi-dot').classList.add('connected');
    document.getElementById('midi-status-text').textContent = State.midiIn.name;
  }
  renderSidebar();
  renderDeviceEditor();
}

// ============================================================
//  MIDI MESSAGE HANDLER
// ============================================================
function onMidiMessage(event) {
  const data = event.data;
  const ts   = event.timeStamp || Date.now();

  // Flash activity dot
  flashActivity();

  // MIDI Thru
  if (State.settings.thru && State.midiOut) {
    State.midiOut.send(data);
  }

  // MIDI Learn intercept
  if (_learnTarget) { handleMidiLearn(data); return; }

  const status = data[0];
  const type   = status >> 4;
  const ch     = status & 0x0F;

  let msgObj = { timestamp: ts };

  // ── SysEx ──────────────────────────────────────────────
  if (status === 0xF0) {
    msgObj.type  = 'sysex';
    msgObj.bytes = Array.from(data);
    logMonitor(msgObj);
    handleSysExIn(data);
    return;
  }

  // ── Note On ────────────────────────────────────────────
  if (type === 0x9 && data[2] > 0) {
    msgObj = { type:'note_on', ch, note:data[1], vel:data[2], timestamp:ts };
    const key = `note_${ch}_${data[1]}`;
    State.liveValues[key] = data[2];
    if (State.settings.highlight) highlightPad(ch, data[1], true);
  }
  // ── Note Off ───────────────────────────────────────────
  else if (type === 0x8 || (type === 0x9 && data[2] === 0)) {
    msgObj = { type:'note_off', ch, note:data[1], vel:0, timestamp:ts };
    const key = `note_${ch}_${data[1]}`;
    State.liveValues[key] = 0;
    if (State.settings.highlight) highlightPad(ch, data[1], false);
  }
  // ── CC ─────────────────────────────────────────────────
  else if (type === 0xB) {
    msgObj = { type:'cc', ch, cc:data[1], val:data[2], timestamp:ts };
    State.liveValues[`cc_${ch}_${data[1]}`] = data[2];
    if (State.settings.highlight) updateLiveKnob(ch, data[1], data[2]);
    updateLiveFader(ch, data[1], data[2]);
  }
  // ── Program Change ─────────────────────────────────────
  else if (type === 0xC) {
    msgObj = { type:'pc', ch, pc:data[1], timestamp:ts };
  }
  else {
    msgObj = { type:'other', raw: Array.from(data), timestamp:ts };
  }

  logMonitor(msgObj);
}

// ============================================================
//  SYSEX INCOMING HANDLER (parse LPD8 dump, etc.)
// ============================================================
function handleSysExIn(data) {
  // Akai LPD8 preset dump response: F0 47 7F 75 63 ...
  if (data[0]===0xF0 && data[1]===0x47 && data[2]===0x7F &&
      data[3]===0x75 && data[4]===0x63) {
    const presetNum = data[7] - 1;
    const ch        = data[8];
    const dev = State.devices.find(d=>d.id==='akai_lpd8_v1'); if(!dev) return;
    if (!dev.defaultPresets[presetNum]) dev.defaultPresets[presetNum]={name:`Preset ${presetNum+1}`};
    const p = dev.defaultPresets[presetNum];
    p.channel = ch;
    p.pads = [];
    for (let i=0;i<8;i++) {
      const base = 9 + i*4;
      p.pads.push({
        note: data[base],
        pc:   data[base+1],
        cc:   data[base+2],
        mode: data[base+3] ? 'Toggle' : 'Momentary'
      });
    }
    p.knobs = [];
    for (let i=0;i<8;i++) {
      const base = 9 + 32 + i*3;
      p.knobs.push({ cc:data[base], lo:data[base+1], hi:data[base+2] });
    }
    save();
    if (State.activeDeviceId==='akai_lpd8_v1') renderDeviceEditor();
    toast(`LPD8 Preset ${presetNum+1} loaded from device ✓`, 'success');
  }
}

// ============================================================
//  LIVE UI UPDATE HELPERS
// ============================================================
function flashActivity() {
  const dot = document.getElementById('midi-dot');
  dot.classList.add('activity');
  clearTimeout(flashActivity._t);
  flashActivity._t = setTimeout(() => dot.classList.remove('activity'), 120);
}

function highlightPad(ch, note, on) {
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  if (!dev || !dev.controls.pads) return;
  dev.controls.pads.forEach((pad, pi) => {
    const p = getActivePreset();
    const pData = (p?.pads && p.pads[pi]) || pad;
    if (pData.note === note) {
      const el = document.getElementById(`ctrl-pad-${pi}`);
      if (el) el.classList.toggle('triggered', on);
    }
  });
}

function updateLiveKnob(ch, cc, val) {
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  if (!dev || !dev.controls.knobs) return;
  const p = getActivePreset();
  dev.controls.knobs.forEach((knob, ki) => {
    const kd = (p?.knobs && p.knobs[ki]) || knob;
    if (kd.cc === cc) {
      const el = document.getElementById(`knob-vis-${ki}`);
      if (el) {
        const deg = Math.round((val/127)*270 - 135);
        el.style.transform = `rotate(${deg}deg)`;
        el.textContent = val;
        el.dataset.val  = val;
      }
    }
  });
}

function updateLiveFader(ch, cc, val) {
  // Re-render only faders section for performance
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  if (!dev || !dev.controls.faders) return;
  const p = getActivePreset();
  dev.controls.faders.forEach((fdr, fi) => {
    const fd = (p?.faders && p.faders[fi]) || fdr;
    if (fd.cc === cc) {
      const pct = Math.round((val/127)*100);
      // fader-fill and fader-thumb are inside ctrl-fader—find by index
      const faderEls = document.querySelectorAll('.ctrl-fader');
      if (faderEls[fi]) {
        const fill  = faderEls[fi].querySelector('.fader-fill');
        const thumb = faderEls[fi].querySelector('.fader-thumb');
        const valEl = faderEls[fi].querySelector('.fader-val');
        if (fill)  fill.style.height = `${pct}%`;
        if (thumb) thumb.style.bottom = `${pct}%`;
        if (valEl) valEl.textContent  = val;
      }
    }
  });
}

// ============================================================
//  KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', e => {
  // ESC = close modal
  if (e.key === 'Escape') closeModal();
  // Ctrl+S = save backup
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveBackup(); }
  // Ctrl+M = focus MIDI monitor
  if (e.ctrlKey && e.key === 'm') { e.preventDefault(); showPanel('monitor'); }
  // Ctrl+E = editor
  if (e.ctrlKey && e.key === 'e') { e.preventDefault(); showPanel('editor'); }
});

// ============================================================
//  PWA / SERVICE WORKER (optional offline support)
// ============================================================
if ('serviceWorker' in navigator) {
  // Inline SW via blob for zero-file-setup
  const swCode = `
    const CACHE = 'midicontrols-v1';
    self.addEventListener('install', e => {
      self.skipWaiting();
    });
    self.addEventListener('fetch', e => {
      e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
    });
  `;
  try {
    const blob = new Blob([swCode], { type:'application/javascript' });
    navigator.serviceWorker.register(URL.createObjectURL(blob));
  } catch(e) { /* SW blob not allowed in all contexts */ }
}

// ============================================================
//  DRAG & DROP DEVICE JSON IMPORT (anywhere on page)
// ============================================================
document.body.addEventListener('dragover', e => { e.preventDefault(); document.body.style.outline='2px dashed var(--accent)'; });
document.body.addEventListener('dragleave', () => { document.body.style.outline=''; });
document.body.addEventListener('drop', e => {
  e.preventDefault();
  document.body.style.outline = '';
  const file = e.dataTransfer.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      // Detect backup vs single device
      if (data.devices) {
        State.devices = data.devices;
        if (data.backups) State.backups = data.backups;
        save(); renderSidebar();
        toast('Full backup restored via drag & drop ✓', 'success');
      } else if (data.id && data.name) {
        const exists = State.devices.findIndex(d=>d.id===data.id);
        if (exists>=0) State.devices[exists]=data; else State.devices.push(data);
        save(); renderSidebar();
        toast(`Device "${data.name}" imported ✓`, 'success');
      } else if (data.device && data.preset) {
        const dev = State.devices.find(d=>d.id===data.device);
        if (dev) {
          dev.defaultPresets[State.activePresetIndex] = data.preset;
          save(); renderDeviceEditor();
          toast('Preset JSON imported ✓','success');
        }
      }
    } catch { toast('Could not parse dropped file','error'); }
  };
  reader.readAsText(file);
});

// ============================================================
//  CLIPBOARD — copy CC map as text
// ============================================================
function copyCCMap() {
  const dev = State.devices.find(d=>d.id===State.activeDeviceId);
  if (!dev) return;
  const p = getActivePreset();
  let lines = [`# ${dev.name} — Preset ${State.activePresetIndex+1} CC Map\n`];
  (p?.pads || dev.controls.pads||[]).forEach((pad,i) =>
    lines.push(`Pad ${i+1}: Note ${noteName(pad.note||0)} (${pad.note}), CC ${pad.cc}, PC ${pad.pc}, Mode: ${pad.mode}`));
  (p?.knobs || dev.controls.knobs||[]).forEach((k,i) =>
    lines.push(`Knob ${i+1}: CC ${k.cc}, Lo ${k.lo??0}, Hi ${k.hi??127}`));
  (p?.faders || dev.controls.faders||[]).forEach((f,i) =>
    lines.push(`Fader ${i+1}: CC ${f.cc}`));
  navigator.clipboard.writeText(lines.join('\n')).then(()=>toast('CC map copied ✓','success'));
}

// ============================================================
//  MIDI CLOCK / SYNC INDICATOR
// ============================================================
let _clockCount = 0, _clockLastTs = 0, _bpmEl = null;
function handleMidiClock(ts) {
  _clockCount++;
  if (_clockCount >= 24) {
    const elapsed = ts - _clockLastTs;
    if (elapsed > 0) {
      const bpm = Math.round(60000 / elapsed);
      document.getElementById('midi-status-text').textContent =
        `${State.midiIn ? State.midiIn.name : 'MIDI'} ♩ ${bpm} BPM`;
    }
    _clockCount = 0;
    _clockLastTs = ts;
  }
}

// ============================================================
//  TEMPLATE GENERATOR HELPER
//  (generate a starter JSON for a new device from a descriptor)
// ============================================================
function generateDeviceTemplate(desc) {
  const { id, name, manufacturer, pads=0, knobs=0, faders=0, buttons=0 } = desc;
  return {
    id, name, manufacturer,
    icon: '🎹', color: '#6c63ff',
    midiName: [name],
    sysex: false, presets: 1,
    description: `${pads} pads · ${knobs} knobs · ${faders} faders · ${buttons} buttons`,
    controls: {
      pads:    Array.from({length:pads},   (_,i)=>({id:`pad${i+1}`,label:`Pad ${i+1}`,note:36+i,cc:i+1,pc:i,mode:'Momentary'})),
      knobs:   Array.from({length:knobs},  (_,i)=>({id:`k${i+1}`,label:`K${i+1}`,cc:i+1,lo:0,hi:127})),
      faders:  Array.from({length:faders}, (_,i)=>({id:`f${i+1}`,label:`Fader ${i+1}`,cc:i+1})),
      buttons: Array.from({length:buttons},(_,i)=>({id:`btn${i+1}`,label:`Btn ${i+1}`,note:i,cc:i,color:'green'}))
    },
    defaultPresets: [{ name:'Preset 1', channel:0 }],
    quickSysEx: []
  };
}

// ============================================================
//  ABOUT / HELP MODAL
// ============================================================
function showHelp() {
  openModal(`
    <h2>⌨ Keyboard Shortcuts</h2>
    <div style="font-size:0.83rem;line-height:2;color:var(--text2);">
      <div><kbd style="background:var(--surface3);padding:2px 6px;border-radius:4px;">Ctrl+S</kbd> — Save backup of current device</div>
      <div><kbd style="background:var(--surface3);padding:2px 6px;border-radius:4px;">Ctrl+M</kbd> — Open MIDI Monitor</div>
      <div><kbd style="background:var(--surface3);padding:2px 6px;border-radius:4px;">Ctrl+E</kbd> — Open Editor</div>
      <div><kbd style="background:var(--surface3);padding:2px 6px;border-radius:4px;">Escape</kbd> — Close modal</div>
    </div>
    <h2 style="margin-top:16px;">💡 Tips</h2>
    <div style="font-size:0.83rem;line-height:2;color:var(--text2);">
      <div>• <strong>Drag & drop</strong> any device .json onto the page to import</div>
      <div>• Click <strong>LEARN</strong> on any pad, then press a hardware key to auto-map</div>
      <div>• Knobs respond to <strong>mouse drag</strong> and send live CC to MIDI out</div>
      <div>• <strong>Read Device</strong> sends a SysEx dump request (LPD8 supported)</div>
      <div>• All data is saved in <strong>localStorage</strong> — use Export to persist</div>
      <div>• WebMIDI requires <strong>Chrome or Edge</strong> (not Firefox without flag)</div>
    </div>
    <div class="modal-actions">
      <button class="btn primary" onclick="closeModal()">Got it</button>
    </div>`);
}

// ============================================================
//  RENDER TOPNAV HELP BUTTON (appended to nav)
// ============================================================
(function addHelpBtn() {
  const nav = document.getElementById('topnav');
  const btn = document.createElement('button');
  btn.className = 'btn sm';
  btn.textContent = '?';
  btn.title = 'Keyboard shortcuts & tips';
  btn.onclick = showHelp;
  nav.appendChild(btn);
})();

// ============================================================
//  INIT
// ============================================================
(function init() {
  load();
  renderSidebar();
  renderSettings();
  renderBackupList();
  initMidi();

  // Auto-select first device
  if (State.devices.length) {
    selectDevice(State.devices[0].id);
  }
})();
