const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Panic Button
html = html.replace(
  'title="Send All Notes Off / All Sound Off">🛑 Panic</button>',
  'data-tooltip="Sends \'All Notes Off\' and \'All Sound Off\' messages to all channels to immediately silence stuck notes.">🛑 Panic</button>'
);

// 2. CC LFO Generator Title
html = html.replace(
  '<h3 style="font-size:1rem; margin-bottom:8px;">🌊 CC LFO Generator</h3>',
  '<h3 style="font-size:1rem; margin-bottom:8px;" data-tooltip="Continuously modulates a target CC parameter using mathematical sine wave sweeps.">🌊 CC LFO Generator</h3>'
);

// 3. SysEx Panel Buttons
html = html.replace(
  '<button class="btn primary" onclick="sendSysEx()">▶ Send SysEx</button>',
  '<button class="btn primary" onclick="sendSysEx()" data-tooltip="Transmit the raw hexadecimal bytes above directly to the active MIDI Out port">▶ Send SysEx</button>'
);

html = html.replace(
  '<button class="btn sm" style="background:#dc2626;color:white;border:none;" onclick="sendFactoryReset()">⚠️ Factory Reset</button>',
  '<button class="btn sm" style="background:#dc2626;color:white;border:none;" onclick="sendFactoryReset()" data-tooltip="Sends a universal System Exclusive factory reset command to the connected hardware">⚠️ Factory Reset</button>'
);

html = html.replace(
  '<button class="btn primary" onclick="sendRawMidi()">▶ Send</button>',
  '<button class="btn primary" onclick="sendRawMidi()" data-tooltip="Transmit this specific CC, Note, or Program Change message instantly">▶ Send</button>'
);

// 4. CSS for Utilities Panel buttons
const utilCss = `
    #panel-utilities .btn:active {
      transform: scale(0.96);
      filter: brightness(1.2);
    }
`;
html = html.replace('</style>', utilCss + '\n  </style>');

fs.writeFileSync('index.html', html);
console.log('patched tooltips');
