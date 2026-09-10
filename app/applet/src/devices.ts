import { DeviceConfig } from './types';

export const BUILT_IN_DEVICES: DeviceConfig[] = [
  {
    id: "akai_lpd8_v1",
    name: "LPD8 (mk1)",
    manufacturer: "Akai Professional",
    icon: "🎛",
    color: "#e74c3c",
    midiName: ["LPD8"],
    sysex: true,
    presets: 4,
    description: "8 velocity-sensitive pads, 8 knobs, 4 programs.",
    controls: {
      pads: Array.from({length: 8}, (_, i) => ({ id: \`pad\${i+1}\`, label: \`Pad \${i+1}\`, note: 36+i, cc: i+1, pc: i+1, mode: "Momentary" })),
      knobs: Array.from({length: 8}, (_, i) => ({ id: \`k\${i+1}\`, label: \`K\${i+1}\`, cc: i+1, lo: 0, hi: 127 })),
      faders: [],
      buttons: []
    },
    defaultPresets: Array.from({length: 4}, (_, i) => ({ name: \`Program \${i+1}\`, channel: 0 })),
    quickSysEx: []
  },
  {
    "id": "novation_remote_zero_sl_mk1",
    "name": "Remote Zero SL mk1",
    "manufacturer": "Novation",
    "icon": "🎚️",
    "color": "#2980b9",
    "midiName": ["SL MkII", "Remote SL", "Zero SL", "SL Compact"],
    "sysex": true,
    "presets": 40,
    "description": "Zero-key Remote SL — 8 encoders, 8 faders, LCD display, Automap",
    "controls": {
      "pads": [],
      "knobs": Array.from({length: 8}, (_, i) => ({ id: \`enc\${i+1}\`, label: \`Enc \${i+1}\`, cc: 21+i, lo: 0, hi: 127 })),
      "faders": Array.from({length: 8}, (_, i) => ({ id: \`fdr\${i+1}\`, label: \`Fader \${i+1}\`, cc: 41+i })),
      "buttons": [
        ...Array.from({length: 8}, (_, i) => ({ id: \`btn\${i+1}\`, label: \`Btn \${i+1}\`, note: 112+i, color: "green" as const })),
        { "id": "rewind",  "label": "Rewind",   "note": 116, "color": "amber" },
        { "id": "fwd",     "label": "Forward",  "note": 117, "color": "amber" },
        { "id": "stop",    "label": "Stop",     "note": 115, "color": "red"   },
        { "id": "play",    "label": "Play",     "note": 118, "color": "green" },
        { "id": "loop",    "label": "Loop",     "note": 113, "color": "amber" },
        { "id": "record",  "label": "Record",   "note": 119, "color": "red"   }
      ]
    },
    "defaultPresets": Array.from({length: 8}, (_, i) => ({ name: \`Preset \${i+1}\`, channel: i })),
    "quickSysEx": [
      { "label": "Init Automap",       "bytes": "F0 00 20 29 03 03 12 01 F7" },
      { "label": "LCD Line 1: Hello",  "bytes": "F0 00 20 29 03 03 04 00 48 65 6C 6C 6F 00 F7" },
      { "label": "LCD Line 2: MIDI",   "bytes": "F0 00 20 29 03 03 04 01 4D 49 44 49 00 F7" },
      { "label": "LCD Clear",          "bytes": "F0 00 20 29 03 03 04 00 20 20 20 20 20 20 20 20 00 F7" },
      { "label": "Dump Template 1",    "bytes": "F0 00 20 29 02 0A 01 F7" },
      { "label": "Send Template",      "bytes": "F0 00 20 29 02 0A 00 F7" }
    ]
  },
  {
    "id": "novation_remote25_sl_compact_mk1",
    "name": "Remote 25 SL Compact",
    "manufacturer": "Novation",
    "icon": "🎹",
    "color": "#27ae60",
    "midiName": ["SL Compact", "Remote 25", "SL MkII"],
    "sysex": true,
    "presets": 40,
    "description": "25-key controller — 8 encoders, 8 drum pads, LCD, transport, Automap",
    "controls": {
      "pads": Array.from({length: 8}, (_, i) => ({ id: \`pad\${i+1}\`, label: \`Pad \${i+1}\`, note: 36+i, cc: 36+i, mode: "Momentary" })),
      "knobs": Array.from({length: 8}, (_, i) => ({ id: \`enc\${i+1}\`, label: \`Enc \${i+1}\`, cc: 21+i, lo: 0, hi: 127 })),
      "faders": [],
      "buttons": [
        { "id": "rewind", "label": "Rewind",  "note": 116, "color": "amber" },
        { "id": "fwd",    "label": "Forward", "note": 117, "color": "amber" },
        { "id": "stop",   "label": "Stop",    "note": 115, "color": "red"   },
        { "id": "play",   "label": "Play",    "note": 118, "color": "green" },
        { "id": "loop",   "label": "Loop",    "note": 113, "color": "amber" },
        { "id": "record", "label": "Record",  "note": 119, "color": "red"   }
      ]
    },
    "defaultPresets": Array.from({length: 8}, (_, i) => ({ name: \`Preset \${i+1}\`, channel: i })),
    "quickSysEx": [
      { "label": "Init Automap",      "bytes": "F0 00 20 29 03 03 12 01 F7" },
      { "label": "LCD: Hi there!",    "bytes": "F0 00 20 29 03 03 04 00 48 69 20 74 68 65 72 65 21 00 F7" },
      { "label": "LCD Clear",         "bytes": "F0 00 20 29 03 03 04 00 20 20 20 20 20 20 20 20 00 F7" },
      { "label": "Dump Template 1",   "bytes": "F0 00 20 29 02 0A 01 F7" }
    ]
  }
];
