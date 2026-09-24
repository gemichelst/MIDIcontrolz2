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

// ============================================================
//  BUILTIN HARDWARE DEFINITIONS — 100% Offline & Instant Availability
// ============================================================
const BUILTIN_HARDWARE_DEFINITIONS = [
  {
    "id": "akai_lpd8_v1",
    "name": "LPD8",
    "manufacturer": "Akai Professional",
    "icon": "🥁",
    "color": "#cc2929",
    "midiName": [
      "LPD8",
      "Akai LPD8"
    ],
    "sysex": true,
    "presets": 4,
    "description": "8-pad, 8-knob USB MIDI pad controller",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 36,
          "cc": 1,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 37,
          "cc": 2,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 38,
          "cc": 3,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 39,
          "cc": 4,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 40,
          "cc": 1,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 41,
          "cc": 2,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 42,
          "cc": 3,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 43,
          "cc": 4,
          "pc": 7,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "k1",
          "label": "K1",
          "cc": 1,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "k2",
          "label": "K2",
          "cc": 2,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "k3",
          "label": "K3",
          "cc": 3,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "k4",
          "label": "K4",
          "cc": 4,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "k5",
          "label": "K5",
          "cc": 5,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "k6",
          "label": "K6",
          "cc": 6,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "k7",
          "label": "K7",
          "cc": 7,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "k8",
          "label": "K8",
          "cc": 8,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": []
    },
    "defaultPresets": [
      {
        "name": "Preset 1 — Default",
        "channel": 0,
        "pads": [
          {
            "note": 36,
            "cc": 1,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 2,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 3,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 4,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 1,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 2,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 3,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 4,
            "pc": 7,
            "mode": "Momentary"
          }
        ],
        "knobs": [
          {
            "cc": 1,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 2,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 3,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 4,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 5,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 6,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 7,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 8,
            "lo": 0,
            "hi": 127
          }
        ]
      },
      {
        "name": "Preset 2 — Ableton",
        "channel": 7,
        "pads": [
          {
            "note": 88,
            "cc": 30,
            "pc": 24,
            "mode": "Momentary"
          },
          {
            "note": 89,
            "cc": 31,
            "pc": 25,
            "mode": "Momentary"
          },
          {
            "note": 90,
            "cc": 32,
            "pc": 26,
            "mode": "Momentary"
          },
          {
            "note": 91,
            "cc": 33,
            "pc": 27,
            "mode": "Momentary"
          },
          {
            "note": 92,
            "cc": 26,
            "pc": 28,
            "mode": "Momentary"
          },
          {
            "note": 93,
            "cc": 27,
            "pc": 29,
            "mode": "Momentary"
          },
          {
            "note": 94,
            "cc": 28,
            "pc": 30,
            "mode": "Momentary"
          },
          {
            "note": 95,
            "cc": 29,
            "pc": 31,
            "mode": "Momentary"
          }
        ],
        "knobs": [
          {
            "cc": 50,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 51,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 52,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 53,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 54,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 55,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 56,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 57,
            "lo": 0,
            "hi": 127
          }
        ]
      },
      {
        "name": "Preset 3 — Toggle",
        "channel": 7,
        "pads": [
          {
            "note": 76,
            "cc": 30,
            "pc": 0,
            "mode": "Toggle"
          },
          {
            "note": 77,
            "cc": 31,
            "pc": 1,
            "mode": "Toggle"
          },
          {
            "note": 78,
            "cc": 32,
            "pc": 2,
            "mode": "Toggle"
          },
          {
            "note": 79,
            "cc": 33,
            "pc": 3,
            "mode": "Toggle"
          },
          {
            "note": 80,
            "cc": 26,
            "pc": 4,
            "mode": "Toggle"
          },
          {
            "note": 81,
            "cc": 27,
            "pc": 5,
            "mode": "Toggle"
          },
          {
            "note": 82,
            "cc": 28,
            "pc": 6,
            "mode": "Toggle"
          },
          {
            "note": 83,
            "cc": 29,
            "pc": 7,
            "mode": "Toggle"
          }
        ],
        "knobs": [
          {
            "cc": 42,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 43,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 44,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 45,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 46,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 47,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 48,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 49,
            "lo": 0,
            "hi": 127
          }
        ]
      },
      {
        "name": "Preset 4 — Toggle 2",
        "channel": 7,
        "pads": [
          {
            "note": 64,
            "cc": 30,
            "pc": 8,
            "mode": "Toggle"
          },
          {
            "note": 65,
            "cc": 31,
            "pc": 9,
            "mode": "Toggle"
          },
          {
            "note": 66,
            "cc": 32,
            "pc": 10,
            "mode": "Toggle"
          },
          {
            "note": 67,
            "cc": 33,
            "pc": 11,
            "mode": "Toggle"
          },
          {
            "note": 68,
            "cc": 26,
            "pc": 12,
            "mode": "Toggle"
          },
          {
            "note": 69,
            "cc": 27,
            "pc": 13,
            "mode": "Toggle"
          },
          {
            "note": 70,
            "cc": 28,
            "pc": 14,
            "mode": "Toggle"
          },
          {
            "note": 71,
            "cc": 29,
            "pc": 15,
            "mode": "Toggle"
          }
        ],
        "knobs": [
          {
            "cc": 34,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 35,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 36,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 37,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 38,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 39,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 40,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 41,
            "lo": 0,
            "hi": 127
          }
        ]
      }
    ],
    "quickSysEx": [
      {
        "label": "Read Preset 1",
        "bytes": "F0 47 7F 75 61 00 01 01 F7"
      },
      {
        "label": "Read Preset 2",
        "bytes": "F0 47 7F 75 61 00 01 02 F7"
      },
      {
        "label": "Read Preset 3",
        "bytes": "F0 47 7F 75 61 00 01 03 F7"
      },
      {
        "label": "Read Preset 4",
        "bytes": "F0 47 7F 75 61 00 01 04 F7"
      }
    ]
  },
  {
    "id": "akai_midimix",
    "name": "MIDImix",
    "manufacturer": "Akai Professional",
    "icon": "🎚️",
    "color": "#e67e22",
    "midiName": [
      "MIDI Mix",
      "MIDImix"
    ],
    "sysex": false,
    "presets": 1,
    "description": "8-channel MIDI mixer — 24 knobs, 9 faders, Mute/Solo/RecArm",
    "controls": {
      "pads": [],
      "knobs": [
        {
          "id": "ch1k1",
          "label": "Ch1 K1",
          "cc": 16,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch1k2",
          "label": "Ch1 K2",
          "cc": 17,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch1k3",
          "label": "Ch1 K3",
          "cc": 18,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch2k1",
          "label": "Ch2 K1",
          "cc": 20,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch2k2",
          "label": "Ch2 K2",
          "cc": 21,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch2k3",
          "label": "Ch2 K3",
          "cc": 22,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch3k1",
          "label": "Ch3 K1",
          "cc": 24,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch3k2",
          "label": "Ch3 K2",
          "cc": 25,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch3k3",
          "label": "Ch3 K3",
          "cc": 26,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch4k1",
          "label": "Ch4 K1",
          "cc": 28,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch4k2",
          "label": "Ch4 K2",
          "cc": 29,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch4k3",
          "label": "Ch4 K3",
          "cc": 30,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch5k1",
          "label": "Ch5 K1",
          "cc": 46,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch5k2",
          "label": "Ch5 K2",
          "cc": 47,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch5k3",
          "label": "Ch5 K3",
          "cc": 48,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch6k1",
          "label": "Ch6 K1",
          "cc": 50,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch6k2",
          "label": "Ch6 K2",
          "cc": 51,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch6k3",
          "label": "Ch6 K3",
          "cc": 52,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch7k1",
          "label": "Ch7 K1",
          "cc": 54,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch7k2",
          "label": "Ch7 K2",
          "cc": 55,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch7k3",
          "label": "Ch7 K3",
          "cc": 56,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch8k1",
          "label": "Ch8 K1",
          "cc": 58,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch8k2",
          "label": "Ch8 K2",
          "cc": 59,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ch8k3",
          "label": "Ch8 K3",
          "cc": 60,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [
        {
          "id": "f1",
          "label": "Ch 1",
          "cc": 19
        },
        {
          "id": "f2",
          "label": "Ch 2",
          "cc": 23
        },
        {
          "id": "f3",
          "label": "Ch 3",
          "cc": 27
        },
        {
          "id": "f4",
          "label": "Ch 4",
          "cc": 31
        },
        {
          "id": "f5",
          "label": "Ch 5",
          "cc": 49
        },
        {
          "id": "f6",
          "label": "Ch 6",
          "cc": 53
        },
        {
          "id": "f7",
          "label": "Ch 7",
          "cc": 57
        },
        {
          "id": "f8",
          "label": "Ch 8",
          "cc": 61
        },
        {
          "id": "master",
          "label": "Master",
          "cc": 62
        }
      ],
      "buttons": [
        {
          "id": "mute1",
          "label": "Mute 1",
          "note": 1,
          "cc": 1,
          "color": "amber"
        },
        {
          "id": "mute2",
          "label": "Mute 2",
          "note": 2,
          "cc": 2,
          "color": "amber"
        },
        {
          "id": "mute3",
          "label": "Mute 3",
          "note": 3,
          "cc": 3,
          "color": "amber"
        },
        {
          "id": "mute4",
          "label": "Mute 4",
          "note": 4,
          "cc": 4,
          "color": "amber"
        },
        {
          "id": "mute5",
          "label": "Mute 5",
          "note": 5,
          "cc": 5,
          "color": "amber"
        },
        {
          "id": "mute6",
          "label": "Mute 6",
          "note": 6,
          "cc": 6,
          "color": "amber"
        },
        {
          "id": "mute7",
          "label": "Mute 7",
          "note": 7,
          "cc": 7,
          "color": "amber"
        },
        {
          "id": "mute8",
          "label": "Mute 8",
          "note": 8,
          "cc": 8,
          "color": "amber"
        },
        {
          "id": "solo",
          "label": "Solo",
          "note": 9,
          "cc": 9,
          "color": "green"
        },
        {
          "id": "rec1",
          "label": "Rec 1",
          "note": 10,
          "cc": 10,
          "color": "red"
        },
        {
          "id": "rec2",
          "label": "Rec 2",
          "note": 11,
          "cc": 11,
          "color": "red"
        },
        {
          "id": "rec3",
          "label": "Rec 3",
          "note": 12,
          "cc": 12,
          "color": "red"
        },
        {
          "id": "rec4",
          "label": "Rec 4",
          "note": 13,
          "cc": 13,
          "color": "red"
        },
        {
          "id": "rec5",
          "label": "Rec 5",
          "note": 14,
          "cc": 14,
          "color": "red"
        },
        {
          "id": "rec6",
          "label": "Rec 6",
          "note": 15,
          "cc": 15,
          "color": "red"
        },
        {
          "id": "rec7",
          "label": "Rec 7",
          "note": 16,
          "cc": 16,
          "color": "red"
        },
        {
          "id": "rec8",
          "label": "Rec 8",
          "note": 17,
          "cc": 17,
          "color": "red"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Default",
        "channel": 0,
        "knobs": [
          {
            "cc": 16
          },
          {
            "cc": 17
          },
          {
            "cc": 18
          },
          {
            "cc": 20
          },
          {
            "cc": 21
          },
          {
            "cc": 22
          },
          {
            "cc": 24
          },
          {
            "cc": 25
          },
          {
            "cc": 26
          },
          {
            "cc": 28
          },
          {
            "cc": 29
          },
          {
            "cc": 30
          },
          {
            "cc": 46
          },
          {
            "cc": 47
          },
          {
            "cc": 48
          },
          {
            "cc": 50
          },
          {
            "cc": 51
          },
          {
            "cc": 52
          },
          {
            "cc": 54
          },
          {
            "cc": 55
          },
          {
            "cc": 56
          },
          {
            "cc": 58
          },
          {
            "cc": 59
          },
          {
            "cc": 60
          }
        ],
        "faders": [
          {
            "cc": 19
          },
          {
            "cc": 23
          },
          {
            "cc": 27
          },
          {
            "cc": 31
          },
          {
            "cc": 49
          },
          {
            "cc": 53
          },
          {
            "cc": 57
          },
          {
            "cc": 61
          },
          {
            "cc": 62
          }
        ],
        "buttons": [
          {
            "note": 1
          },
          {
            "note": 2
          },
          {
            "note": 3
          },
          {
            "note": 4
          },
          {
            "note": 5
          },
          {
            "note": 6
          },
          {
            "note": 7
          },
          {
            "note": 8
          },
          {
            "note": 9
          },
          {
            "note": 10
          },
          {
            "note": 11
          },
          {
            "note": 12
          },
          {
            "note": 13
          },
          {
            "note": 14
          },
          {
            "note": 15
          },
          {
            "note": 16
          },
          {
            "note": 17
          }
        ]
      }
    ],
    "quickSysEx": []
  },
  {
    "id": "novation_launchcontrol_mk1",
    "name": "Launch Control",
    "manufacturer": "Novation",
    "icon": "🔲",
    "color": "#e74c3c",
    "midiName": [
      "Launch Control"
    ],
    "sysex": true,
    "presets": 16,
    "description": "8 pads + 4 buttons, 16 templates, bi-colour LEDs (red/green/amber)",
    "controls": {
      "pads": [
        {
          "id": "p1",
          "label": "Pad 1",
          "note": 9,
          "cc": 9,
          "ledIndex": 0
        },
        {
          "id": "p2",
          "label": "Pad 2",
          "note": 10,
          "cc": 10,
          "ledIndex": 1
        },
        {
          "id": "p3",
          "label": "Pad 3",
          "note": 11,
          "cc": 11,
          "ledIndex": 2
        },
        {
          "id": "p4",
          "label": "Pad 4",
          "note": 12,
          "cc": 12,
          "ledIndex": 3
        },
        {
          "id": "p5",
          "label": "Pad 5",
          "note": 25,
          "cc": 25,
          "ledIndex": 4
        },
        {
          "id": "p6",
          "label": "Pad 6",
          "note": 26,
          "cc": 26,
          "ledIndex": 5
        },
        {
          "id": "p7",
          "label": "Pad 7",
          "note": 27,
          "cc": 27,
          "ledIndex": 6
        },
        {
          "id": "p8",
          "label": "Pad 8",
          "note": 28,
          "cc": 28,
          "ledIndex": 7
        }
      ],
      "knobs": [],
      "faders": [],
      "buttons": [
        {
          "id": "b1",
          "label": "Btn 1",
          "note": 0,
          "ledIndex": 8,
          "color": "red"
        },
        {
          "id": "b2",
          "label": "Btn 2",
          "note": 1,
          "ledIndex": 9,
          "color": "red"
        },
        {
          "id": "b3",
          "label": "Btn 3",
          "note": 2,
          "ledIndex": 10,
          "color": "red"
        },
        {
          "id": "b4",
          "label": "Btn 4",
          "note": 3,
          "ledIndex": 11,
          "color": "red"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "User Template 1",
        "templateIndex": 0,
        "channel": 0
      },
      {
        "name": "User Template 2",
        "templateIndex": 1,
        "channel": 1
      },
      {
        "name": "User Template 3",
        "templateIndex": 2,
        "channel": 2
      },
      {
        "name": "User Template 4",
        "templateIndex": 3,
        "channel": 3
      },
      {
        "name": "User Template 5",
        "templateIndex": 4,
        "channel": 4
      },
      {
        "name": "User Template 6",
        "templateIndex": 5,
        "channel": 5
      },
      {
        "name": "User Template 7",
        "templateIndex": 6,
        "channel": 6
      },
      {
        "name": "User Template 8",
        "templateIndex": 7,
        "channel": 7
      }
    ],
    "ledColors": {
      "off": 12,
      "red_low": 13,
      "red_full": 15,
      "amber_low": 29,
      "amber_full": 63,
      "yellow_full": 62,
      "green_low": 28,
      "green_full": 60
    },
    "quickSysEx": [
      {
        "label": "Template → 0",
        "bytes": "F0 00 20 29 02 0A 77 00 F7"
      },
      {
        "label": "Template → 1",
        "bytes": "F0 00 20 29 02 0A 77 01 F7"
      },
      {
        "label": "Template → 2",
        "bytes": "F0 00 20 29 02 0A 77 02 F7"
      },
      {
        "label": "All LEDs Off (T0)",
        "bytes": "B0 00 00"
      },
      {
        "label": "All LEDs Full (T0)",
        "bytes": "B0 00 7F"
      },
      {
        "label": "Pad 1 Red Full",
        "bytes": "F0 00 20 29 02 0A 78 00 00 0F F7"
      },
      {
        "label": "Pad 1 Green Full",
        "bytes": "F0 00 20 29 02 0A 78 00 00 3C F7"
      },
      {
        "label": "Pad 1 Amber Full",
        "bytes": "F0 00 20 29 02 0A 78 00 00 3F F7"
      },
      {
        "label": "Flash Mode On (T0)",
        "bytes": "B0 00 28"
      },
      {
        "label": "Flash Mode Off (T0)",
        "bytes": "B0 00 30"
      }
    ]
  },
  {
    "id": "novation_nocturn",
    "name": "Nocturn",
    "manufacturer": "Novation",
    "icon": "🌙",
    "color": "#8e44ad",
    "midiName": [
      "Nocturn"
    ],
    "sysex": true,
    "presets": 8,
    "description": "8 endless encoders + speed dial, 8 buttons, Automap protocol",
    "controls": {
      "pads": [],
      "knobs": [
        {
          "id": "enc1",
          "label": "Enc 1",
          "cc": 74,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc2",
          "label": "Enc 2",
          "cc": 10,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc3",
          "label": "Enc 3",
          "cc": 71,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc4",
          "label": "Enc 4",
          "cc": 76,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc5",
          "label": "Enc 5",
          "cc": 77,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc6",
          "label": "Enc 6",
          "cc": 93,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc7",
          "label": "Enc 7",
          "cc": 73,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc8",
          "label": "Enc 8",
          "cc": 75,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "speed",
          "label": "Speed",
          "cc": 7,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": [
        {
          "id": "btn1",
          "label": "Btn 1",
          "note": 112,
          "color": "green"
        },
        {
          "id": "btn2",
          "label": "Btn 2",
          "note": 113,
          "color": "green"
        },
        {
          "id": "btn3",
          "label": "Btn 3",
          "note": 114,
          "color": "green"
        },
        {
          "id": "btn4",
          "label": "Btn 4",
          "note": 115,
          "color": "green"
        },
        {
          "id": "btn5",
          "label": "Btn 5",
          "note": 116,
          "color": "green"
        },
        {
          "id": "btn6",
          "label": "Btn 6",
          "note": 117,
          "color": "green"
        },
        {
          "id": "btn7",
          "label": "Btn 7",
          "note": 118,
          "color": "green"
        },
        {
          "id": "btn8",
          "label": "Btn 8",
          "note": 119,
          "color": "green"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Preset 1",
        "channel": 0
      },
      {
        "name": "Preset 2",
        "channel": 1
      },
      {
        "name": "Preset 3",
        "channel": 2
      },
      {
        "name": "Preset 4",
        "channel": 3
      },
      {
        "name": "Preset 5",
        "channel": 4
      },
      {
        "name": "Preset 6",
        "channel": 5
      },
      {
        "name": "Preset 7",
        "channel": 6
      },
      {
        "name": "Preset 8",
        "channel": 7
      }
    ],
    "quickSysEx": [
      {
        "label": "Automap On",
        "bytes": "F0 00 20 29 40 5C F7"
      },
      {
        "label": "Automap Off",
        "bytes": "F0 00 20 29 40 5D F7"
      },
      {
        "label": "Speed Dial 64",
        "bytes": "B0 07 40"
      }
    ]
  },
  {
    "id": "novation_remote_zero_sl_mk1",
    "name": "Remote Zero SL mk1",
    "manufacturer": "Novation",
    "icon": "🎚️",
    "color": "#2980b9",
    "midiName": [
      "SL MkII",
      "Remote SL",
      "Zero SL",
      "SL Compact"
    ],
    "sysex": true,
    "presets": 40,
    "description": "Zero-key Remote SL — 8 encoders, 8 faders, LCD display, Automap",
    "controls": {
      "pads": [],
      "knobs": [
        {
          "id": "enc1",
          "label": "Enc 1",
          "cc": 21,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc2",
          "label": "Enc 2",
          "cc": 22,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc3",
          "label": "Enc 3",
          "cc": 23,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc4",
          "label": "Enc 4",
          "cc": 24,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc5",
          "label": "Enc 5",
          "cc": 25,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc6",
          "label": "Enc 6",
          "cc": 26,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc7",
          "label": "Enc 7",
          "cc": 27,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc8",
          "label": "Enc 8",
          "cc": 28,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [
        {
          "id": "fdr1",
          "label": "Fader 1",
          "cc": 41
        },
        {
          "id": "fdr2",
          "label": "Fader 2",
          "cc": 42
        },
        {
          "id": "fdr3",
          "label": "Fader 3",
          "cc": 43
        },
        {
          "id": "fdr4",
          "label": "Fader 4",
          "cc": 44
        },
        {
          "id": "fdr5",
          "label": "Fader 5",
          "cc": 45
        },
        {
          "id": "fdr6",
          "label": "Fader 6",
          "cc": 46
        },
        {
          "id": "fdr7",
          "label": "Fader 7",
          "cc": 47
        },
        {
          "id": "fdr8",
          "label": "Fader 8",
          "cc": 48
        }
      ],
      "buttons": [
        {
          "id": "btn1",
          "label": "Btn 1",
          "note": 112,
          "color": "green"
        },
        {
          "id": "btn2",
          "label": "Btn 2",
          "note": 113,
          "color": "green"
        },
        {
          "id": "btn3",
          "label": "Btn 3",
          "note": 114,
          "color": "green"
        },
        {
          "id": "btn4",
          "label": "Btn 4",
          "note": 115,
          "color": "green"
        },
        {
          "id": "btn5",
          "label": "Btn 5",
          "note": 116,
          "color": "green"
        },
        {
          "id": "btn6",
          "label": "Btn 6",
          "note": 117,
          "color": "green"
        },
        {
          "id": "btn7",
          "label": "Btn 7",
          "note": 118,
          "color": "green"
        },
        {
          "id": "btn8",
          "label": "Btn 8",
          "note": 119,
          "color": "green"
        },
        {
          "id": "rewind",
          "label": "Rewind",
          "note": 116,
          "color": "amber"
        },
        {
          "id": "fwd",
          "label": "Forward",
          "note": 117,
          "color": "amber"
        },
        {
          "id": "stop",
          "label": "Stop",
          "note": 115,
          "color": "red"
        },
        {
          "id": "play",
          "label": "Play",
          "note": 118,
          "color": "green"
        },
        {
          "id": "loop",
          "label": "Loop",
          "note": 113,
          "color": "amber"
        },
        {
          "id": "record",
          "label": "Record",
          "note": 119,
          "color": "red"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Preset 1",
        "channel": 0
      },
      {
        "name": "Preset 2",
        "channel": 1
      },
      {
        "name": "Preset 3",
        "channel": 2
      },
      {
        "name": "Preset 4",
        "channel": 3
      },
      {
        "name": "Preset 5",
        "channel": 4
      },
      {
        "name": "Preset 6",
        "channel": 5
      },
      {
        "name": "Preset 7",
        "channel": 6
      },
      {
        "name": "Preset 8",
        "channel": 7
      }
    ],
    "quickSysEx": [
      {
        "label": "Init Automap",
        "bytes": "F0 00 20 29 03 03 12 01 F7"
      },
      {
        "label": "LCD Line 1: Hello",
        "bytes": "F0 00 20 29 03 03 04 00 48 65 6C 6C 6F 00 F7"
      },
      {
        "label": "LCD Line 2: MIDI",
        "bytes": "F0 00 20 29 03 03 04 01 4D 49 44 49 00 F7"
      },
      {
        "label": "LCD Clear",
        "bytes": "F0 00 20 29 03 03 04 00 20 20 20 20 20 20 20 20 00 F7"
      }
    ]
  },
  {
    "id": "novation_remote25_sl_compact_mk1",
    "name": "Remote 25 SL Compact",
    "manufacturer": "Novation",
    "icon": "🎹",
    "color": "#27ae60",
    "midiName": [
      "SL Compact",
      "Remote 25",
      "SL MkII"
    ],
    "sysex": true,
    "presets": 40,
    "description": "25-key controller — 8 encoders, 8 Buttons, 8 drum pads, LCD, transport, Automap",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 36,
          "cc": 36,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 37,
          "cc": 37,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 38,
          "cc": 38,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 39,
          "cc": 39,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 40,
          "cc": 40,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 41,
          "cc": 41,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 42,
          "cc": 42,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 43,
          "cc": 43,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "enc1",
          "label": "Enc 1",
          "cc": 21,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc2",
          "label": "Enc 2",
          "cc": 22,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc3",
          "label": "Enc 3",
          "cc": 23,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc4",
          "label": "Enc 4",
          "cc": 24,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc5",
          "label": "Enc 5",
          "cc": 25,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc6",
          "label": "Enc 6",
          "cc": 26,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc7",
          "label": "Enc 7",
          "cc": 27,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc8",
          "label": "Enc 8",
          "cc": 28,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc9",
          "label": "Enc 9",
          "cc": 21,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc10",
          "label": "Enc 10",
          "cc": 22,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc11",
          "label": "Enc 11",
          "cc": 23,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc12",
          "label": "Enc 12",
          "cc": 24,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc13",
          "label": "Enc 13",
          "cc": 25,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc14",
          "label": "Enc 14",
          "cc": 26,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc15",
          "label": "Enc 15",
          "cc": 27,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc16",
          "label": "Enc 16",
          "cc": 28,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc17",
          "label": "Enc 17",
          "cc": 21,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc18",
          "label": "Enc 18",
          "cc": 22,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc19",
          "label": "Enc 19",
          "cc": 23,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc20",
          "label": "Enc 20",
          "cc": 24,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc21",
          "label": "Enc 21",
          "cc": 25,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc22",
          "label": "Enc 22",
          "cc": 26,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc23",
          "label": "Enc 23",
          "cc": 27,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc24",
          "label": "Enc 24",
          "cc": 28,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc25",
          "label": "Enc 25",
          "cc": 21,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc26",
          "label": "Enc 26",
          "cc": 22,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc27",
          "label": "Enc 27",
          "cc": 23,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc28",
          "label": "Enc 28",
          "cc": 24,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc29",
          "label": "Enc 29",
          "cc": 25,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc30",
          "label": "Enc 30",
          "cc": 26,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc31",
          "label": "Enc 31",
          "cc": 27,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc32",
          "label": "Enc 32",
          "cc": 28,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": [
        {
          "id": "rewind",
          "label": "Rewind",
          "note": 116,
          "color": "amber"
        },
        {
          "id": "fwd",
          "label": "Forward",
          "note": 117,
          "color": "amber"
        },
        {
          "id": "stop",
          "label": "Stop",
          "note": 115,
          "color": "red"
        },
        {
          "id": "play",
          "label": "Play",
          "note": 118,
          "color": "green"
        },
        {
          "id": "loop",
          "label": "Loop",
          "note": 113,
          "color": "amber"
        },
        {
          "id": "record",
          "label": "Record",
          "note": 119,
          "color": "red"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Preset 1",
        "channel": 8
      },
      {
        "name": "Preset 2",
        "channel": 8
      },
      {
        "name": "Preset 3",
        "channel": 8
      },
      {
        "name": "Preset 4",
        "channel": 8
      },
      {
        "name": "Preset 5",
        "channel": 8
      },
      {
        "name": "Preset 6",
        "channel": 8
      },
      {
        "name": "Preset 7",
        "channel": 8
      },
      {
        "name": "Preset 8",
        "channel": 8
      }
    ],
    "quickSysEx": [
      {
        "label": "Init Automap",
        "bytes": "F0 00 20 29 03 03 12 01 F7"
      },
      {
        "label": "LCD: Hi there!",
        "bytes": "F0 00 20 29 03 03 04 00 48 69 20 74 68 65 72 65 21 00 F7"
      },
      {
        "label": "LCD Clear",
        "bytes": "F0 00 20 29 03 03 04 00 20 20 20 20 20 20 20 20 00 F7"
      }
    ]
  },
  {
    "id": "ni_maschine_mikro_mk1",
    "name": "Maschine Mikro MK1",
    "manufacturer": "Native Instruments",
    "icon": "🎛️",
    "color": "#ff6600",
    "midiName": [
      "Maschine Mikro",
      "Maschine Mikro Controller",
      "Mikro MK1"
    ],
    "sysex": true,
    "presets": 8,
    "description": "16 velocity-sensitive pads, master push encoder, transport & navigation",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 36,
          "cc": 14,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 37,
          "cc": 15,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 38,
          "cc": 16,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 39,
          "cc": 17,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 40,
          "cc": 18,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 41,
          "cc": 19,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 42,
          "cc": 20,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 43,
          "cc": 21,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad9",
          "label": "Pad 9",
          "note": 44,
          "cc": 22,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad10",
          "label": "Pad 10",
          "note": 45,
          "cc": 23,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad11",
          "label": "Pad 11",
          "note": 46,
          "cc": 24,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad12",
          "label": "Pad 12",
          "note": 47,
          "cc": 25,
          "pc": 11,
          "mode": "Momentary"
        },
        {
          "id": "pad13",
          "label": "Pad 13",
          "note": 48,
          "cc": 26,
          "pc": 12,
          "mode": "Momentary"
        },
        {
          "id": "pad14",
          "label": "Pad 14",
          "note": 49,
          "cc": 27,
          "pc": 13,
          "mode": "Momentary"
        },
        {
          "id": "pad15",
          "label": "Pad 15",
          "note": 50,
          "cc": 28,
          "pc": 14,
          "mode": "Momentary"
        },
        {
          "id": "pad16",
          "label": "Pad 16",
          "note": 51,
          "cc": 29,
          "pc": 15,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "enc_main",
          "label": "Push Enc",
          "cc": 7,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc_wheel",
          "label": "Wheel",
          "cc": 14,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": [
        {
          "id": "btn_play",
          "label": "Play",
          "note": 108,
          "color": "green"
        },
        {
          "id": "btn_rec",
          "label": "Rec",
          "note": 109,
          "color": "red"
        },
        {
          "id": "btn_stop",
          "label": "Stop",
          "note": 107,
          "color": "amber"
        },
        {
          "id": "btn_erase",
          "label": "Erase",
          "note": 106,
          "color": "amber"
        },
        {
          "id": "btn_group",
          "label": "Group",
          "note": 102,
          "color": "green"
        },
        {
          "id": "btn_f1",
          "label": "F1",
          "note": 103,
          "color": "green"
        },
        {
          "id": "btn_f2",
          "label": "F2",
          "note": 104,
          "color": "green"
        },
        {
          "id": "btn_f3",
          "label": "F3",
          "note": 105,
          "color": "green"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Group A",
        "channel": 0,
        "pads": [
          {
            "note": 36,
            "cc": 14,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 15,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 16,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 17,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 18,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 19,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 20,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 21,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 22,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 23,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 24,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 25,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 26,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 27,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 28,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 29,
            "pc": 15,
            "mode": "Momentary"
          }
        ],
        "knobs": [
          {
            "cc": 7,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 14,
            "lo": 0,
            "hi": 127
          }
        ]
      },
      {
        "name": "Group B",
        "channel": 1,
        "pads": [
          {
            "note": 36,
            "cc": 14,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 15,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 16,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 17,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 18,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 19,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 20,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 21,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 22,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 23,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 24,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 25,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 26,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 27,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 28,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 29,
            "pc": 15,
            "mode": "Momentary"
          }
        ],
        "knobs": [
          {
            "cc": 7,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 14,
            "lo": 0,
            "hi": 127
          }
        ]
      },
      {
        "name": "Group C",
        "channel": 2,
        "pads": [
          {
            "note": 36,
            "cc": 14,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 15,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 16,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 17,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 18,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 19,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 20,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 21,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 22,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 23,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 24,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 25,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 26,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 27,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 28,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 29,
            "pc": 15,
            "mode": "Momentary"
          }
        ],
        "knobs": [
          {
            "cc": 7,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 14,
            "lo": 0,
            "hi": 127
          }
        ]
      },
      {
        "name": "Group D",
        "channel": 3,
        "pads": [
          {
            "note": 36,
            "cc": 14,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 15,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 16,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 17,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 18,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 19,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 20,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 21,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 22,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 23,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 24,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 25,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 26,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 27,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 28,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 29,
            "pc": 15,
            "mode": "Momentary"
          }
        ],
        "knobs": [
          {
            "cc": 7,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 14,
            "lo": 0,
            "hi": 127
          }
        ]
      },
      {
        "name": "Group E",
        "channel": 4,
        "pads": [
          {
            "note": 36,
            "cc": 14,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 15,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 16,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 17,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 18,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 19,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 20,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 21,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 22,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 23,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 24,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 25,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 26,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 27,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 28,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 29,
            "pc": 15,
            "mode": "Momentary"
          }
        ],
        "knobs": [
          {
            "cc": 7,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 14,
            "lo": 0,
            "hi": 127
          }
        ]
      },
      {
        "name": "Group F",
        "channel": 5,
        "pads": [
          {
            "note": 36,
            "cc": 14,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 15,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 16,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 17,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 18,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 19,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 20,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 21,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 22,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 23,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 24,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 25,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 26,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 27,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 28,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 29,
            "pc": 15,
            "mode": "Momentary"
          }
        ],
        "knobs": [
          {
            "cc": 7,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 14,
            "lo": 0,
            "hi": 127
          }
        ]
      },
      {
        "name": "Group G",
        "channel": 6,
        "pads": [
          {
            "note": 36,
            "cc": 14,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 15,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 16,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 17,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 18,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 19,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 20,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 21,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 22,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 23,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 24,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 25,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 26,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 27,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 28,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 29,
            "pc": 15,
            "mode": "Momentary"
          }
        ],
        "knobs": [
          {
            "cc": 7,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 14,
            "lo": 0,
            "hi": 127
          }
        ]
      },
      {
        "name": "Group H",
        "channel": 7,
        "pads": [
          {
            "note": 36,
            "cc": 14,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 15,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 16,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 17,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 18,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 19,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 20,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 21,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 22,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 23,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 24,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 25,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 26,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 27,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 28,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 29,
            "pc": 15,
            "mode": "Momentary"
          }
        ],
        "knobs": [
          {
            "cc": 7,
            "lo": 0,
            "hi": 127
          },
          {
            "cc": 14,
            "lo": 0,
            "hi": 127
          }
        ]
      }
    ],
    "quickSysEx": [
      {
        "label": "NI Device Inquiry",
        "bytes": "F0 7E 7F 06 01 F7"
      },
      {
        "label": "All LEDs Off",
        "bytes": "F0 00 21 09 00 00 00 F7"
      }
    ]
  },
  {
    "id": "ni_maschine_mikro_mk2",
    "name": "Maschine Mikro MK2",
    "manufacturer": "Native Instruments",
    "icon": "🎛️",
    "color": "#e65100",
    "midiName": [
      "Maschine Mikro MK2",
      "Mikro MK2"
    ],
    "sysex": true,
    "presets": 8,
    "description": "16 RGB backlit pads, high-contrast display, dual-mode push encoder",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 36,
          "cc": 20,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 37,
          "cc": 21,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 38,
          "cc": 22,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 39,
          "cc": 23,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 40,
          "cc": 24,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 41,
          "cc": 25,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 42,
          "cc": 26,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 43,
          "cc": 27,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad9",
          "label": "Pad 9",
          "note": 44,
          "cc": 28,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad10",
          "label": "Pad 10",
          "note": 45,
          "cc": 29,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad11",
          "label": "Pad 11",
          "note": 46,
          "cc": 30,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad12",
          "label": "Pad 12",
          "note": 47,
          "cc": 31,
          "pc": 11,
          "mode": "Momentary"
        },
        {
          "id": "pad13",
          "label": "Pad 13",
          "note": 48,
          "cc": 32,
          "pc": 12,
          "mode": "Momentary"
        },
        {
          "id": "pad14",
          "label": "Pad 14",
          "note": 49,
          "cc": 33,
          "pc": 13,
          "mode": "Momentary"
        },
        {
          "id": "pad15",
          "label": "Pad 15",
          "note": 50,
          "cc": 34,
          "pc": 14,
          "mode": "Momentary"
        },
        {
          "id": "pad16",
          "label": "Pad 16",
          "note": 51,
          "cc": 35,
          "pc": 15,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "encoder",
          "label": "Master Encoder",
          "cc": 7,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": [
        {
          "id": "btn_play",
          "label": "Play",
          "note": 108,
          "color": "green"
        },
        {
          "id": "btn_rec",
          "label": "Rec",
          "note": 109,
          "color": "red"
        },
        {
          "id": "btn_restart",
          "label": "Restart",
          "note": 110,
          "color": "green"
        },
        {
          "id": "btn_grid",
          "label": "Grid",
          "note": 111,
          "color": "amber"
        },
        {
          "id": "btn_solo",
          "label": "Solo",
          "note": 112,
          "color": "amber"
        },
        {
          "id": "btn_mute",
          "label": "Mute",
          "note": 113,
          "color": "amber"
        },
        {
          "id": "btn_pad_mode",
          "label": "Pad Mode",
          "note": 114,
          "color": "green"
        },
        {
          "id": "btn_nav",
          "label": "Nav",
          "note": 115,
          "color": "green"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Group A (Ch 1)",
        "channel": 0,
        "pads": [
          {
            "note": 36,
            "cc": 20,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 21,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 22,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 23,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 24,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 25,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 26,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 27,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 28,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 29,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 30,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 31,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 32,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 33,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 34,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 35,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group B (Ch 2)",
        "channel": 1,
        "pads": [
          {
            "note": 36,
            "cc": 20,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 21,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 22,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 23,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 24,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 25,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 26,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 27,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 28,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 29,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 30,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 31,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 32,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 33,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 34,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 35,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group C (Ch 3)",
        "channel": 2,
        "pads": [
          {
            "note": 36,
            "cc": 20,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 21,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 22,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 23,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 24,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 25,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 26,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 27,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 28,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 29,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 30,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 31,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 32,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 33,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 34,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 35,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group D (Ch 4)",
        "channel": 3,
        "pads": [
          {
            "note": 36,
            "cc": 20,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 21,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 22,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 23,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 24,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 25,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 26,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 27,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 28,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 29,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 30,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 31,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 32,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 33,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 34,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 35,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group E (Ch 5)",
        "channel": 4,
        "pads": [
          {
            "note": 36,
            "cc": 20,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 21,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 22,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 23,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 24,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 25,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 26,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 27,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 28,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 29,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 30,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 31,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 32,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 33,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 34,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 35,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group F (Ch 6)",
        "channel": 5,
        "pads": [
          {
            "note": 36,
            "cc": 20,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 21,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 22,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 23,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 24,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 25,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 26,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 27,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 28,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 29,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 30,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 31,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 32,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 33,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 34,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 35,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group G (Ch 7)",
        "channel": 6,
        "pads": [
          {
            "note": 36,
            "cc": 20,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 21,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 22,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 23,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 24,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 25,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 26,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 27,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 28,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 29,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 30,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 31,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 32,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 33,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 34,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 35,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group H (Ch 8)",
        "channel": 7,
        "pads": [
          {
            "note": 36,
            "cc": 20,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 21,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 22,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 23,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 24,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 25,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 26,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 27,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 28,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 29,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 30,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 31,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 32,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 33,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 34,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 35,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      }
    ],
    "quickSysEx": [
      {
        "label": "Device Inquiry",
        "bytes": "F0 7E 7F 06 01 F7"
      }
    ]
  },
  {
    "id": "ni_maschine_mikro_mk3",
    "name": "Maschine Mikro MK3",
    "manufacturer": "Native Instruments",
    "icon": "🎛️",
    "color": "#bf360c",
    "midiName": [
      "Maschine Mikro MK3",
      "Mikro MK3"
    ],
    "sysex": true,
    "presets": 8,
    "description": "16 oversized multi-colored pads, dual-touch Smart Strip, compact push encoder",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 36,
          "cc": 16,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 37,
          "cc": 17,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 38,
          "cc": 18,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 39,
          "cc": 19,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 40,
          "cc": 20,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 41,
          "cc": 21,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 42,
          "cc": 22,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 43,
          "cc": 23,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad9",
          "label": "Pad 9",
          "note": 44,
          "cc": 24,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad10",
          "label": "Pad 10",
          "note": 45,
          "cc": 25,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad11",
          "label": "Pad 11",
          "note": 46,
          "cc": 26,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad12",
          "label": "Pad 12",
          "note": 47,
          "cc": 27,
          "pc": 11,
          "mode": "Momentary"
        },
        {
          "id": "pad13",
          "label": "Pad 13",
          "note": 48,
          "cc": 28,
          "pc": 12,
          "mode": "Momentary"
        },
        {
          "id": "pad14",
          "label": "Pad 14",
          "note": 49,
          "cc": 29,
          "pc": 13,
          "mode": "Momentary"
        },
        {
          "id": "pad15",
          "label": "Pad 15",
          "note": 50,
          "cc": 30,
          "pc": 14,
          "mode": "Momentary"
        },
        {
          "id": "pad16",
          "label": "Pad 16",
          "note": 51,
          "cc": 31,
          "pc": 15,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "encoder",
          "label": "4-D Encoder",
          "cc": 7,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "smart_strip",
          "label": "Smart Strip",
          "cc": 1,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": [
        {
          "id": "btn_pitch",
          "label": "Pitch",
          "note": 90,
          "color": "amber"
        },
        {
          "id": "btn_mod",
          "label": "Mod",
          "note": 91,
          "color": "amber"
        },
        {
          "id": "btn_perform",
          "label": "Perform",
          "note": 92,
          "color": "green"
        },
        {
          "id": "btn_notes",
          "label": "Notes",
          "note": 93,
          "color": "green"
        },
        {
          "id": "btn_play",
          "label": "Play",
          "note": 108,
          "color": "green"
        },
        {
          "id": "btn_rec",
          "label": "Rec",
          "note": 109,
          "color": "red"
        },
        {
          "id": "btn_stop",
          "label": "Stop",
          "note": 107,
          "color": "amber"
        },
        {
          "id": "btn_shift",
          "label": "Shift",
          "note": 100,
          "color": "green"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Bank A",
        "channel": 0,
        "pads": [
          {
            "note": 36,
            "cc": 16,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 17,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 18,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 19,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 20,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 21,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 22,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 23,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 24,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 25,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 26,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 27,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 28,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 29,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 30,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 31,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Bank B",
        "channel": 1,
        "pads": [
          {
            "note": 36,
            "cc": 16,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 17,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 18,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 19,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 20,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 21,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 22,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 23,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 24,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 25,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 26,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 27,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 28,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 29,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 30,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 31,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Bank C",
        "channel": 2,
        "pads": [
          {
            "note": 36,
            "cc": 16,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 17,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 18,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 19,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 20,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 21,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 22,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 23,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 24,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 25,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 26,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 27,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 28,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 29,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 30,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 31,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Bank D",
        "channel": 3,
        "pads": [
          {
            "note": 36,
            "cc": 16,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 17,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 18,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 19,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 20,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 21,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 22,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 23,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 24,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 25,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 26,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 27,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 28,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 29,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 30,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 31,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Bank E",
        "channel": 4,
        "pads": [
          {
            "note": 36,
            "cc": 16,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 17,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 18,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 19,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 20,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 21,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 22,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 23,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 24,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 25,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 26,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 27,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 28,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 29,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 30,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 31,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Bank F",
        "channel": 5,
        "pads": [
          {
            "note": 36,
            "cc": 16,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 17,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 18,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 19,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 20,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 21,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 22,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 23,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 24,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 25,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 26,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 27,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 28,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 29,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 30,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 31,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Bank G",
        "channel": 6,
        "pads": [
          {
            "note": 36,
            "cc": 16,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 17,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 18,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 19,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 20,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 21,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 22,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 23,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 24,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 25,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 26,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 27,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 28,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 29,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 30,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 31,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Bank H",
        "channel": 7,
        "pads": [
          {
            "note": 36,
            "cc": 16,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 17,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 18,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 19,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 20,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 21,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 22,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 23,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 24,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 25,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 26,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 27,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 28,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 29,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 30,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 31,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      }
    ],
    "quickSysEx": [
      {
        "label": "Identity Request",
        "bytes": "F0 7E 7F 06 01 F7"
      }
    ]
  },
  {
    "id": "ni_maschine_mk1",
    "name": "Maschine MK1",
    "manufacturer": "Native Instruments",
    "icon": "🎹",
    "color": "#d84315",
    "midiName": [
      "Maschine Controller",
      "Maschine MK1"
    ],
    "sysex": true,
    "presets": 8,
    "description": "16 pads, 8 rotary encoders with dual displays, dedicated master section",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 36,
          "cc": 28,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 37,
          "cc": 29,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 38,
          "cc": 30,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 39,
          "cc": 31,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 40,
          "cc": 32,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 41,
          "cc": 33,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 42,
          "cc": 34,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 43,
          "cc": 35,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad9",
          "label": "Pad 9",
          "note": 44,
          "cc": 36,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad10",
          "label": "Pad 10",
          "note": 45,
          "cc": 37,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad11",
          "label": "Pad 11",
          "note": 46,
          "cc": 38,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad12",
          "label": "Pad 12",
          "note": 47,
          "cc": 39,
          "pc": 11,
          "mode": "Momentary"
        },
        {
          "id": "pad13",
          "label": "Pad 13",
          "note": 48,
          "cc": 40,
          "pc": 12,
          "mode": "Momentary"
        },
        {
          "id": "pad14",
          "label": "Pad 14",
          "note": 49,
          "cc": 41,
          "pc": 13,
          "mode": "Momentary"
        },
        {
          "id": "pad15",
          "label": "Pad 15",
          "note": 50,
          "cc": 42,
          "pc": 14,
          "mode": "Momentary"
        },
        {
          "id": "pad16",
          "label": "Pad 16",
          "note": 51,
          "cc": 43,
          "pc": 15,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "enc1",
          "label": "Enc 1",
          "cc": 20,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc2",
          "label": "Enc 2",
          "cc": 21,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc3",
          "label": "Enc 3",
          "cc": 22,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc4",
          "label": "Enc 4",
          "cc": 23,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc5",
          "label": "Enc 5",
          "cc": 24,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc6",
          "label": "Enc 6",
          "cc": 25,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc7",
          "label": "Enc 7",
          "cc": 26,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc8",
          "label": "Enc 8",
          "cc": 27,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": [
        {
          "id": "btn_soft1",
          "label": "Display 1",
          "note": 80,
          "color": "green"
        },
        {
          "id": "btn_soft2",
          "label": "Display 2",
          "note": 81,
          "color": "green"
        },
        {
          "id": "btn_soft3",
          "label": "Display 3",
          "note": 82,
          "color": "green"
        },
        {
          "id": "btn_soft4",
          "label": "Display 4",
          "note": 83,
          "color": "green"
        },
        {
          "id": "btn_soft5",
          "label": "Display 5",
          "note": 84,
          "color": "green"
        },
        {
          "id": "btn_soft6",
          "label": "Display 6",
          "note": 85,
          "color": "green"
        },
        {
          "id": "btn_soft7",
          "label": "Display 7",
          "note": 86,
          "color": "green"
        },
        {
          "id": "btn_soft8",
          "label": "Display 8",
          "note": 87,
          "color": "green"
        },
        {
          "id": "btn_play",
          "label": "Play",
          "note": 108,
          "color": "green"
        },
        {
          "id": "btn_rec",
          "label": "Rec",
          "note": 109,
          "color": "red"
        },
        {
          "id": "btn_restart",
          "label": "Restart",
          "note": 110,
          "color": "amber"
        },
        {
          "id": "btn_erase",
          "label": "Erase",
          "note": 106,
          "color": "amber"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Group A",
        "channel": 0,
        "pads": [
          {
            "note": 36,
            "cc": 28,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 29,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 30,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 31,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 32,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 33,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 34,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 35,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 36,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 37,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 38,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 39,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 40,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 41,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 42,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 43,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group B",
        "channel": 1,
        "pads": [
          {
            "note": 36,
            "cc": 28,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 29,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 30,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 31,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 32,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 33,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 34,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 35,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 36,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 37,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 38,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 39,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 40,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 41,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 42,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 43,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group C",
        "channel": 2,
        "pads": [
          {
            "note": 36,
            "cc": 28,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 29,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 30,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 31,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 32,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 33,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 34,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 35,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 36,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 37,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 38,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 39,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 40,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 41,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 42,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 43,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group D",
        "channel": 3,
        "pads": [
          {
            "note": 36,
            "cc": 28,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 29,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 30,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 31,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 32,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 33,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 34,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 35,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 36,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 37,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 38,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 39,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 40,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 41,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 42,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 43,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group E",
        "channel": 4,
        "pads": [
          {
            "note": 36,
            "cc": 28,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 29,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 30,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 31,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 32,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 33,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 34,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 35,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 36,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 37,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 38,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 39,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 40,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 41,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 42,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 43,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group F",
        "channel": 5,
        "pads": [
          {
            "note": 36,
            "cc": 28,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 29,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 30,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 31,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 32,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 33,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 34,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 35,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 36,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 37,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 38,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 39,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 40,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 41,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 42,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 43,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group G",
        "channel": 6,
        "pads": [
          {
            "note": 36,
            "cc": 28,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 29,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 30,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 31,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 32,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 33,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 34,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 35,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 36,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 37,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 38,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 39,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 40,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 41,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 42,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 43,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      },
      {
        "name": "Group H",
        "channel": 7,
        "pads": [
          {
            "note": 36,
            "cc": 28,
            "pc": 0,
            "mode": "Momentary"
          },
          {
            "note": 37,
            "cc": 29,
            "pc": 1,
            "mode": "Momentary"
          },
          {
            "note": 38,
            "cc": 30,
            "pc": 2,
            "mode": "Momentary"
          },
          {
            "note": 39,
            "cc": 31,
            "pc": 3,
            "mode": "Momentary"
          },
          {
            "note": 40,
            "cc": 32,
            "pc": 4,
            "mode": "Momentary"
          },
          {
            "note": 41,
            "cc": 33,
            "pc": 5,
            "mode": "Momentary"
          },
          {
            "note": 42,
            "cc": 34,
            "pc": 6,
            "mode": "Momentary"
          },
          {
            "note": 43,
            "cc": 35,
            "pc": 7,
            "mode": "Momentary"
          },
          {
            "note": 44,
            "cc": 36,
            "pc": 8,
            "mode": "Momentary"
          },
          {
            "note": 45,
            "cc": 37,
            "pc": 9,
            "mode": "Momentary"
          },
          {
            "note": 46,
            "cc": 38,
            "pc": 10,
            "mode": "Momentary"
          },
          {
            "note": 47,
            "cc": 39,
            "pc": 11,
            "mode": "Momentary"
          },
          {
            "note": 48,
            "cc": 40,
            "pc": 12,
            "mode": "Momentary"
          },
          {
            "note": 49,
            "cc": 41,
            "pc": 13,
            "mode": "Momentary"
          },
          {
            "note": 50,
            "cc": 42,
            "pc": 14,
            "mode": "Momentary"
          },
          {
            "note": 51,
            "cc": 43,
            "pc": 15,
            "mode": "Momentary"
          }
        ]
      }
    ],
    "quickSysEx": [
      {
        "label": "Device Inquiry",
        "bytes": "F0 7E 7F 06 01 F7"
      }
    ]
  },
  {
    "id": "ni_maschine_mk2",
    "name": "Maschine MK2",
    "manufacturer": "Native Instruments",
    "icon": "🎹",
    "color": "#f4511e",
    "midiName": [
      "Maschine MK2",
      "Maschine Controller MK2"
    ],
    "sysex": true,
    "presets": 8,
    "description": "16 high-sensitivity RGB pads, dual backlit displays, 8 rotary encoders",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 36,
          "cc": 28,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 37,
          "cc": 29,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 38,
          "cc": 30,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 39,
          "cc": 31,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 40,
          "cc": 32,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 41,
          "cc": 33,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 42,
          "cc": 34,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 43,
          "cc": 35,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad9",
          "label": "Pad 9",
          "note": 44,
          "cc": 36,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad10",
          "label": "Pad 10",
          "note": 45,
          "cc": 37,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad11",
          "label": "Pad 11",
          "note": 46,
          "cc": 38,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad12",
          "label": "Pad 12",
          "note": 47,
          "cc": 39,
          "pc": 11,
          "mode": "Momentary"
        },
        {
          "id": "pad13",
          "label": "Pad 13",
          "note": 48,
          "cc": 40,
          "pc": 12,
          "mode": "Momentary"
        },
        {
          "id": "pad14",
          "label": "Pad 14",
          "note": 49,
          "cc": 41,
          "pc": 13,
          "mode": "Momentary"
        },
        {
          "id": "pad15",
          "label": "Pad 15",
          "note": 50,
          "cc": 42,
          "pc": 14,
          "mode": "Momentary"
        },
        {
          "id": "pad16",
          "label": "Pad 16",
          "note": 51,
          "cc": 43,
          "pc": 15,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "enc1",
          "label": "Enc 1",
          "cc": 20,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc2",
          "label": "Enc 2",
          "cc": 21,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc3",
          "label": "Enc 3",
          "cc": 22,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc4",
          "label": "Enc 4",
          "cc": 23,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc5",
          "label": "Enc 5",
          "cc": 24,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc6",
          "label": "Enc 6",
          "cc": 25,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc7",
          "label": "Enc 7",
          "cc": 26,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc8",
          "label": "Enc 8",
          "cc": 27,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "master_enc",
          "label": "Master Enc",
          "cc": 7,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": [
        {
          "id": "btn_soft1",
          "label": "Soft 1",
          "note": 80,
          "color": "green"
        },
        {
          "id": "btn_soft2",
          "label": "Soft 2",
          "note": 81,
          "color": "green"
        },
        {
          "id": "btn_soft3",
          "label": "Soft 3",
          "note": 82,
          "color": "green"
        },
        {
          "id": "btn_soft4",
          "label": "Soft 4",
          "note": 83,
          "color": "green"
        },
        {
          "id": "btn_play",
          "label": "Play",
          "note": 108,
          "color": "green"
        },
        {
          "id": "btn_rec",
          "label": "Rec",
          "note": 109,
          "color": "red"
        },
        {
          "id": "btn_mute",
          "label": "Mute",
          "note": 112,
          "color": "amber"
        },
        {
          "id": "btn_solo",
          "label": "Solo",
          "note": 113,
          "color": "amber"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Group A",
        "channel": 0
      },
      {
        "name": "Group B",
        "channel": 1
      },
      {
        "name": "Group C",
        "channel": 2
      },
      {
        "name": "Group D",
        "channel": 3
      },
      {
        "name": "Group E",
        "channel": 4
      },
      {
        "name": "Group F",
        "channel": 5
      },
      {
        "name": "Group G",
        "channel": 6
      },
      {
        "name": "Group H",
        "channel": 7
      }
    ],
    "quickSysEx": [
      {
        "label": "Device Inquiry",
        "bytes": "F0 7E 7F 06 01 F7"
      }
    ]
  },
  {
    "id": "ni_maschine_mk3",
    "name": "Maschine MK3",
    "manufacturer": "Native Instruments",
    "icon": "🎛️",
    "color": "#263238",
    "midiName": [
      "Maschine MK3",
      "Maschine Plus"
    ],
    "sysex": true,
    "presets": 8,
    "description": "Integrated 96kHz audio interface, dual high-res color displays, Smart Strip, 8 touch knobs",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 36,
          "cc": 16,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 37,
          "cc": 17,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 38,
          "cc": 18,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 39,
          "cc": 19,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 40,
          "cc": 20,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 41,
          "cc": 21,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 42,
          "cc": 22,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 43,
          "cc": 23,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad9",
          "label": "Pad 9",
          "note": 44,
          "cc": 24,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad10",
          "label": "Pad 10",
          "note": 45,
          "cc": 25,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad11",
          "label": "Pad 11",
          "note": 46,
          "cc": 26,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad12",
          "label": "Pad 12",
          "note": 47,
          "cc": 27,
          "pc": 11,
          "mode": "Momentary"
        },
        {
          "id": "pad13",
          "label": "Pad 13",
          "note": 48,
          "cc": 28,
          "pc": 12,
          "mode": "Momentary"
        },
        {
          "id": "pad14",
          "label": "Pad 14",
          "note": 49,
          "cc": 29,
          "pc": 13,
          "mode": "Momentary"
        },
        {
          "id": "pad15",
          "label": "Pad 15",
          "note": 50,
          "cc": 30,
          "pc": 14,
          "mode": "Momentary"
        },
        {
          "id": "pad16",
          "label": "Pad 16",
          "note": 51,
          "cc": 31,
          "pc": 15,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "enc1",
          "label": "Macro 1",
          "cc": 20,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc2",
          "label": "Macro 2",
          "cc": 21,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc3",
          "label": "Macro 3",
          "cc": 22,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc4",
          "label": "Macro 4",
          "cc": 23,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc5",
          "label": "Macro 5",
          "cc": 24,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc6",
          "label": "Macro 6",
          "cc": 25,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc7",
          "label": "Macro 7",
          "cc": 26,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc8",
          "label": "Macro 8",
          "cc": 27,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "smart_strip",
          "label": "Smart Strip",
          "cc": 1,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc_4d",
          "label": "4-D Encoder",
          "cc": 7,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": [
        {
          "id": "btn_soft1",
          "label": "Soft 1",
          "note": 80,
          "color": "green"
        },
        {
          "id": "btn_soft2",
          "label": "Soft 2",
          "note": 81,
          "color": "green"
        },
        {
          "id": "btn_soft3",
          "label": "Soft 3",
          "note": 82,
          "color": "green"
        },
        {
          "id": "btn_soft4",
          "label": "Soft 4",
          "note": 83,
          "color": "green"
        },
        {
          "id": "btn_play",
          "label": "Play",
          "note": 108,
          "color": "green"
        },
        {
          "id": "btn_rec",
          "label": "Rec",
          "note": 109,
          "color": "red"
        },
        {
          "id": "btn_stop",
          "label": "Stop",
          "note": 107,
          "color": "amber"
        },
        {
          "id": "btn_restart",
          "label": "Restart",
          "note": 110,
          "color": "green"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Group A (Studio Mode)",
        "channel": 0
      },
      {
        "name": "Group B (Studio Mode)",
        "channel": 1
      },
      {
        "name": "Group C (Studio Mode)",
        "channel": 2
      },
      {
        "name": "Group D (Studio Mode)",
        "channel": 3
      },
      {
        "name": "Group E (Studio Mode)",
        "channel": 4
      },
      {
        "name": "Group F (Studio Mode)",
        "channel": 5
      },
      {
        "name": "Group G (Studio Mode)",
        "channel": 6
      },
      {
        "name": "Group H (Studio Mode)",
        "channel": 7
      }
    ],
    "quickSysEx": [
      {
        "label": "Device Inquiry",
        "bytes": "F0 7E 7F 06 01 F7"
      }
    ]
  },
  {
    "id": "novation_launchcontrol_xl_mk1",
    "name": "Launch Control XL MK1",
    "manufacturer": "Novation",
    "icon": "🎚️",
    "color": "#00b16a",
    "midiName": [
      "Launch Control XL",
      "Launch Control XL 1"
    ],
    "sysex": true,
    "presets": 16,
    "description": "24 rotary knobs (3 rows of 8), 8 smooth 60mm faders, 16 multi-color buttons",
    "controls": {
      "pads": [],
      "knobs": [
        {
          "id": "send_a_1",
          "label": "Send A 1",
          "cc": 13,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_2",
          "label": "Send A 2",
          "cc": 14,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_3",
          "label": "Send A 3",
          "cc": 15,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_4",
          "label": "Send A 4",
          "cc": 16,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_5",
          "label": "Send A 5",
          "cc": 17,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_6",
          "label": "Send A 6",
          "cc": 18,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_7",
          "label": "Send A 7",
          "cc": 19,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_8",
          "label": "Send A 8",
          "cc": 20,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_1",
          "label": "Send B 1",
          "cc": 29,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_2",
          "label": "Send B 2",
          "cc": 30,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_3",
          "label": "Send B 3",
          "cc": 31,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_4",
          "label": "Send B 4",
          "cc": 32,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_5",
          "label": "Send B 5",
          "cc": 33,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_6",
          "label": "Send B 6",
          "cc": 34,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_7",
          "label": "Send B 7",
          "cc": 35,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_8",
          "label": "Send B 8",
          "cc": 36,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_1",
          "label": "Pan 1",
          "cc": 49,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_2",
          "label": "Pan 2",
          "cc": 50,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_3",
          "label": "Pan 3",
          "cc": 51,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_4",
          "label": "Pan 4",
          "cc": 52,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_5",
          "label": "Pan 5",
          "cc": 53,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_6",
          "label": "Pan 6",
          "cc": 54,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_7",
          "label": "Pan 7",
          "cc": 55,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_8",
          "label": "Pan 8",
          "cc": 56,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [
        {
          "id": "fdr1",
          "label": "Track 1",
          "cc": 77
        },
        {
          "id": "fdr2",
          "label": "Track 2",
          "cc": 78
        },
        {
          "id": "fdr3",
          "label": "Track 3",
          "cc": 79
        },
        {
          "id": "fdr4",
          "label": "Track 4",
          "cc": 80
        },
        {
          "id": "fdr5",
          "label": "Track 5",
          "cc": 81
        },
        {
          "id": "fdr6",
          "label": "Track 6",
          "cc": 82
        },
        {
          "id": "fdr7",
          "label": "Track 7",
          "cc": 83
        },
        {
          "id": "fdr8",
          "label": "Track 8",
          "cc": 84
        }
      ],
      "buttons": [
        {
          "id": "focus_1",
          "label": "Focus 1",
          "note": 41,
          "color": "green"
        },
        {
          "id": "focus_2",
          "label": "Focus 2",
          "note": 42,
          "color": "green"
        },
        {
          "id": "focus_3",
          "label": "Focus 3",
          "note": 43,
          "color": "green"
        },
        {
          "id": "focus_4",
          "label": "Focus 4",
          "note": 44,
          "color": "green"
        },
        {
          "id": "focus_5",
          "label": "Focus 5",
          "note": 57,
          "color": "green"
        },
        {
          "id": "focus_6",
          "label": "Focus 6",
          "note": 58,
          "color": "green"
        },
        {
          "id": "focus_7",
          "label": "Focus 7",
          "note": 59,
          "color": "green"
        },
        {
          "id": "focus_8",
          "label": "Focus 8",
          "note": 60,
          "color": "green"
        },
        {
          "id": "ctrl_1",
          "label": "Control 1",
          "note": 73,
          "color": "amber"
        },
        {
          "id": "ctrl_2",
          "label": "Control 2",
          "note": 74,
          "color": "amber"
        },
        {
          "id": "ctrl_3",
          "label": "Control 3",
          "note": 75,
          "color": "amber"
        },
        {
          "id": "ctrl_4",
          "label": "Control 4",
          "note": 76,
          "color": "amber"
        },
        {
          "id": "ctrl_5",
          "label": "Control 5",
          "note": 89,
          "color": "amber"
        },
        {
          "id": "ctrl_6",
          "label": "Control 6",
          "note": 90,
          "color": "amber"
        },
        {
          "id": "ctrl_7",
          "label": "Control 7",
          "note": 91,
          "color": "amber"
        },
        {
          "id": "ctrl_8",
          "label": "Control 8",
          "note": 92,
          "color": "amber"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "User 1",
        "channel": 8
      },
      {
        "name": "User 2",
        "channel": 8
      },
      {
        "name": "User 3",
        "channel": 8
      },
      {
        "name": "User 4",
        "channel": 8
      },
      {
        "name": "User 5",
        "channel": 8
      },
      {
        "name": "User 6",
        "channel": 8
      },
      {
        "name": "User 7",
        "channel": 8
      },
      {
        "name": "User 8",
        "channel": 8
      },
      {
        "name": "Factory 1",
        "channel": 8
      },
      {
        "name": "Factory 2",
        "channel": 8
      },
      {
        "name": "Factory 3",
        "channel": 8
      },
      {
        "name": "Factory 4",
        "channel": 8
      },
      {
        "name": "Factory 5",
        "channel": 8
      },
      {
        "name": "Factory 6",
        "channel": 8
      },
      {
        "name": "Factory 7",
        "channel": 8
      },
      {
        "name": "Factory 8",
        "channel": 8
      }
    ],
    "quickSysEx": [
      {
        "label": "Request Template 1",
        "bytes": "F0 00 20 29 02 11 77 00 F7"
      },
      {
        "label": "Set All LEDs Amber",
        "bytes": "B8 00 7D"
      }
    ]
  },
  {
    "id": "novation_launchcontrol_xl_mk2",
    "name": "Launch Control XL MK2",
    "manufacturer": "Novation",
    "icon": "🎚️",
    "color": "#00a86b",
    "midiName": [
      "Launch Control XL MK2",
      "LC XL MK2"
    ],
    "sysex": true,
    "presets": 16,
    "description": "Enhanced Class-Compliant mixer controller with 24 knobs, 8 faders, 16 multicolor buttons",
    "controls": {
      "pads": [],
      "knobs": [
        {
          "id": "send_a_1",
          "label": "Send A 1",
          "cc": 13,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_2",
          "label": "Send A 2",
          "cc": 14,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_3",
          "label": "Send A 3",
          "cc": 15,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_4",
          "label": "Send A 4",
          "cc": 16,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_5",
          "label": "Send A 5",
          "cc": 17,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_6",
          "label": "Send A 6",
          "cc": 18,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_7",
          "label": "Send A 7",
          "cc": 19,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_a_8",
          "label": "Send A 8",
          "cc": 20,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_1",
          "label": "Send B 1",
          "cc": 29,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_2",
          "label": "Send B 2",
          "cc": 30,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_3",
          "label": "Send B 3",
          "cc": 31,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_4",
          "label": "Send B 4",
          "cc": 32,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_5",
          "label": "Send B 5",
          "cc": 33,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_6",
          "label": "Send B 6",
          "cc": 34,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_7",
          "label": "Send B 7",
          "cc": 35,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "send_b_8",
          "label": "Send B 8",
          "cc": 36,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_1",
          "label": "Pan 1",
          "cc": 49,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_2",
          "label": "Pan 2",
          "cc": 50,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_3",
          "label": "Pan 3",
          "cc": 51,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_4",
          "label": "Pan 4",
          "cc": 52,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_5",
          "label": "Pan 5",
          "cc": 53,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_6",
          "label": "Pan 6",
          "cc": 54,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_7",
          "label": "Pan 7",
          "cc": 55,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pan_8",
          "label": "Pan 8",
          "cc": 56,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [
        {
          "id": "fdr1",
          "label": "Fader 1",
          "cc": 77
        },
        {
          "id": "fdr2",
          "label": "Fader 2",
          "cc": 78
        },
        {
          "id": "fdr3",
          "label": "Fader 3",
          "cc": 79
        },
        {
          "id": "fdr4",
          "label": "Fader 4",
          "cc": 80
        },
        {
          "id": "fdr5",
          "label": "Fader 5",
          "cc": 81
        },
        {
          "id": "fdr6",
          "label": "Fader 6",
          "cc": 82
        },
        {
          "id": "fdr7",
          "label": "Fader 7",
          "cc": 83
        },
        {
          "id": "fdr8",
          "label": "Fader 8",
          "cc": 84
        }
      ],
      "buttons": [
        {
          "id": "track_focus_1",
          "label": "Track Focus 1",
          "note": 41,
          "color": "green"
        },
        {
          "id": "track_focus_2",
          "label": "Track Focus 2",
          "note": 42,
          "color": "green"
        },
        {
          "id": "track_focus_3",
          "label": "Track Focus 3",
          "note": 43,
          "color": "green"
        },
        {
          "id": "track_focus_4",
          "label": "Track Focus 4",
          "note": 44,
          "color": "green"
        },
        {
          "id": "track_focus_5",
          "label": "Track Focus 5",
          "note": 57,
          "color": "green"
        },
        {
          "id": "track_focus_6",
          "label": "Track Focus 6",
          "note": 58,
          "color": "green"
        },
        {
          "id": "track_focus_7",
          "label": "Track Focus 7",
          "note": 59,
          "color": "green"
        },
        {
          "id": "track_focus_8",
          "label": "Track Focus 8",
          "note": 60,
          "color": "green"
        },
        {
          "id": "track_ctrl_1",
          "label": "Track Control 1",
          "note": 73,
          "color": "red"
        },
        {
          "id": "track_ctrl_2",
          "label": "Track Control 2",
          "note": 74,
          "color": "red"
        },
        {
          "id": "track_ctrl_3",
          "label": "Track Control 3",
          "note": 75,
          "color": "red"
        },
        {
          "id": "track_ctrl_4",
          "label": "Track Control 4",
          "note": 76,
          "color": "red"
        },
        {
          "id": "track_ctrl_5",
          "label": "Track Control 5",
          "note": 89,
          "color": "red"
        },
        {
          "id": "track_ctrl_6",
          "label": "Track Control 6",
          "note": 90,
          "color": "red"
        },
        {
          "id": "track_ctrl_7",
          "label": "Track Control 7",
          "note": 91,
          "color": "red"
        },
        {
          "id": "track_ctrl_8",
          "label": "Track Control 8",
          "note": 92,
          "color": "red"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "User Preset 1",
        "channel": 8
      },
      {
        "name": "User Preset 2",
        "channel": 8
      },
      {
        "name": "User Preset 3",
        "channel": 8
      },
      {
        "name": "User Preset 4",
        "channel": 8
      },
      {
        "name": "User Preset 5",
        "channel": 8
      },
      {
        "name": "User Preset 6",
        "channel": 8
      },
      {
        "name": "User Preset 7",
        "channel": 8
      },
      {
        "name": "User Preset 8",
        "channel": 8
      },
      {
        "name": "Factory Preset 1",
        "channel": 8
      },
      {
        "name": "Factory Preset 2",
        "channel": 8
      },
      {
        "name": "Factory Preset 3",
        "channel": 8
      },
      {
        "name": "Factory Preset 4",
        "channel": 8
      },
      {
        "name": "Factory Preset 5",
        "channel": 8
      },
      {
        "name": "Factory Preset 6",
        "channel": 8
      },
      {
        "name": "Factory Preset 7",
        "channel": 8
      },
      {
        "name": "Factory Preset 8",
        "channel": 8
      }
    ],
    "quickSysEx": [
      {
        "label": "Request Template 1 Dump",
        "bytes": "F0 00 20 29 02 11 77 00 F7"
      }
    ]
  },
  {
    "id": "novation_launchpad_mk2",
    "name": "Launchpad MK2",
    "manufacturer": "Novation",
    "icon": "🟩",
    "color": "#27ae60",
    "midiName": [
      "Launchpad MK2",
      "Launchpad"
    ],
    "sysex": true,
    "presets": 3,
    "description": "The iconic 8x8 RGB grid controller with scene launch and control buttons",
    "controls": {
      "pads": [
        {
          "id": "pad_0_0",
          "label": "R1 C1",
          "note": 81,
          "cc": 81,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_1",
          "label": "R1 C2",
          "note": 82,
          "cc": 82,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_2",
          "label": "R1 C3",
          "note": 83,
          "cc": 83,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_3",
          "label": "R1 C4",
          "note": 84,
          "cc": 84,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_4",
          "label": "R1 C5",
          "note": 85,
          "cc": 85,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_5",
          "label": "R1 C6",
          "note": 86,
          "cc": 86,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_6",
          "label": "R1 C7",
          "note": 87,
          "cc": 87,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_7",
          "label": "R1 C8",
          "note": 88,
          "cc": 88,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_0",
          "label": "R2 C1",
          "note": 71,
          "cc": 71,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_1",
          "label": "R2 C2",
          "note": 72,
          "cc": 72,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_2",
          "label": "R2 C3",
          "note": 73,
          "cc": 73,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_3",
          "label": "R2 C4",
          "note": 74,
          "cc": 74,
          "pc": 11,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_4",
          "label": "R2 C5",
          "note": 75,
          "cc": 75,
          "pc": 12,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_5",
          "label": "R2 C6",
          "note": 76,
          "cc": 76,
          "pc": 13,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_6",
          "label": "R2 C7",
          "note": 77,
          "cc": 77,
          "pc": 14,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_7",
          "label": "R2 C8",
          "note": 78,
          "cc": 78,
          "pc": 15,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_0",
          "label": "R3 C1",
          "note": 61,
          "cc": 61,
          "pc": 16,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_1",
          "label": "R3 C2",
          "note": 62,
          "cc": 62,
          "pc": 17,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_2",
          "label": "R3 C3",
          "note": 63,
          "cc": 63,
          "pc": 18,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_3",
          "label": "R3 C4",
          "note": 64,
          "cc": 64,
          "pc": 19,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_4",
          "label": "R3 C5",
          "note": 65,
          "cc": 65,
          "pc": 20,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_5",
          "label": "R3 C6",
          "note": 66,
          "cc": 66,
          "pc": 21,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_6",
          "label": "R3 C7",
          "note": 67,
          "cc": 67,
          "pc": 22,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_7",
          "label": "R3 C8",
          "note": 68,
          "cc": 68,
          "pc": 23,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_0",
          "label": "R4 C1",
          "note": 51,
          "cc": 51,
          "pc": 24,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_1",
          "label": "R4 C2",
          "note": 52,
          "cc": 52,
          "pc": 25,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_2",
          "label": "R4 C3",
          "note": 53,
          "cc": 53,
          "pc": 26,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_3",
          "label": "R4 C4",
          "note": 54,
          "cc": 54,
          "pc": 27,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_4",
          "label": "R4 C5",
          "note": 55,
          "cc": 55,
          "pc": 28,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_5",
          "label": "R4 C6",
          "note": 56,
          "cc": 56,
          "pc": 29,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_6",
          "label": "R4 C7",
          "note": 57,
          "cc": 57,
          "pc": 30,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_7",
          "label": "R4 C8",
          "note": 58,
          "cc": 58,
          "pc": 31,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_0",
          "label": "R5 C1",
          "note": 41,
          "cc": 41,
          "pc": 32,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_1",
          "label": "R5 C2",
          "note": 42,
          "cc": 42,
          "pc": 33,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_2",
          "label": "R5 C3",
          "note": 43,
          "cc": 43,
          "pc": 34,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_3",
          "label": "R5 C4",
          "note": 44,
          "cc": 44,
          "pc": 35,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_4",
          "label": "R5 C5",
          "note": 45,
          "cc": 45,
          "pc": 36,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_5",
          "label": "R5 C6",
          "note": 46,
          "cc": 46,
          "pc": 37,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_6",
          "label": "R5 C7",
          "note": 47,
          "cc": 47,
          "pc": 38,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_7",
          "label": "R5 C8",
          "note": 48,
          "cc": 48,
          "pc": 39,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_0",
          "label": "R6 C1",
          "note": 31,
          "cc": 31,
          "pc": 40,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_1",
          "label": "R6 C2",
          "note": 32,
          "cc": 32,
          "pc": 41,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_2",
          "label": "R6 C3",
          "note": 33,
          "cc": 33,
          "pc": 42,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_3",
          "label": "R6 C4",
          "note": 34,
          "cc": 34,
          "pc": 43,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_4",
          "label": "R6 C5",
          "note": 35,
          "cc": 35,
          "pc": 44,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_5",
          "label": "R6 C6",
          "note": 36,
          "cc": 36,
          "pc": 45,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_6",
          "label": "R6 C7",
          "note": 37,
          "cc": 37,
          "pc": 46,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_7",
          "label": "R6 C8",
          "note": 38,
          "cc": 38,
          "pc": 47,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_0",
          "label": "R7 C1",
          "note": 21,
          "cc": 21,
          "pc": 48,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_1",
          "label": "R7 C2",
          "note": 22,
          "cc": 22,
          "pc": 49,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_2",
          "label": "R7 C3",
          "note": 23,
          "cc": 23,
          "pc": 50,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_3",
          "label": "R7 C4",
          "note": 24,
          "cc": 24,
          "pc": 51,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_4",
          "label": "R7 C5",
          "note": 25,
          "cc": 25,
          "pc": 52,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_5",
          "label": "R7 C6",
          "note": 26,
          "cc": 26,
          "pc": 53,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_6",
          "label": "R7 C7",
          "note": 27,
          "cc": 27,
          "pc": 54,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_7",
          "label": "R7 C8",
          "note": 28,
          "cc": 28,
          "pc": 55,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_0",
          "label": "R8 C1",
          "note": 11,
          "cc": 11,
          "pc": 56,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_1",
          "label": "R8 C2",
          "note": 12,
          "cc": 12,
          "pc": 57,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_2",
          "label": "R8 C3",
          "note": 13,
          "cc": 13,
          "pc": 58,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_3",
          "label": "R8 C4",
          "note": 14,
          "cc": 14,
          "pc": 59,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_4",
          "label": "R8 C5",
          "note": 15,
          "cc": 15,
          "pc": 60,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_5",
          "label": "R8 C6",
          "note": 16,
          "cc": 16,
          "pc": 61,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_6",
          "label": "R8 C7",
          "note": 17,
          "cc": 17,
          "pc": 62,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_7",
          "label": "R8 C8",
          "note": 18,
          "cc": 18,
          "pc": 63,
          "mode": "Momentary"
        }
      ],
      "knobs": [],
      "faders": [],
      "buttons": [
        {
          "id": "btn_up",
          "label": "Up",
          "cc": 104,
          "color": "amber"
        },
        {
          "id": "btn_down",
          "label": "Down",
          "cc": 105,
          "color": "amber"
        },
        {
          "id": "btn_left",
          "label": "Left",
          "cc": 106,
          "color": "amber"
        },
        {
          "id": "btn_right",
          "label": "Right",
          "cc": 107,
          "color": "amber"
        },
        {
          "id": "btn_session",
          "label": "Session",
          "cc": 108,
          "color": "green"
        },
        {
          "id": "btn_user1",
          "label": "User 1",
          "cc": 109,
          "color": "green"
        },
        {
          "id": "btn_user2",
          "label": "User 2",
          "cc": 110,
          "color": "green"
        },
        {
          "id": "btn_mixer",
          "label": "Mixer",
          "cc": 111,
          "color": "green"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Session Mode (Layout 0)",
        "channel": 0
      },
      {
        "name": "User 1 / Drum Mode (Layout 1)",
        "channel": 0
      },
      {
        "name": "User 2 Mode (Layout 2)",
        "channel": 0
      }
    ],
    "quickSysEx": [
      {
        "label": "Switch to Session Mode",
        "bytes": "F0 00 20 29 02 18 22 00 F7"
      },
      {
        "label": "Switch to User 1 Mode",
        "bytes": "F0 00 20 29 02 18 22 01 F7"
      },
      {
        "label": "Switch to User 2 Mode",
        "bytes": "F0 00 20 29 02 18 22 02 F7"
      },
      {
        "label": "Reset Grid LEDs",
        "bytes": "F0 00 20 29 02 18 0E 00 F7"
      }
    ]
  },
  {
    "id": "novation_launchpad_pro",
    "name": "Launchpad Pro",
    "manufacturer": "Novation",
    "icon": "🟩",
    "color": "#16a085",
    "midiName": [
      "Launchpad Pro",
      "LP Pro"
    ],
    "sysex": true,
    "presets": 4,
    "description": "Professional 64-pad velocity & poly-aftertouch performance grid with dedicated navigation",
    "controls": {
      "pads": [
        {
          "id": "pad_0_0",
          "label": "Pad 1:1",
          "note": 81,
          "cc": 81,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_1",
          "label": "Pad 1:2",
          "note": 82,
          "cc": 82,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_2",
          "label": "Pad 1:3",
          "note": 83,
          "cc": 83,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_3",
          "label": "Pad 1:4",
          "note": 84,
          "cc": 84,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_4",
          "label": "Pad 1:5",
          "note": 85,
          "cc": 85,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_5",
          "label": "Pad 1:6",
          "note": 86,
          "cc": 86,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_6",
          "label": "Pad 1:7",
          "note": 87,
          "cc": 87,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad_0_7",
          "label": "Pad 1:8",
          "note": 88,
          "cc": 88,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_0",
          "label": "Pad 2:1",
          "note": 71,
          "cc": 71,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_1",
          "label": "Pad 2:2",
          "note": 72,
          "cc": 72,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_2",
          "label": "Pad 2:3",
          "note": 73,
          "cc": 73,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_3",
          "label": "Pad 2:4",
          "note": 74,
          "cc": 74,
          "pc": 11,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_4",
          "label": "Pad 2:5",
          "note": 75,
          "cc": 75,
          "pc": 12,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_5",
          "label": "Pad 2:6",
          "note": 76,
          "cc": 76,
          "pc": 13,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_6",
          "label": "Pad 2:7",
          "note": 77,
          "cc": 77,
          "pc": 14,
          "mode": "Momentary"
        },
        {
          "id": "pad_1_7",
          "label": "Pad 2:8",
          "note": 78,
          "cc": 78,
          "pc": 15,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_0",
          "label": "Pad 3:1",
          "note": 61,
          "cc": 61,
          "pc": 16,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_1",
          "label": "Pad 3:2",
          "note": 62,
          "cc": 62,
          "pc": 17,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_2",
          "label": "Pad 3:3",
          "note": 63,
          "cc": 63,
          "pc": 18,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_3",
          "label": "Pad 3:4",
          "note": 64,
          "cc": 64,
          "pc": 19,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_4",
          "label": "Pad 3:5",
          "note": 65,
          "cc": 65,
          "pc": 20,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_5",
          "label": "Pad 3:6",
          "note": 66,
          "cc": 66,
          "pc": 21,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_6",
          "label": "Pad 3:7",
          "note": 67,
          "cc": 67,
          "pc": 22,
          "mode": "Momentary"
        },
        {
          "id": "pad_2_7",
          "label": "Pad 3:8",
          "note": 68,
          "cc": 68,
          "pc": 23,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_0",
          "label": "Pad 4:1",
          "note": 51,
          "cc": 51,
          "pc": 24,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_1",
          "label": "Pad 4:2",
          "note": 52,
          "cc": 52,
          "pc": 25,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_2",
          "label": "Pad 4:3",
          "note": 53,
          "cc": 53,
          "pc": 26,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_3",
          "label": "Pad 4:4",
          "note": 54,
          "cc": 54,
          "pc": 27,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_4",
          "label": "Pad 4:5",
          "note": 55,
          "cc": 55,
          "pc": 28,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_5",
          "label": "Pad 4:6",
          "note": 56,
          "cc": 56,
          "pc": 29,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_6",
          "label": "Pad 4:7",
          "note": 57,
          "cc": 57,
          "pc": 30,
          "mode": "Momentary"
        },
        {
          "id": "pad_3_7",
          "label": "Pad 4:8",
          "note": 58,
          "cc": 58,
          "pc": 31,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_0",
          "label": "Pad 5:1",
          "note": 41,
          "cc": 41,
          "pc": 32,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_1",
          "label": "Pad 5:2",
          "note": 42,
          "cc": 42,
          "pc": 33,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_2",
          "label": "Pad 5:3",
          "note": 43,
          "cc": 43,
          "pc": 34,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_3",
          "label": "Pad 5:4",
          "note": 44,
          "cc": 44,
          "pc": 35,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_4",
          "label": "Pad 5:5",
          "note": 45,
          "cc": 45,
          "pc": 36,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_5",
          "label": "Pad 5:6",
          "note": 46,
          "cc": 46,
          "pc": 37,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_6",
          "label": "Pad 5:7",
          "note": 47,
          "cc": 47,
          "pc": 38,
          "mode": "Momentary"
        },
        {
          "id": "pad_4_7",
          "label": "Pad 5:8",
          "note": 48,
          "cc": 48,
          "pc": 39,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_0",
          "label": "Pad 6:1",
          "note": 31,
          "cc": 31,
          "pc": 40,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_1",
          "label": "Pad 6:2",
          "note": 32,
          "cc": 32,
          "pc": 41,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_2",
          "label": "Pad 6:3",
          "note": 33,
          "cc": 33,
          "pc": 42,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_3",
          "label": "Pad 6:4",
          "note": 34,
          "cc": 34,
          "pc": 43,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_4",
          "label": "Pad 6:5",
          "note": 35,
          "cc": 35,
          "pc": 44,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_5",
          "label": "Pad 6:6",
          "note": 36,
          "cc": 36,
          "pc": 45,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_6",
          "label": "Pad 6:7",
          "note": 37,
          "cc": 37,
          "pc": 46,
          "mode": "Momentary"
        },
        {
          "id": "pad_5_7",
          "label": "Pad 6:8",
          "note": 38,
          "cc": 38,
          "pc": 47,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_0",
          "label": "Pad 7:1",
          "note": 21,
          "cc": 21,
          "pc": 48,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_1",
          "label": "Pad 7:2",
          "note": 22,
          "cc": 22,
          "pc": 49,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_2",
          "label": "Pad 7:3",
          "note": 23,
          "cc": 23,
          "pc": 50,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_3",
          "label": "Pad 7:4",
          "note": 24,
          "cc": 24,
          "pc": 51,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_4",
          "label": "Pad 7:5",
          "note": 25,
          "cc": 25,
          "pc": 52,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_5",
          "label": "Pad 7:6",
          "note": 26,
          "cc": 26,
          "pc": 53,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_6",
          "label": "Pad 7:7",
          "note": 27,
          "cc": 27,
          "pc": 54,
          "mode": "Momentary"
        },
        {
          "id": "pad_6_7",
          "label": "Pad 7:8",
          "note": 28,
          "cc": 28,
          "pc": 55,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_0",
          "label": "Pad 8:1",
          "note": 11,
          "cc": 11,
          "pc": 56,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_1",
          "label": "Pad 8:2",
          "note": 12,
          "cc": 12,
          "pc": 57,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_2",
          "label": "Pad 8:3",
          "note": 13,
          "cc": 13,
          "pc": 58,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_3",
          "label": "Pad 8:4",
          "note": 14,
          "cc": 14,
          "pc": 59,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_4",
          "label": "Pad 8:5",
          "note": 15,
          "cc": 15,
          "pc": 60,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_5",
          "label": "Pad 8:6",
          "note": 16,
          "cc": 16,
          "pc": 61,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_6",
          "label": "Pad 8:7",
          "note": 17,
          "cc": 17,
          "pc": 62,
          "mode": "Momentary"
        },
        {
          "id": "pad_7_7",
          "label": "Pad 8:8",
          "note": 18,
          "cc": 18,
          "pc": 63,
          "mode": "Momentary"
        }
      ],
      "knobs": [],
      "faders": [],
      "buttons": [
        {
          "id": "btn_shift",
          "label": "Shift",
          "note": 80,
          "color": "amber"
        },
        {
          "id": "btn_click",
          "label": "Click",
          "note": 70,
          "color": "green"
        },
        {
          "id": "btn_undo",
          "label": "Undo",
          "note": 60,
          "color": "green"
        },
        {
          "id": "btn_delete",
          "label": "Delete",
          "note": 50,
          "color": "red"
        },
        {
          "id": "btn_quantise",
          "label": "Quantise",
          "note": 40,
          "color": "green"
        },
        {
          "id": "btn_duplicate",
          "label": "Duplicate",
          "note": 30,
          "color": "green"
        },
        {
          "id": "btn_double",
          "label": "Double",
          "note": 20,
          "color": "green"
        },
        {
          "id": "btn_record",
          "label": "Record",
          "note": 10,
          "color": "red"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Live Session Mode",
        "channel": 0
      },
      {
        "name": "Standalone Note Mode",
        "channel": 0
      },
      {
        "name": "Device Fader / Macro Mode",
        "channel": 0
      },
      {
        "name": "Programmer Mode",
        "channel": 0
      }
    ],
    "quickSysEx": [
      {
        "label": "Enter Programmer Mode",
        "bytes": "F0 00 20 29 02 10 2C 03 F7"
      },
      {
        "label": "Enter Standalone Note Mode",
        "bytes": "F0 00 20 29 02 10 2C 01 F7"
      }
    ]
  },
  {
    "id": "djtech_kontrol_one",
    "name": "Kontrol One",
    "manufacturer": "DJ-Tech",
    "icon": "🎧",
    "color": "#0288d1",
    "midiName": [
      "Kontrol One",
      "DJ-Tech Kontrol One"
    ],
    "sysex": false,
    "presets": 4,
    "description": "Modular USB DJ controller with FX knobs, scratch jogwheel, loop encoder & deck switches",
    "controls": {
      "pads": [
        {
          "id": "cue1",
          "label": "Hot Cue 1",
          "note": 60,
          "cc": 60,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "cue2",
          "label": "Hot Cue 2",
          "note": 61,
          "cc": 61,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "cue3",
          "label": "Hot Cue 3",
          "note": 62,
          "cc": 62,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "cue4",
          "label": "Hot Cue 4",
          "note": 63,
          "cc": 63,
          "pc": 3,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "fx1",
          "label": "FX 1",
          "cc": 16,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "fx2",
          "label": "FX 2",
          "cc": 17,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "fx3",
          "label": "FX 3",
          "cc": 18,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "fx_drywet",
          "label": "Dry / Wet",
          "cc": 19,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "enc_browse",
          "label": "Browse / Loop",
          "cc": 20,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "jog_wheel",
          "label": "Jog Wheel",
          "cc": 21,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [
        {
          "id": "pitch_fdr",
          "label": "Tempo Pitch Fader",
          "cc": 7
        }
      ],
      "buttons": [
        {
          "id": "btn_fx1",
          "label": "FX 1 On",
          "note": 48,
          "color": "green"
        },
        {
          "id": "btn_fx2",
          "label": "FX 2 On",
          "note": 49,
          "color": "green"
        },
        {
          "id": "btn_fx3",
          "label": "FX 3 On",
          "note": 50,
          "color": "green"
        },
        {
          "id": "btn_fx4",
          "label": "FX 4 On",
          "note": 51,
          "color": "green"
        },
        {
          "id": "btn_play",
          "label": "Play / Pause",
          "note": 64,
          "color": "green"
        },
        {
          "id": "btn_cue",
          "label": "Cue",
          "note": 65,
          "color": "amber"
        },
        {
          "id": "btn_sync",
          "label": "Sync",
          "note": 66,
          "color": "green"
        },
        {
          "id": "btn_tap",
          "label": "Tap Tempo",
          "note": 67,
          "color": "amber"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Deck A",
        "channel": 0
      },
      {
        "name": "Deck B",
        "channel": 1
      },
      {
        "name": "Deck C",
        "channel": 2
      },
      {
        "name": "Deck D",
        "channel": 3
      }
    ],
    "quickSysEx": []
  },
  {
    "id": "roland_tr8s",
    "name": "TR-8S Rhythm Performer",
    "manufacturer": "Roland",
    "icon": "🥁",
    "color": "#2e7d32",
    "midiName": [
      "TR-8S",
      "Roland TR-8S"
    ],
    "sysex": true,
    "presets": 16,
    "description": "11 instrument channels with dedicated Tune, Decay, CTRL knobs, Level faders & 16 TR-REC step pads",
    "controls": {
      "pads": [
        {
          "id": "step_bd",
          "label": "BD Pad",
          "note": 36,
          "cc": 20,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "step_sd",
          "label": "SD Pad",
          "note": 38,
          "cc": 28,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "step_lt",
          "label": "LT Pad",
          "note": 41,
          "cc": 36,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "step_mt",
          "label": "MT Pad",
          "note": 45,
          "cc": 44,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "step_ht",
          "label": "HT Pad",
          "note": 48,
          "cc": 52,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "step_rs",
          "label": "RS Pad",
          "note": 37,
          "cc": 60,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "step_hc",
          "label": "HC Pad",
          "note": 39,
          "cc": 68,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "step_ch",
          "label": "CH Pad",
          "note": 42,
          "cc": 76,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "step_oh",
          "label": "OH Pad",
          "note": 46,
          "cc": 84,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "step_cc",
          "label": "CC Pad",
          "note": 49,
          "cc": 92,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "step_rc",
          "label": "RC Pad",
          "note": 51,
          "cc": 100,
          "pc": 10,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "tune_bd",
          "label": "BD Tune",
          "cc": 20,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "decay_bd",
          "label": "BD Decay",
          "cc": 23,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ctrl_bd",
          "label": "BD CTRL",
          "cc": 96,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "tune_sd",
          "label": "SD Tune",
          "cc": 28,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "decay_sd",
          "label": "SD Decay",
          "cc": 31,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ctrl_sd",
          "label": "SD CTRL",
          "cc": 97,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "delay_lvl",
          "label": "Delay Level",
          "cc": 16,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "reverb_lvl",
          "label": "Reverb Level",
          "cc": 91,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "master_fx",
          "label": "Master FX CTRL",
          "cc": 19,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "accent_lvl",
          "label": "Accent Level",
          "cc": 71,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [
        {
          "id": "fdr_bd",
          "label": "BD Level",
          "cc": 24
        },
        {
          "id": "fdr_sd",
          "label": "SD Level",
          "cc": 32
        },
        {
          "id": "fdr_lt",
          "label": "LT Level",
          "cc": 40
        },
        {
          "id": "fdr_mt",
          "label": "MT Level",
          "cc": 48
        },
        {
          "id": "fdr_ht",
          "label": "HT Level",
          "cc": 56
        },
        {
          "id": "fdr_rs",
          "label": "RS Level",
          "cc": 64
        },
        {
          "id": "fdr_hc",
          "label": "HC Level",
          "cc": 72
        },
        {
          "id": "fdr_ch",
          "label": "CH Level",
          "cc": 80
        },
        {
          "id": "fdr_oh",
          "label": "OH Level",
          "cc": 88
        },
        {
          "id": "fdr_cc",
          "label": "CC Level",
          "cc": 94
        },
        {
          "id": "fdr_rc",
          "label": "RC Level",
          "cc": 101
        }
      ],
      "buttons": [
        {
          "id": "btn_autofill",
          "label": "Auto Fill-In",
          "cc": 14,
          "color": "amber"
        },
        {
          "id": "btn_master_fx",
          "label": "Master FX On",
          "cc": 15,
          "color": "green"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Kit 1 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 2 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 3 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 4 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 5 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 6 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 7 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 8 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 9 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 10 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 11 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 12 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 13 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 14 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 15 (808/909)",
        "channel": 9
      },
      {
        "name": "Kit 16 (808/909)",
        "channel": 9
      }
    ],
    "quickSysEx": [
      {
        "label": "Roland Identity Inquiry",
        "bytes": "F0 7E 10 06 01 F7"
      },
      {
        "label": "Kit Parameters Request",
        "bytes": "F0 41 10 00 00 00 4B 11 00 00 00 00 00 00 01 00 7F F7"
      }
    ]
  },
  {
    "id": "roland_sp404_mk1",
    "name": "SP-404 / SX / A",
    "manufacturer": "Roland",
    "icon": "📼",
    "color": "#546e7a",
    "midiName": [
      "SP-404",
      "SP-404SX",
      "SP-404A"
    ],
    "sysex": true,
    "presets": 10,
    "description": "12 sample trigger pads, 3 top control knobs for realtime Vinyl Sim and multi-effects",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 48,
          "cc": 1,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 49,
          "cc": 2,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 50,
          "cc": 3,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 51,
          "cc": 4,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 52,
          "cc": 5,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 53,
          "cc": 6,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 54,
          "cc": 7,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 55,
          "cc": 8,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad9",
          "label": "Pad 9",
          "note": 56,
          "cc": 9,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad10",
          "label": "Pad 10",
          "note": 57,
          "cc": 10,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad11",
          "label": "Pad 11",
          "note": 58,
          "cc": 11,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad12",
          "label": "Pad 12",
          "note": 59,
          "cc": 12,
          "pc": 11,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "ctrl1",
          "label": "CTRL 1 (Cutoff)",
          "cc": 16,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ctrl2",
          "label": "CTRL 2 (Resonance)",
          "cc": 17,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ctrl3",
          "label": "CTRL 3 (Balance)",
          "cc": 18,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": [
        {
          "id": "btn_hold",
          "label": "Hold",
          "note": 60,
          "color": "amber"
        },
        {
          "id": "btn_ext_src",
          "label": "External Source",
          "note": 35,
          "color": "green"
        },
        {
          "id": "btn_subpad",
          "label": "Sub Pad",
          "note": 61,
          "color": "amber"
        },
        {
          "id": "btn_pattern",
          "label": "Pattern Select",
          "note": 62,
          "color": "green"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Bank A (Ch 1)",
        "channel": 0
      },
      {
        "name": "Bank B (Ch 1)",
        "channel": 0
      },
      {
        "name": "Bank C (Ch 2)",
        "channel": 1
      },
      {
        "name": "Bank D (Ch 2)",
        "channel": 1
      },
      {
        "name": "Bank E (Ch 3)",
        "channel": 2
      },
      {
        "name": "Bank F (Ch 3)",
        "channel": 2
      },
      {
        "name": "Bank G (Ch 4)",
        "channel": 3
      },
      {
        "name": "Bank H (Ch 4)",
        "channel": 3
      },
      {
        "name": "Bank I (Ch 5)",
        "channel": 4
      },
      {
        "name": "Bank J (Ch 5)",
        "channel": 4
      }
    ],
    "quickSysEx": [
      {
        "label": "Universal Inquiry",
        "bytes": "F0 7E 7F 06 01 F7"
      }
    ]
  },
  {
    "id": "roland_sp404_mk2",
    "name": "SP-404MKII",
    "manufacturer": "Roland",
    "icon": "🎚️",
    "color": "#37474f",
    "midiName": [
      "SP-404MKII",
      "Roland SP-404MKII"
    ],
    "sysex": true,
    "presets": 10,
    "description": "16 velocity-sensitive pads, 3 top control knobs + value push encoder, dual bus FX routing",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 48,
          "cc": 20,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 49,
          "cc": 21,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 50,
          "cc": 22,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 51,
          "cc": 23,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 44,
          "cc": 24,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 45,
          "cc": 25,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 46,
          "cc": 26,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 47,
          "cc": 27,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad9",
          "label": "Pad 9",
          "note": 40,
          "cc": 28,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad10",
          "label": "Pad 10",
          "note": 41,
          "cc": 29,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad11",
          "label": "Pad 11",
          "note": 42,
          "cc": 30,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad12",
          "label": "Pad 12",
          "note": 43,
          "cc": 31,
          "pc": 11,
          "mode": "Momentary"
        },
        {
          "id": "pad13",
          "label": "Pad 13",
          "note": 36,
          "cc": 32,
          "pc": 12,
          "mode": "Momentary"
        },
        {
          "id": "pad14",
          "label": "Pad 14",
          "note": 37,
          "cc": 33,
          "pc": 13,
          "mode": "Momentary"
        },
        {
          "id": "pad15",
          "label": "Pad 15",
          "note": 38,
          "cc": 34,
          "pc": 14,
          "mode": "Momentary"
        },
        {
          "id": "pad16",
          "label": "Pad 16",
          "note": 39,
          "cc": 35,
          "pc": 15,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "value_enc",
          "label": "Value / Push",
          "cc": 14,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ctrl1",
          "label": "CTRL 1 (FX)",
          "cc": 16,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ctrl2",
          "label": "CTRL 2 (FX)",
          "cc": 17,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "ctrl3",
          "label": "CTRL 3 (FX)",
          "cc": 18,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [
        {
          "id": "xfade",
          "label": "X-Fade / Balance",
          "cc": 8
        },
        {
          "id": "ch_vol",
          "label": "Channel Volume",
          "cc": 7
        }
      ],
      "buttons": [
        {
          "id": "btn_bus1_efx",
          "label": "BUS 1 EFX On/Off",
          "cc": 19,
          "color": "green"
        },
        {
          "id": "btn_bus2_efx",
          "label": "BUS 2 EFX On/Off",
          "cc": 80,
          "color": "green"
        },
        {
          "id": "btn_bpm_plus",
          "label": "BPM +",
          "cc": 26,
          "color": "amber"
        },
        {
          "id": "btn_bpm_minus",
          "label": "BPM -",
          "cc": 27,
          "color": "amber"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Bank A (Ch 1)",
        "channel": 0
      },
      {
        "name": "Bank B (Ch 2)",
        "channel": 1
      },
      {
        "name": "Bank C (Ch 3)",
        "channel": 2
      },
      {
        "name": "Bank D (Ch 4)",
        "channel": 3
      },
      {
        "name": "Bank E (Ch 5)",
        "channel": 4
      },
      {
        "name": "Bank F (Ch 6)",
        "channel": 5
      },
      {
        "name": "Bank G (Ch 7)",
        "channel": 6
      },
      {
        "name": "Bank H (Ch 8)",
        "channel": 7
      },
      {
        "name": "Bank I (Ch 9)",
        "channel": 8
      },
      {
        "name": "Bank J (Ch 10)",
        "channel": 9
      }
    ],
    "quickSysEx": [
      {
        "label": "SP-404MKII Identity Request",
        "bytes": "F0 7E 10 06 01 F7"
      },
      {
        "label": "Set Bus 4 303 VinylSim",
        "bytes": "B3 53 01"
      }
    ]
  },
  {
    "id": "roland_sp404_mk3",
    "name": "SP-404MK3 (Studio Sampler)",
    "manufacturer": "Roland",
    "icon": "🎛️",
    "color": "#212121",
    "midiName": [
      "SP-404MK3",
      "SP-404 Studio"
    ],
    "sysex": true,
    "presets": 12,
    "description": "Extended studio sampler architecture: 16 expressive pads, 6 multi-FX macro encoders, dual crossfaders",
    "controls": {
      "pads": [
        {
          "id": "pad1",
          "label": "Pad 1",
          "note": 36,
          "cc": 20,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "pad2",
          "label": "Pad 2",
          "note": 37,
          "cc": 21,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "pad3",
          "label": "Pad 3",
          "note": 38,
          "cc": 22,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "pad4",
          "label": "Pad 4",
          "note": 39,
          "cc": 23,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "pad5",
          "label": "Pad 5",
          "note": 40,
          "cc": 24,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "pad6",
          "label": "Pad 6",
          "note": 41,
          "cc": 25,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "pad7",
          "label": "Pad 7",
          "note": 42,
          "cc": 26,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "pad8",
          "label": "Pad 8",
          "note": 43,
          "cc": 27,
          "pc": 7,
          "mode": "Momentary"
        },
        {
          "id": "pad9",
          "label": "Pad 9",
          "note": 44,
          "cc": 28,
          "pc": 8,
          "mode": "Momentary"
        },
        {
          "id": "pad10",
          "label": "Pad 10",
          "note": 45,
          "cc": 29,
          "pc": 9,
          "mode": "Momentary"
        },
        {
          "id": "pad11",
          "label": "Pad 11",
          "note": 46,
          "cc": 30,
          "pc": 10,
          "mode": "Momentary"
        },
        {
          "id": "pad12",
          "label": "Pad 12",
          "note": 47,
          "cc": 31,
          "pc": 11,
          "mode": "Momentary"
        },
        {
          "id": "pad13",
          "label": "Pad 13",
          "note": 48,
          "cc": 32,
          "pc": 12,
          "mode": "Momentary"
        },
        {
          "id": "pad14",
          "label": "Pad 14",
          "note": 49,
          "cc": 33,
          "pc": 13,
          "mode": "Momentary"
        },
        {
          "id": "pad15",
          "label": "Pad 15",
          "note": 50,
          "cc": 34,
          "pc": 14,
          "mode": "Momentary"
        },
        {
          "id": "pad16",
          "label": "Pad 16",
          "note": 51,
          "cc": 35,
          "pc": 15,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "macro1",
          "label": "Macro 1 (Filter)",
          "cc": 16,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "macro2",
          "label": "Macro 2 (Reso)",
          "cc": 17,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "macro3",
          "label": "Macro 3 (Tape/Vinyl)",
          "cc": 18,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "macro4",
          "label": "Macro 4 (Delay)",
          "cc": 19,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "macro5",
          "label": "Macro 5 (Reverb)",
          "cc": 20,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "macro6",
          "label": "Macro 6 (Comp)",
          "cc": 21,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [
        {
          "id": "fdr_xfade",
          "label": "Master Crossfader",
          "cc": 8
        },
        {
          "id": "fdr_master",
          "label": "Master Level",
          "cc": 7
        }
      ],
      "buttons": [
        {
          "id": "btn_chromatic",
          "label": "Chromatic",
          "note": 88,
          "color": "green"
        },
        {
          "id": "btn_slice",
          "label": "Slice Mode",
          "note": 89,
          "color": "amber"
        },
        {
          "id": "btn_poly",
          "label": "Polyphonic",
          "note": 90,
          "color": "green"
        },
        {
          "id": "btn_mutegroup",
          "label": "Mute Group",
          "note": 91,
          "color": "red"
        },
        {
          "id": "btn_resample",
          "label": "Resample",
          "note": 92,
          "color": "amber"
        },
        {
          "id": "btn_loop",
          "label": "DJ Looper",
          "note": 93,
          "color": "green"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Bank A (Ch 1)",
        "channel": 0
      },
      {
        "name": "Bank B (Ch 2)",
        "channel": 1
      },
      {
        "name": "Bank C (Ch 3)",
        "channel": 2
      },
      {
        "name": "Bank D (Ch 4)",
        "channel": 3
      },
      {
        "name": "Bank E (Ch 5)",
        "channel": 4
      },
      {
        "name": "Bank F (Ch 6)",
        "channel": 5
      },
      {
        "name": "Bank G (Ch 7)",
        "channel": 6
      },
      {
        "name": "Bank H (Ch 8)",
        "channel": 7
      },
      {
        "name": "Bank I (Ch 9)",
        "channel": 8
      },
      {
        "name": "Bank J (Ch 10)",
        "channel": 9
      },
      {
        "name": "Bank K (Ch 11)",
        "channel": 10
      },
      {
        "name": "Bank L (Ch 12)",
        "channel": 11
      }
    ],
    "quickSysEx": [
      {
        "label": "Studio Identity Inquiry",
        "bytes": "F0 7E 10 06 01 F7"
      }
    ]
  },
  {
    "id": "behringer_edge",
    "name": "Edge Percussion Synthesizer",
    "manufacturer": "Behringer",
    "icon": "⚡",
    "color": "#d81b60",
    "midiName": [
      "Edge",
      "Behringer Edge"
    ],
    "sysex": true,
    "presets": 8,
    "description": "Analog semi-modular percussion synthesizer with dual 8-step sequencer, filter modulation & MIDI clock sync",
    "controls": {
      "pads": [
        {
          "id": "step1",
          "label": "Step 1",
          "note": 60,
          "cc": 16,
          "pc": 0,
          "mode": "Momentary"
        },
        {
          "id": "step2",
          "label": "Step 2",
          "note": 61,
          "cc": 17,
          "pc": 1,
          "mode": "Momentary"
        },
        {
          "id": "step3",
          "label": "Step 3",
          "note": 62,
          "cc": 18,
          "pc": 2,
          "mode": "Momentary"
        },
        {
          "id": "step4",
          "label": "Step 4",
          "note": 63,
          "cc": 19,
          "pc": 3,
          "mode": "Momentary"
        },
        {
          "id": "step5",
          "label": "Step 5",
          "note": 64,
          "cc": 20,
          "pc": 4,
          "mode": "Momentary"
        },
        {
          "id": "step6",
          "label": "Step 6",
          "note": 65,
          "cc": 21,
          "pc": 5,
          "mode": "Momentary"
        },
        {
          "id": "step7",
          "label": "Step 7",
          "note": 66,
          "cc": 22,
          "pc": 6,
          "mode": "Momentary"
        },
        {
          "id": "step8",
          "label": "Step 8",
          "note": 67,
          "cc": 23,
          "pc": 7,
          "mode": "Momentary"
        }
      ],
      "knobs": [
        {
          "id": "cutoff",
          "label": "VCF Cutoff",
          "cc": 74,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "resonance",
          "label": "VCF Reso",
          "cc": 71,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "vcf_decay",
          "label": "VCF Decay",
          "cc": 75,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "vca_decay",
          "label": "VCA Decay",
          "cc": 79,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "pitch_mod",
          "label": "Pitch Mod Depth",
          "cc": 76,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "noise_level",
          "label": "Pink Noise",
          "cc": 77,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "seq_pitch",
          "label": "Seq Pitch Mod",
          "cc": 1,
          "lo": 0,
          "hi": 127
        },
        {
          "id": "velocity_amt",
          "label": "Velocity Sens",
          "cc": 2,
          "lo": 0,
          "hi": 127
        }
      ],
      "faders": [],
      "buttons": [
        {
          "id": "btn_trigger",
          "label": "Trigger",
          "note": 36,
          "color": "red"
        },
        {
          "id": "btn_advance",
          "label": "Advance Step",
          "note": 37,
          "color": "green"
        },
        {
          "id": "btn_play",
          "label": "Play / Stop",
          "note": 108,
          "color": "green"
        }
      ]
    },
    "defaultPresets": [
      {
        "name": "Drum Synth Pattern 1",
        "channel": 0
      },
      {
        "name": "Aggressive Noise Hit",
        "channel": 0
      },
      {
        "name": "Acid Bassline Sequence",
        "channel": 0
      },
      {
        "name": "Industrial Polyrhythm",
        "channel": 0
      }
    ],
    "quickSysEx": [
      {
        "label": "Behringer Identity Request",
        "bytes": "F0 7E 7F 06 01 F7"
      }
    ]
  }
];

const DEVICE_MANIFEST = [
  'akai_lpd8_v1',
  'akai_midimix',
  'novation_launchcontrol_mk1',
  'novation_nocturn',
  'novation_remote_zero_sl_mk1',
  'novation_remote25_sl_compact_mk1',
  'ni_maschine_mikro_mk1',
  'ni_maschine_mikro_mk2',
  'ni_maschine_mikro_mk3',
  'ni_maschine_mk1',
  'ni_maschine_mk2',
  'ni_maschine_mk3',
  'novation_launchcontrol_xl_mk1',
  'novation_launchcontrol_xl_mk2',
  'novation_launchpad_mk2',
  'novation_launchpad_pro',
  'djtech_kontrol_one',
  'roland_tr8s',
  'roland_sp404_mk1',
  'roland_sp404_mk2',
  'roland_sp404_mk3',
  'behringer_edge'
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
window.State = State;
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

  
  // Merge built-in hardware definitions for complete offline guarantee
  if (typeof BUILTIN_HARDWARE_DEFINITIONS !== 'undefined' && Array.isArray(BUILTIN_HARDWARE_DEFINITIONS)) {
    BUILTIN_HARDWARE_DEFINITIONS.forEach(def => {
      if (!loaded.find(d => d.id === def.id)) {
        loaded.push(JSON.parse(JSON.stringify(def)));
      }
    });
  }
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
  window.renderSvgMapper?.();
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
    <button class="btn sm" onclick="openSysExInspector()" style="margin-left:4px;" data-tooltip="View received template dump data">🔍 SysEx Template Data</button>
    
    
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

function sendMidiOut(message) {
  const bytes = message instanceof Uint8Array
    ? message
    : Array.isArray(message)
      ? message
      : [message];

  if (!State.midiOut || typeof State.midiOut.send !== "function") {
    toast("No MIDI Out connected.", "error");
    return false;
  }

  try {
    State.midiOut.send(bytes);
    flashActivity("out");
    return true;
  } catch (error) {
    console.error("MIDI output failed:", error);
    toast(`MIDI output failed: ${error.message}`, "error");
    return false;
  }
}

window.sendMidiOut = sendMidiOut;

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
  setTimeout(() => { if (typeof renderClockUI==="function") renderClockUI(); }, 500);
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
  if (typeof window.animateFaceplateMidiActivity === 'function' && data && data.length >= 2) {
    window.animateFaceplateMidiActivity(data[0], data[1], data[2] ?? 0);
  }

  if (State.settings.thru && State.midiOut) sendMidiOut(data);

  
  if (window.mapperLearnMode && window.mapperLearnTarget && window.handleMapperMidiLearn) {
    if (window.handleMapperMidiLearn(data)) return;
  }

  if (_learnTarget) { handleMidiLearn(data); return; }

  const status = data[0];
  const type   = status >> 4;
  const ch     = status & 0x0F;

  // MIDI Clock — detect BPM
  if (status === 0xF8) { handleMidiClock(ts, event.target.id); return; }

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
  // Push to Template Importer Panel if visible or existing
  if (data.length > 8) { // Skip short pings
    const ta = document.getElementById('sysex-panel-textarea');
    if (ta) {
      let hex = '';
      data.forEach(b => hex += b.toString(16).padStart(2, '0').toUpperCase() + ' ');
      ta.value = hex.trim();
      if (typeof window.updateSysExPanelVisualizer === 'function') {
        window.updateSysExPanelVisualizer();
      }
    }
  }
  if (data[0] === 0xF0 && data[1] === 0x7E && data[3] === 0x06 && data[4] === 0x02) {
    if (window.pingStartTime) {
      const ms = Math.round(performance.now() - window.pingStartTime);
      const span = document.getElementById('ping-result');
      if (span) span.innerHTML = `Latency: <strong>${ms}ms</strong>`;
      window.pingStartTime = 0;
    }
  }


  // Novation Template Dump (Remote SL / Nocturn etc)
  if (data[0] === 0xF0 && data[1] === 0x00 && data[2] === 0x20 && data[3] === 0x29) {
    const dev = State.devices.find(d => d.id.includes('novation'));
    if (dev) {
      toast(`Received SysEx template from ${dev.name}`, 'success');
      const pn = data[7] || 0;
      if (!dev.defaultPresets[pn]) {
        dev.defaultPresets[pn] = { name: `SysEx Preset ${pn + 1}` };
      }
      dev.defaultPresets[pn].lastDump = Date.now();
      dev.defaultPresets[pn].sysexData = Array.from(data);
      save();
      if (typeof renderDeviceEditor === 'function') renderDeviceEditor();
      return;
    }
  }

  // Akai LPD8 preset dump: F0 47 7F 75 ... (could be 63 or 61)
  if (data[0]===0xF0 && data[1]===0x47 && data[2]===0x7F && data[3]===0x75) {
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
    return;
  }
  
  // Catch-all for unknown SysEx
  const dev = getActiveDev();
  if (dev) {
    const p = getActivePreset();
    if (p) {
      p.sysexData = Array.from(data);
      p.lastDump = Date.now();
      save();
      toast(`Captured ${data.length} bytes of SysEx data. Use Inspector to view.`, 'info');
    }
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
    sendMidiOut([0xF0, 0x47, 0x7F, 0x75, 0x61, 0x00, 0x01, pn, 0xF7]);
    toast(`Reading Preset ${pn} from LPD8…`, 'info');
  } else if (dev.id.includes('novation')) {
    // Novation Nocturn & Remote SL template dump request
    // Common Novation format: F0 00 20 29 [device_type] [command] ... F7
    // Using a generic template dump request for Novation
    const dumpReq = [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0A, 0x79, 0x00, 0xF7];
    sendMidiOut(dumpReq);
    toast(`Requested SysEx template dump from ${dev.name}…`, 'info');
  } else if (dev.dumpRequest) {
    const req = dev.dumpRequest.map(x => typeof x === 'string' ? parseInt(x, 16) : x);
    sendMidiOut(req);
    toast(`Requested SysEx dump for ${dev.name}…`, 'info');
  } else {
    toast(`No automatic read supported for ${dev.name}. Please trigger a SysEx template dump manually from the device hardware. You can capture it in the Monitor/SysEx panel.`, 'info');
  }
}

function writeToDevice() {
  const dev = getActiveDev(); if (!dev) return;
  if (!State.midiOut) { toast('No MIDI Out connected', 'error'); return; }
  if (dev.id === 'akai_lpd8_v1') {
    writeLPD8Preset();
  } else {
    toast(`No automatic write supported for ${dev.name}. You can export a SysEx dump or use the SysEx panel to send templates.`, 'info');
  }
}

undefined

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

function exportDeviceJSON(deviceId) {
  const dev = State.devices.find((item) => item.id === deviceId);

  if (!dev) {
    toast("Device not found.", "error");
    return;
  }

  const safeName = (dev.name || dev.id)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  downloadJSON(dev, `${safeName || "midicontrolz-device"}.json`);
  toast(`${dev.name} exported as JSON.`, "success");
}

function backupFiltered() {
  const checkedTags = Array.from(
    document.querySelectorAll(
      '#backup-tags-container input[type="checkbox"]:checked'
    )
  ).map((input) => input.value);

  const devices = checkedTags.length
    ? State.devices.filter((device) =>
        Array.isArray(device.tags) &&
        device.tags.some((tag) => checkedTags.includes(tag))
      )
    : State.devices;

  const data = {
    version: "2.12.0",
    exported: new Date().toISOString(),
    filterTags: checkedTags,
    devices: JSON.parse(JSON.stringify(devices)),
    backups: JSON.parse(JSON.stringify(State.backups))
  };

  downloadJSON(data, `midicontrolz-backup-${Date.now()}.json`);

  toast(
    checkedTags.length
      ? `Exported ${devices.length} filtered device(s).`
      : `Exported ${devices.length} device(s).`,
    "success"
  );
}

window.savePresetVersion = savePresetVersion;
window.exportDeviceJSON = exportDeviceJSON;

function exportDeviceSyx(deviceId) {
  const dev = State.devices.find((item) => item.id === deviceId);
  
  if (!dev) {
    toast("Device not found.", "error");
    return;
  }
  
  const safeName = (dev.name || dev.id)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
    
  const jsonStr = JSON.stringify(dev);
  const encoder = new TextDecoder(); // Wait, TextEncoder
  const textBytes = new TextEncoder().encode(jsonStr);
  
  // Make sure we only use valid MIDI data bytes (0-127) for the payload.
  // Actually, handleImportDevice just does TextDecoder().decode(), which expects normal bytes.
  // If the TextEncoder outputs bytes >= 128, they violate standard SysEx. 
  // Let's just create a Uint8Array: F0 7D ... textBytes ... F7
  const syx = new Uint8Array(textBytes.length + 3);
  syx[0] = 0xF0;
  syx[1] = 0x7D;
  syx.set(textBytes, 2);
  syx[syx.length - 1] = 0xF7;
  
  // Note: if textBytes has values >= 128 it's technically invalid MIDI but we save it as a file.
  
  const blob = new Blob([syx], { type: "application/octet-stream" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${safeName || "midicontrolz-device"}.syx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  toast(`${dev.name} exported as .syx`, "success");
}

window.exportDeviceSyx = exportDeviceSyx;

window.backupFiltered = backupFiltered;



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

function pingDevice() {
  if (!State.midiOut) {
    toast("Connect a MIDI Out port before pinging.", "error");
    return;
  }

  const result = document.getElementById("ping-result");

  try {
    window.pingStartTime = performance.now();

    // Universal Non-Realtime Identity Request:
    // F0 7E 7F 06 01 F7
    sendMidiOut([0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]);

    if (result) {
      result.textContent = "Ping sent — waiting for Identity Reply…";
    }

    window.clearTimeout(window.pingTimeout);
    window.pingTimeout = window.setTimeout(() => {
      if (!window.pingStartTime) return;

      window.pingStartTime = 0;

      if (result) {
        result.textContent =
          "No reply received. The device may not support MIDI Identity Request.";
      }
    }, 1500);
  } catch (error) {
    console.error("Device ping failed:", error);

    if (result) {
      result.textContent = `Ping failed: ${error.message}`;
    }

    toast(`Device ping failed: ${error.message}`, "error");
  }
}

window.pingDevice = pingDevice;

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

function savePresetVersion() {
  const dev = getActiveDev();
  const preset = getActivePreset();

  if (!dev || !preset) {
    toast("Select a device and preset first.", "error");
    return;
  }

  preset.history ??= [];

  const snapshot = JSON.parse(JSON.stringify({
    ...preset,
    history: undefined
  }));

  const nextVersion = Math.max(
    1,
    Number(preset.version || 1) + 1
  );

  preset.version = nextVersion;
  preset.history.unshift({
    version: nextVersion,
    timestamp: Date.now(),
    preset: snapshot
  });

  // Bound history so localStorage cannot grow without limit.
  preset.history = preset.history.slice(0, 50);

  save();
  renderDeviceEditor();
  toast(`Preset version ${nextVersion} saved.`, "success");
}

function exportDeviceJSON(deviceId) {
  const dev = State.devices.find((item) => item.id === deviceId);

  if (!dev) {
    toast("Device not found.", "error");
    return;
  }

  const safeName = (dev.name || dev.id)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  downloadJSON(dev, `${safeName || "midicontrolz-device"}.json`);
  toast(`${dev.name} exported as JSON.`, "success");
}

function backupFiltered() {
  const checkedTags = Array.from(
    document.querySelectorAll(
      '#backup-tags-container input[type="checkbox"]:checked'
    )
  ).map((input) => input.value);

  const devices = checkedTags.length
    ? State.devices.filter((device) =>
        Array.isArray(device.tags) &&
        device.tags.some((tag) => checkedTags.includes(tag))
      )
    : State.devices;

  const data = {
    version: "2.12.0",
    exported: new Date().toISOString(),
    filterTags: checkedTags,
    devices: JSON.parse(JSON.stringify(devices)),
    backups: JSON.parse(JSON.stringify(State.backups))
  };

  downloadJSON(data, `midicontrolz-backup-${Date.now()}.json`);

  toast(
    checkedTags.length
      ? `Exported ${devices.length} filtered device(s).`
      : `Exported ${devices.length} device(s).`,
    "success"
  );
}

window.savePresetVersion = savePresetVersion;
window.exportDeviceJSON = exportDeviceJSON;
window.backupFiltered = backupFiltered;

// ============================================================
//  DEVICE MANAGER
// ============================================================

function renderDeviceManager() {
  const grid = document.getElementById('device-manager-grid');
  if (!grid) {
    console.warn("[MidiControls] renderDeviceManager: #device-manager-grid not found in DOM");
    return;
  }
  console.log("[MidiControls] renderDeviceManager: rendering", State.devices.length, "devices");
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
        ${localStorage.getItem('mc_photo_' + dev.id) 
  ? `<img src="${localStorage.getItem('mc_photo_' + dev.id)}" style="width:38px; height:38px; object-fit:cover; border-radius:6px; border:1px solid #38bdf8; margin-right:8px;" title="Custom Top-View Faceplate Active" />`
  : `<div class="icon">${dev.icon || '🎹'}</div>`
}
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
        <button class="btn sm" onclick="selectDevice('${dev.id}'); if(window.openUploadFaceplateModal) window.openUploadFaceplateModal(); else showPanel('editor');" title="Upload and align top-view picture">📷 Photo</button>
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
  if (typeof window.renderDynamicSysExTemplateSelector === 'function') {
    window.renderDynamicSysExTemplateSelector('All', 'panel');
  }
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
//  SYSEX BATCH PROCESSING QUEUE ENGINE
// ============================================================
window.sysexBatchQueue = [];
window.sysexQueueState = {
  active: false,
  paused: false,
  stopRequested: false,
  currentIndex: -1,
  intervalMs: 150,
  totalBytesSent: 0
};

// Formats byte size into human readable string
function formatSyxSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

window.handleSysexQueueDragOver = function(event) {
  event.preventDefault();
  event.stopPropagation();
  const zone = document.getElementById('sysex-queue-dropzone');
  if (zone) {
    zone.style.borderColor = '#38bdf8';
    zone.style.background = 'rgba(56, 189, 248, 0.12)';
  }
};

window.handleSysexQueueDragLeave = function(event) {
  event.preventDefault();
  event.stopPropagation();
  const zone = document.getElementById('sysex-queue-dropzone');
  if (zone) {
    zone.style.borderColor = 'var(--border)';
    zone.style.background = 'var(--surface3)';
  }
};

window.handleSysexQueueDrop = function(event) {
  event.preventDefault();
  event.stopPropagation();
  const zone = document.getElementById('sysex-queue-dropzone');
  if (zone) {
    zone.style.borderColor = 'var(--border)';
    zone.style.background = 'var(--surface3)';
  }

  const files = event.dataTransfer?.files;
  if (files && files.length) {
    window.addFilesToSysexQueue(Array.from(files));
  }
};

window.handleSysexQueueFiles = function(event) {
  const files = Array.from(event.target.files || []);
  if (files.length) {
    window.addFilesToSysexQueue(files);
  }
  event.target.value = ''; // Reset input so same file can be re-selected if desired
};

window.addFilesToSysexQueue = function(fileList) {
  if (!fileList || !fileList.length) return;

  let addedCount = 0;
  fileList.forEach(file => {
    // Basic filter or accept all MIDI/SysEx extensions
    const id = 'syx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 7);
    window.sysexBatchQueue.push({
      id,
      file,
      name: file.name,
      size: file.size,
      sizeFormatted: formatSyxSize(file.size),
      status: 'pending', // 'pending' | 'reading' | 'transmitting' | 'sent' | 'error' | 'cancelled'
      errorMsg: null,
      byteCount: null,
      timestamp: null
    });
    addedCount++;
  });

  renderSysexBatchQueueUI();
  toast(`Added ${addedCount} file(s) to SysEx batch queue.`, 'info');
};

window.removeSysexQueueItem = function(id) {
  if (window.sysexQueueState.active) {
    const activeItem = window.sysexBatchQueue[window.sysexQueueState.currentIndex];
    if (activeItem && activeItem.id === id) {
      toast('Cannot remove a file currently transmitting.', 'error');
      return;
    }
  }

  window.sysexBatchQueue = window.sysexBatchQueue.filter(item => item.id !== id);
  renderSysexBatchQueueUI();
};

window.clearSysexBatchQueue = function() {
  if (window.sysexQueueState.active) {
    window.sysexQueueState.stopRequested = true;
  }
  window.sysexBatchQueue = [];
  renderSysexBatchQueueUI();
  toast('SysEx queue cleared.', 'info');
};

window.updateSysexBatchDelay = function(val) {
  const parsed = parseInt(val, 10);
  if (!isNaN(parsed) && parsed >= 10) {
    window.sysexQueueState.intervalMs = parsed;
  }
};

function renderSysexBatchQueueUI() {
  const listEl = document.getElementById('sysex-queue-list');
  const badgeEl = document.getElementById('sysex-queue-badge');
  const progressContainer = document.getElementById('sysex-batch-progress-container');
  const progressBar = document.getElementById('sysex-batch-progress-bar');
  const progressText = document.getElementById('sysex-batch-progress-text');
  const progressPercent = document.getElementById('sysex-batch-progress-percent');
  const btnSend = document.getElementById('btn-sysex-send-queue');
  const btnPause = document.getElementById('btn-sysex-pause-queue');

  if (!listEl) return;

  const queue = window.sysexBatchQueue;
  const total = queue.length;
  const sentCount = queue.filter(item => item.status === 'sent').length;

  if (badgeEl) {
    badgeEl.textContent = `${total} file${total === 1 ? '' : 's'}`;
  }

  if (total === 0) {
    listEl.innerHTML = `
      <div id="sysex-queue-empty" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text3);font-size:0.78rem;padding:24px 0;">
        <span>No .syx files queued.</span>
        <span style="font-size:0.7rem;opacity:0.7;margin-top:4px;">Drag and drop files above to begin batch transmission.</span>
      </div>
    `;
    if (progressContainer) progressContainer.style.display = 'none';
    if (btnPause) btnPause.style.display = 'none';
    if (btnSend) {
      btnSend.disabled = false;
      btnSend.innerHTML = '▶ Start Batch';
    }
    return;
  }

  // Update progress if batch active
  if (progressContainer) {
    if (window.sysexQueueState.active || sentCount > 0) {
      progressContainer.style.display = 'block';
      const pct = Math.round((sentCount / total) * 100);
      if (progressBar) progressBar.style.width = pct + '%';
      if (progressPercent) progressPercent.textContent = pct + '%';
      if (progressText) progressText.textContent = `Completed ${sentCount} of ${total} files`;
    } else {
      progressContainer.style.display = 'none';
    }
  }

  // Render items
  listEl.innerHTML = queue.map(item => {
    let statusBadge = '';
    let itemBorder = 'var(--border)';
    let itemBg = 'rgba(255,255,255,0.02)';

    switch(item.status) {
      case 'reading':
        statusBadge = `<span style="font-size:0.68rem;padding:2px 8px;border-radius:10px;background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid #38bdf8;font-weight:600;">🔄 Reading</span>`;
        itemBorder = '#38bdf8';
        break;
      case 'transmitting':
        statusBadge = `<span style="font-size:0.68rem;padding:2px 8px;border-radius:10px;background:rgba(245,158,11,0.2);color:#f59e0b;border:1px solid #f59e0b;font-weight:600;">⚡ Transmitting...</span>`;
        itemBorder = '#f59e0b';
        itemBg = 'rgba(245,158,11,0.06)';
        break;
      case 'sent':
        statusBadge = `<span style="font-size:0.68rem;padding:2px 8px;border-radius:10px;background:rgba(16,185,129,0.18);color:#10b981;border:1px solid #10b981;font-weight:600;">✅ Sent (${item.byteCount || item.size} B)</span>`;
        itemBorder = 'rgba(16,185,129,0.4)';
        break;
      case 'error':
        statusBadge = `<span style="font-size:0.68rem;padding:2px 8px;border-radius:10px;background:rgba(239,68,68,0.2);color:#ef4444;border:1px solid #ef4444;font-weight:600;" title="${escapeHtml(item.errorMsg || 'Failed')}">❌ Error</span>`;
        itemBorder = '#ef4444';
        break;
      case 'cancelled':
        statusBadge = `<span style="font-size:0.68rem;padding:2px 8px;border-radius:10px;background:rgba(255,255,255,0.05);color:var(--text3);border:1px solid var(--border);">⏹ Stopped</span>`;
        break;
      default: // pending
        statusBadge = `<span style="font-size:0.68rem;padding:2px 8px;border-radius:10px;background:rgba(255,255,255,0.05);color:var(--text3);border:1px solid rgba(255,255,255,0.1);">⏳ Pending</span>`;
    }

    return `
      <div id="syx-item-${item.id}" style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:${itemBg};border:1px solid ${itemBorder};border-radius:6px;gap:8px;transition:all 0.15s ease;">
        <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
          <span style="font-size:0.95rem;">📄</span>
          <div style="min-width:0;flex:1;">
            <div style="font-size:0.78rem;font-weight:600;color:#f8fafc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
            <div style="font-size:0.68rem;color:var(--text3);">${item.sizeFormatted}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          ${statusBadge}
          <button class="btn sm" onclick="previewQueueItemInVisualizer('${item.id}')" title="Inspect SysEx bytes in Template Visualizer" style="padding:2px 6px;font-size:0.68rem;background:var(--surface3);">🔍</button>
          <button class="btn sm danger" onclick="removeSysexQueueItem('${item.id}')" title="Remove from queue" style="padding:2px 6px;font-size:0.68rem;">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

window.startSysexBatchTransmission = async function() {
  if (window.sysexQueueState.active) return;
  if (!State.midiOut) {
    toast('No MIDI Output port connected. Please select an active MIDI Out port first.', 'error');
    return;
  }

  const queue = window.sysexBatchQueue;
  if (!queue.length) {
    toast('No SysEx files queued. Drag & drop .syx files first.', 'info');
    return;
  }

  // Find index of first non-sent file, or reset if all sent
  let startIndex = queue.findIndex(item => item.status !== 'sent');
  if (startIndex === -1) {
    // All already sent, reset statuses
    queue.forEach(item => { item.status = 'pending'; item.errorMsg = null; });
    startIndex = 0;
  }

  window.sysexQueueState.active = true;
  window.sysexQueueState.paused = false;
  window.sysexQueueState.stopRequested = false;

  const btnSend = document.getElementById('btn-sysex-send-queue');
  const btnPause = document.getElementById('btn-sysex-pause-queue');
  if (btnSend) {
    btnSend.disabled = true;
    btnSend.innerHTML = '⚡ Transmitting...';
  }
  if (btnPause) {
    btnPause.style.display = 'inline-block';
    btnPause.innerHTML = '⏸ Pause';
  }

  let sentBytesTotal = 0;
  let successCount = 0;

  for (let i = startIndex; i < queue.length; i++) {
    if (window.sysexQueueState.stopRequested) {
      queue[i].status = 'cancelled';
      break;
    }

    // Handle pause
    while (window.sysexQueueState.paused) {
      await new Promise(r => setTimeout(r, 100));
      if (window.sysexQueueState.stopRequested) break;
    }
    if (window.sysexQueueState.stopRequested) break;

    const item = queue[i];
    window.sysexQueueState.currentIndex = i;

    // 1. Read
    item.status = 'reading';
    renderSysexBatchQueueUI();

    try {
      const buffer = await item.file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      if (bytes.length === 0) {
        throw new Error('File is empty (0 bytes).');
      }

      // 2. Transmit
      item.status = 'transmitting';
      item.byteCount = bytes.length;
      renderSysexBatchQueueUI();

      if (typeof sendSysExOut === 'function') {
        sendSysExOut(bytes);
      } else if (typeof sendMidiOut === 'function') {
        sendMidiOut(bytes);
      } else if (State.midiOut) {
        State.midiOut.send(bytes);
      } else {
        throw new Error('MIDI Out disconnected during transmission.');
      }

      sentBytesTotal += bytes.length;
      successCount++;
      item.status = 'sent';
      item.timestamp = new Date().toLocaleTimeString();
      renderSysexBatchQueueUI();

      // Pace delay between packets to prevent MIDI FIFO queue overflow
      await new Promise(r => setTimeout(r, window.sysexQueueState.intervalMs));

    } catch(err) {
      console.error(`[SysEx Batch] Error transmitting ${item.name}:`, err);
      item.status = 'error';
      item.errorMsg = err.message || 'Transmission failed';
      renderSysexBatchQueueUI();
    }
  }

  window.sysexQueueState.active = false;
  window.sysexQueueState.paused = false;

  if (btnSend) {
    btnSend.disabled = false;
    btnSend.innerHTML = '▶ Start Batch';
  }
  if (btnPause) {
    btnPause.style.display = 'none';
  }

  if (window.sysexQueueState.stopRequested) {
    toast('SysEx batch transmission stopped.', 'info');
  } else {
    toast(`SysEx Batch Complete: ${successCount} of ${queue.length} files (${formatSyxSize(sentBytesTotal)}) transmitted.`, 'success');
  }
};

window.pauseOrResumeSysexBatch = function() {
  if (!window.sysexQueueState.active) return;
  window.sysexQueueState.paused = !window.sysexQueueState.paused;
  const btnPause = document.getElementById('btn-sysex-pause-queue');
  if (btnPause) {
    btnPause.innerHTML = window.sysexQueueState.paused ? '▶ Resume' : '⏸ Pause';
  }
  toast(window.sysexQueueState.paused ? 'Batch queue paused.' : 'Resuming batch queue...', 'info');
};

window.previewQueueItemInVisualizer = async function(id) {
  const item = window.sysexBatchQueue.find(it => it.id === id);
  if (!item) return;

  try {
    const buffer = await item.file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

    const panelTa = document.getElementById('sysex-panel-textarea');
    if (panelTa) {
      panelTa.value = hex;
      if (typeof window.updateSysExPanelVisualizer === 'function') {
        window.updateSysExPanelVisualizer();
      }
      toast(`Loaded ${item.name} into Template Visualizer.`, 'info');
    }
  } catch(e) {
    toast(`Failed to read file: ${e.message}`, 'error');
  }
};

window.addEventListener('beforeunload', (e) => {
  const isRecording = window.midiRecorder && window.midiRecorder.isRecording;
  const isSysEx = window.sysexQueueActive;
  
  if (isRecording || isSysEx) {
    e.preventDefault();
    e.returnValue = ''; // Required for modern browsers
  }
});

window.savePresetVersion = savePresetVersion;
window.pingDevice = pingDevice;
window.backupFiltered = backupFiltered;
window.exportDeviceJSON = exportDeviceJSON;


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
  
  if (typeof renderMonitor === "function") renderMonitor();
};

window.renderDeviceManager = renderDeviceManager;

window.vkCurve = 'linear';
window.updateVkCurve = function() {
  const sel = document.getElementById('vk-curve-type');
  if (sel) window.vkCurve = sel.value;
  if (typeof window.drawVkCurve === 'function') window.drawVkCurve();
};

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.drawVkCurve === 'function') {
    setTimeout(window.drawVkCurve, 100);
  }
});


setTimeout(() => {
  if (typeof window.drawVkCurve === 'function') window.drawVkCurve();
}, 100);

window.drawVkCurve = function() {
  const canvas = document.getElementById('vk-curve-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let x = 0; x < w; x++) {
    const t = x / (w - 1);
    let yVal = t;
    if (window.vkCurve === 'exp') {
      yVal = t * t;
    } else if (window.vkCurve === 'log') {
      yVal = Math.sqrt(t);
    }
    const y = h - (yVal * (h - 4)) - 2;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
};

window.applyVelocityCurve = function(velRaw) {
  const t = velRaw / 127;
  let yVal = t;
  if (window.vkCurve === 'exp') {
    yVal = t * t;
  } else if (window.vkCurve === 'log') {
    yVal = Math.sqrt(t);
  }
  return Math.min(127, Math.max(1, Math.round(yVal * 127)));
};



window.clockMode = 'auto'; // 'auto', 'internal', 'external'
window.clockOutPorts = [];
window.clockInPorts = [];
window.lastClockRxTime = 0;
window.clockAutoState = 'internal'; // defaults to internal if auto is active but no rx

window.updateClockMode = function(mode) {
  window.clockMode = mode;
  renderClockUI();
};

window.renderClockUI = function() {
  const intDiv = document.getElementById('clock-internal-settings');
  const extDiv = document.getElementById('clock-external-settings');
  const autoStatus = document.getElementById('clock-auto-status');
  const sel = document.getElementById('clock-mode');
  if (sel) sel.value = window.clockMode;
  
  if (window.clockMode === 'internal') {
    intDiv.style.display = 'block';
    extDiv.style.display = 'none';
    autoStatus.style.display = 'none';
  } else if (window.clockMode === 'external') {
    intDiv.style.display = 'none';
    extDiv.style.display = 'block';
    autoStatus.style.display = 'none';
  } else {
    // AUTO
    intDiv.style.display = 'block';
    extDiv.style.display = 'block';
    autoStatus.style.display = 'inline';
    autoStatus.textContent = `[${window.clockAutoState.toUpperCase()} ACTIVE]`;
  }
  
  // Render port checkboxes
  if (window.midiAccess) {
    const outPorts = document.getElementById('clock-out-ports');
    if (outPorts) {
      let outHtml = '';
      for (let output of window.midiAccess.outputs.values()) {
        const checked = window.clockOutPorts.includes(output.id) ? 'checked' : '';
        outHtml += `<label style="font-size:0.75rem;"><input type="checkbox" onchange="toggleClockOutPort('${output.id}', this.checked)" ${checked}> ${output.name}</label>`;
      }
      outPorts.innerHTML = outHtml;
    }
    
    const inPorts = document.getElementById('clock-in-ports');
    if (inPorts) {
      let inHtml = '';
      for (let input of window.midiAccess.inputs.values()) {
        const checked = window.clockInPorts.includes(input.id) ? 'checked' : '';
        inHtml += `<label style="font-size:0.75rem;"><input type="checkbox" onchange="toggleClockInPort('${input.id}', this.checked)" ${checked}> ${input.name}</label>`;
      }
      inPorts.innerHTML = inHtml;
    }
  }
};

window.toggleClockOutPort = function(id, checked) {
  if (checked) { if (!window.clockOutPorts.includes(id)) window.clockOutPorts.push(id); }
  else window.clockOutPorts = window.clockOutPorts.filter(x => x !== id);
};
window.toggleClockInPort = function(id, checked) {
  if (checked) { if (!window.clockInPorts.includes(id)) window.clockInPorts.push(id); }
  else window.clockInPorts = window.clockInPorts.filter(x => x !== id);
};

window.sendClockTransport = function(byte) {
  if (window.clockMode === 'external' || (window.clockMode === 'auto' && window.clockAutoState === 'external')) return;
  window.clockOutPorts.forEach(id => {
    const output = window.midiAccess.outputs.get(id);
    if (output) output.send([byte]);
  });
};

setInterval(() => {
  if (window.clockMode === 'auto') {
    const now = performance.now();
    const newState = (now - window.lastClockRxTime < 2000) ? 'external' : 'internal';
    if (newState !== window.clockAutoState) {
      window.clockAutoState = newState;
      renderClockUI();
    }
  }
}, 1000);




window.openSysExInspector = function() {
  const dev = getActiveDev(); if (!dev) return;
  const p = getActivePreset();
  
  let sysexContent = `<div style="color:var(--text3); font-size:0.8rem; margin-bottom:12px;">No SysEx data currently held in memory for this preset. You can initiate a dump from your device, upload a .syx file, or paste raw HEX bytes below.</div>`;
  let hexString = '';
  
  if (p && p.sysexData && p.sysexData.length) {
    hexString = p.sysexData.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    sysexContent = `<div style="margin-bottom:12px; font-size:0.8rem;">
      Last dump received at: <strong>${new Date(p.lastDump || Date.now()).toLocaleTimeString()}</strong><br>
      Total bytes: <strong>${p.sysexData.length}</strong>
    </div>`;
  }
  
  const html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h2 style="margin:0;">SysEx Template Importer</h2>
      <label class="btn sm" style="cursor:pointer; background:var(--surface3);">
        📂 Load .syx File
        <input type="file" accept=".syx" style="display:none;" onchange="loadSyxFileIntoInspector(event)">
      </label>
    </div>
    <div style="margin-bottom:12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
      <label for="sysex-modal-preset-select" style="font-size:0.75rem; color:var(--text2); font-weight:600;">Standard Templates:</label>
      <select id="sysex-modal-preset-select" onchange="loadStandardSysExTemplate(this.value, 'inspector')" style="flex:1; background:var(--surface2); border:1px solid var(--border); color:var(--text); padding:4px 8px; border-radius:4px; font-size:0.75rem; outline:none;">
        <option value="">-- Choose a standard starting template --</option>
        <optgroup label="Akai Professional">
          <option value="akai_lpd8_req1">Akai LPD8 — Read Preset 1 Request</option>
          <option value="akai_lpd8_dump1">Akai LPD8 — Preset 1 Full Configuration Dump</option>
          <option value="akai_lpd8_dump2">Akai LPD8 — Preset 2 Ableton Mapping Dump</option>
        </optgroup>
        <optgroup label="Novation">
          <option value="novation_remote_req">Novation Remote SL — Template Dump Request</option>
          <option value="novation_remote_dump">Novation Remote SL — Template 1 Factory Dump</option>
          <option value="novation_nocturn_on">Novation Nocturn — Automap Mode Enable</option>
          <option value="novation_launchcontrol_req">Novation Launch Control XL — Template 1 Request</option>
          <option value="novation_launchcontrol_dump">Novation Launch Control XL — Template 1 Dump</option>
          <option value="novation_launchpad_prog">Novation Launchpad — Programmer Mode SysEx</option>
        </optgroup>
        <optgroup label="Roland">
          <option value="roland_sp404_inquiry">Roland SP-404MKII — Device Identity Inquiry</option>
          <option value="roland_tr8s_req">Roland TR-8S — Kit Data Parameter Request</option>
        </optgroup>
        <optgroup label="Native Instruments & Behringer">
          <option value="ni_inquiry">Native Instruments Controller Inquiry</option>
          <option value="behringer_inquiry">Behringer Synthesizer Identity Request</option>
        </optgroup>
        <optgroup label="Universal Standard">
          <option value="universal_inquiry">Universal MIDI Device Inquiry (All Devices)</option>
        </optgroup>
      </select>
      <button class="btn sm" onclick="loadSelectedTemplateBtn('inspector')">Load</button>
    </div>
    ${sysexContent}
    <div style="display:flex; gap:12px; margin-bottom:12px;">
      <div style="flex:1;">
        <label style="font-size:0.8rem; font-weight:bold; color:var(--text2); display:block; margin-bottom:4px;">Raw HEX Data:</label>
        <textarea id="sysex-inspector-textarea" oninput="updateSysExVisualizer()" style="width:100%; height:180px; font-family:monospace; font-size:0.8rem; padding:8px; background:var(--surface2); color:var(--text); border:1px solid var(--border); border-radius:4px; outline:none; resize:vertical;" placeholder="Paste raw HEX bytes (e.g. F0 00 20 29 ... F7)">${hexString}</textarea>
      </div>
      <div style="flex:1; display:flex; flex-direction:column;">
        <label style="font-size:0.8rem; font-weight:bold; color:var(--text2); display:block; margin-bottom:4px;">Template Structure Visualization:</label>
        <div id="sysex-visualizer-container" style="flex:1; overflow-y:auto; background:var(--surface2); border:1px solid var(--border); border-radius:4px; padding:8px; font-family:monospace; font-size:0.75rem;">
           <em style="color:var(--text3);">Paste or load hex data to visualize template structure...</em>
        </div>
      </div>
    </div>
    <div style="display:flex; justify-content:flex-end; gap:8px;">
      <button class="btn" onclick="closeModal()">Close</button>
      <button class="btn primary" onclick="applySysExInspector()">Parse & Import Template</button>
    </div>
  `;
  
  openModal(html);
  setTimeout(updateSysExVisualizer, 50); // initial render
};

window.loadSyxFileIntoInspector = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const buffer = new Uint8Array(evt.target.result);
    let hex = '';
    buffer.forEach(b => hex += b.toString(16).padStart(2, '0').toUpperCase() + ' ');
    const ta = document.getElementById('sysex-inspector-textarea');
    if (ta) {
      ta.value = hex.trim();
      updateSysExVisualizer();
      toast('Loaded .syx file into importer.', 'info');
    }
  };
  reader.readAsArrayBuffer(file);
};

window.updateSysExVisualizer = function() {
  const ta = document.getElementById('sysex-inspector-textarea');
  const vis = document.getElementById('sysex-visualizer-container');
  if (!ta || !vis) return;
  
  const text = ta.value.replace(/[^a-fA-F0-9]/g, '');
  if (text.length === 0) {
    vis.innerHTML = '<em style="color:var(--text3);">No data...</em>';
    return;
  }
  
  const bytes = [];
  for (let i = 0; i < text.length; i += 2) {
    bytes.push(parseInt(text.substr(i, 2), 16));
  }
  
  let out = '';
  // Generic structural visualization
  if (bytes[0] === 0xF0) {
    out += `<div style="color:var(--accent); margin-bottom:4px;"><strong>[SysEx Header]</strong> ${bytes.slice(0, 4).map(b=>b.toString(16).padStart(2,'0').toUpperCase()).join(' ')}</div>`;
    
    // Novation specifics (F0 00 20 29)
    if (bytes[1] === 0x00 && bytes[2] === 0x20 && bytes[3] === 0x29) {
      out += `<div style="color:#10b981; margin-bottom:4px;">✓ Novation Protocol Detected</div>`;
      out += `<div style="color:var(--text2); margin-bottom:8px;">Device Type: <strong>0x${(bytes[4]||0).toString(16).padStart(2,'0')}</strong> | Command: <strong>0x${(bytes[5]||0).toString(16).padStart(2,'0')}</strong></div>`;
    }
    
    out += `<div style="margin-bottom:8px; border-top:1px solid var(--border); padding-top:4px;"><strong>Payload Bytes:</strong></div>`;
    
    out += `<div style="display:grid; grid-template-columns:repeat(8, 1fr); gap:2px; font-size:0.7rem;">`;
    const payload = bytes.slice(4, bytes.length - (bytes[bytes.length-1] === 0xF7 ? 1 : 0));
    payload.forEach((b, i) => {
      // Highlight standard CC ranges or ASCII text roughly
      let bg = 'transparent';
      let title = 'Byte';
      if (b >= 32 && b <= 126) { bg = '#334155'; title = String.fromCharCode(b); }
      out += `<div style="background:${bg}; padding:2px; text-align:center; border-radius:2px;" title="${title}">${b.toString(16).padStart(2,'0').toUpperCase()}</div>`;
    });
    out += `</div>`;
    
    if (bytes[bytes.length-1] === 0xF7) {
       out += `<div style="color:var(--accent); margin-top:8px;"><strong>[End of Exclusive (F7)]</strong></div>`;
    } else {
       out += `<div style="color:#ef4444; margin-top:8px;"><strong>[WARNING: Missing F7 Terminator]</strong></div>`;
    }
  } else {
    out += `<div style="color:#ef4444;">Invalid SysEx: Must start with F0.</div>`;
  }
  
  vis.innerHTML = out;
};

window.applySysExInspector = function() {
  const dev = getActiveDev(); if (!dev) return;
  const text = document.getElementById('sysex-inspector-textarea').value;
  const hexes = text.replace(/[^a-fA-F0-9]/g, '');
  if (hexes.length % 2 !== 0) {
    toast('Invalid HEX string length.', 'error');
    return;
  }
  
  const bytes = [];
  for (let i = 0; i < hexes.length; i += 2) {
    bytes.push(parseInt(hexes.substr(i, 2), 16));
  }
  
  if (bytes[0] !== 0xF0 || (bytes.length > 0 && bytes[bytes.length-1] !== 0xF7)) {
    toast('SysEx must start with F0 and end with F7', 'error');
    return;
  }
  
  toast(`Parsed & Imported ${bytes.length} bytes of Template Data.`, 'success');
  handleSysExIn(new Uint8Array(bytes));
  closeModal();
};




window.loadSyxFileIntoPanel = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const buffer = new Uint8Array(evt.target.result);
    let hex = '';
    buffer.forEach(b => hex += b.toString(16).padStart(2, '0').toUpperCase() + ' ');
    const ta = document.getElementById('sysex-panel-textarea');
    if (ta) {
      ta.value = hex.trim();
      updateSysExPanelVisualizer();
      toast('Loaded .syx file into panel importer.', 'info');
    }
  };
  reader.readAsArrayBuffer(file);
};

window.updateSysExPanelVisualizer = function() {
  const ta = document.getElementById('sysex-panel-textarea');
  const vis = document.getElementById('sysex-panel-visualizer');
  if (!ta || !vis) return;
  
  const text = ta.value.replace(/[^a-fA-F0-9]/g, '');
  if (text.length === 0) {
    vis.innerHTML = '<em style="color:var(--text3);">Waiting for SysEx dump, paste, or file...</em>';
    return;
  }
  
  const bytes = [];
  for (let i = 0; i < text.length; i += 2) {
    bytes.push(parseInt(text.substr(i, 2), 16));
  }
  
  let out = '';
  // Generic structural visualization
  if (bytes[0] === 0xF0) {
    out += `<div style="color:var(--accent); margin-bottom:4px;"><strong>[SysEx Header]</strong> ${bytes.slice(0, 4).map(b=>b.toString(16).padStart(2,'0').toUpperCase()).join(' ')}</div>`;
    
    // Novation specifics (F0 00 20 29)
    if (bytes[1] === 0x00 && bytes[2] === 0x20 && bytes[3] === 0x29) {
      out += `<div style="color:#10b981; margin-bottom:4px;">✓ Novation Protocol Detected</div>`;
      out += `<div style="color:var(--text2); margin-bottom:8px;">Device Type: <strong>0x${(bytes[4]||0).toString(16).padStart(2,'0')}</strong> | Command: <strong>0x${(bytes[5]||0).toString(16).padStart(2,'0')}</strong></div>`;
    }
    
    out += `<div style="margin-bottom:8px; border-top:1px solid var(--border); padding-top:4px;"><strong>Payload Bytes (${bytes.length}):</strong></div>`;
    
    out += `<div style="display:grid; grid-template-columns:repeat(16, 1fr); gap:2px; font-size:0.7rem;">`;
    const payload = bytes.slice(4, bytes.length - (bytes[bytes.length-1] === 0xF7 ? 1 : 0));
    
    // Cap rendering size for massive dumps to avoid freezing UI
    const maxRender = 1024;
    const renderPayload = payload.slice(0, maxRender);
    
    renderPayload.forEach((b, i) => {
      let bg = 'transparent';
      let title = 'Byte';
      if (b >= 32 && b <= 126) { bg = '#334155'; title = String.fromCharCode(b); }
      out += `<div style="background:${bg}; padding:2px; text-align:center; border-radius:2px;" title="${title}">${b.toString(16).padStart(2,'0').toUpperCase()}</div>`;
    });
    out += `</div>`;
    
    if (payload.length > maxRender) {
      out += `<div style="color:var(--text3); margin-top:8px;"><em>... plus ${payload.length - maxRender} more bytes ...</em></div>`;
    }
    
    if (bytes[bytes.length-1] === 0xF7) {
       out += `<div style="color:var(--accent); margin-top:8px;"><strong>[End of Exclusive (F7)]</strong></div>`;
    } else {
       out += `<div style="color:#ef4444; margin-top:8px;"><strong>[WARNING: Missing F7 Terminator]</strong></div>`;
    }
  } else {
    out += `<div style="color:#ef4444;">Invalid SysEx: Must start with F0.</div>`;
  }
  
  vis.innerHTML = out;
};

window.applySysExPanelImport = function() {
  const text = document.getElementById('sysex-panel-textarea').value;
  const hexes = text.replace(/[^a-fA-F0-9]/g, '');
  if (hexes.length % 2 !== 0) {
    toast('Invalid HEX string length.', 'error');
    return;
  }
  
  const bytes = [];
  for (let i = 0; i < hexes.length; i += 2) {
    bytes.push(parseInt(hexes.substr(i, 2), 16));
  }
  
  if (bytes[0] !== 0xF0 || (bytes.length > 0 && bytes[bytes.length-1] !== 0xF7)) {
    toast('SysEx must start with F0 and end with F7', 'error');
    return;
  }
  
  toast(`Parsed & Imported ${bytes.length} bytes of Template Data.`, 'success');
  handleSysExIn(new Uint8Array(bytes));
};


// ============================================================
//  STANDARD SYSEX TEMPLATES LIBRARY & DYNAMIC SELECTION LOGIC
// ============================================================
const STANDARD_SYSEX_TEMPLATES = {
  // --- NATIVE INSTRUMENTS ---
  ni_maschine_mk3: {
    controller: 'Maschine MK3',
    mfr: 'Native Instruments',
    category: 'Native Instruments',
    name: 'NI Maschine MK3 — Factory Controller Mode Init',
    hex: 'F0 00 21 09 00 00 01 16 01 F7',
    desc: 'Switches Maschine MK3 to high-speed MIDI Controller Mode and initializes dual OLED displays.',
    byteCount: 10,
    tags: ['NI', 'Maschine', 'MK3']
  },
  ni_maschine_mk2: {
    controller: 'Maschine MK2',
    mfr: 'Native Instruments',
    category: 'Native Instruments',
    name: 'NI Maschine MK2 — Controller Mode & RGB Grid Init',
    hex: 'F0 00 21 09 00 00 01 11 01 F7',
    desc: 'Enables high-resolution MIDI control mode and initializes 16 RGB velocity pads.',
    byteCount: 10,
    tags: ['NI', 'Maschine', 'MK2']
  },
  ni_maschine_mk1: {
    controller: 'Maschine MK1',
    mfr: 'Native Instruments',
    category: 'Native Instruments',
    name: 'NI Maschine MK1 — Controller Mode Initialization',
    hex: 'F0 00 21 09 00 00 01 10 01 F7',
    desc: 'Switches original Maschine MK1 hardware into standalone USB-MIDI host mode.',
    byteCount: 10,
    tags: ['NI', 'Maschine', 'MK1']
  },
  ni_maschine_mikro_mk3: {
    controller: 'Maschine Mikro MK3',
    mfr: 'Native Instruments',
    category: 'Native Instruments',
    name: 'NI Maschine Mikro MK3 — Smart Strip Mode Init',
    hex: 'F0 00 21 09 00 00 01 17 01 F7',
    desc: 'Initializes dual-touch Smart Strip pitch/mod modes and pad velocity curves.',
    byteCount: 10,
    tags: ['NI', 'Mikro', 'MK3']
  },
  ni_maschine_mikro_mk2: {
    controller: 'Maschine Mikro MK2',
    mfr: 'Native Instruments',
    category: 'Native Instruments',
    name: 'NI Maschine Mikro MK2 — RGB Mode Handshake',
    hex: 'F0 00 21 09 00 00 01 14 01 F7',
    desc: 'Sets up high-contrast display and initializes RGB pad feedback.',
    byteCount: 10,
    tags: ['NI', 'Mikro', 'MK2']
  },
  ni_maschine_mikro_mk1: {
    controller: 'Maschine Mikro MK1',
    mfr: 'Native Instruments',
    category: 'Native Instruments',
    name: 'NI Maschine Mikro MK1 — Handshake Init',
    hex: 'F0 00 21 09 00 00 01 12 01 F7',
    desc: 'Native Instruments hardware identity inquiry and controller handshake.',
    byteCount: 10,
    tags: ['NI', 'Mikro', 'MK1']
  },

  // --- NOVATION ---
  novation_lc_xl_dump1: {
    controller: 'Launch Control XL MK1/MK2',
    mfr: 'Novation',
    category: 'Novation',
    name: 'Novation Launch Control XL — Template 1 Dump',
    hex: 'F0 00 20 29 02 11 77 00 0D 0E 0F 10 11 12 13 14 1D 1E 1F 20 21 22 23 24 31 32 33 34 35 36 37 38 4D 4E 4F 50 51 52 53 54 F7',
    desc: 'Full factory template 1 mapping for 24 rotary knobs (Send A, Send B, Pan) and 8 faders.',
    byteCount: 41,
    tags: ['Novation', 'LaunchControl']
  },
  novation_lc_xl_req: {
    controller: 'Launch Control XL MK1/MK2',
    mfr: 'Novation',
    category: 'Novation',
    name: 'Novation Launch Control XL — Template 1 Dump Request',
    hex: 'F0 00 20 29 02 11 77 00 F7',
    desc: 'Sends memory read request to Launch Control XL asking for User Template 1 memory dump.',
    byteCount: 9,
    tags: ['Novation', 'LaunchControl']
  },
  novation_launchpad_prog: {
    controller: 'Launchpad Pro / MK2',
    mfr: 'Novation',
    category: 'Novation',
    name: 'Novation Launchpad — Programmer Mode SysEx',
    hex: 'F0 00 20 29 02 10 2C 03 F7',
    desc: 'Switches Launchpad into low-level Programmer Mode for direct 8x8 RGB LED addressing.',
    byteCount: 9,
    tags: ['Novation', 'Launchpad']
  },
  novation_launchpad_session: {
    controller: 'Launchpad Pro / MK2',
    mfr: 'Novation',
    category: 'Novation',
    name: 'Novation Launchpad — Session Grid Mode Init',
    hex: 'F0 00 20 29 02 10 2C 00 F7',
    desc: 'Restores Launchpad to standard Session Mode grid with side scene buttons.',
    byteCount: 9,
    tags: ['Novation', 'Launchpad']
  },
  novation_nocturn_on: {
    controller: 'Nocturn',
    mfr: 'Novation',
    category: 'Novation',
    name: 'Novation Nocturn — Automap Mode Enable & LED Rings',
    hex: 'F0 00 20 29 40 5C F7',
    desc: 'Engages Nocturn high-speed Automap LED feedback mode for 8 endless encoders and crossfader.',
    byteCount: 7,
    tags: ['Novation', 'Nocturn']
  },
  novation_remote_req: {
    controller: 'ReMOTE Zero SL / 25 SL',
    mfr: 'Novation',
    category: 'Novation',
    name: 'Novation ReMOTE SL — Active Template Dump Request',
    hex: 'F0 00 20 29 02 0A 79 00 F7',
    desc: 'Queries Novation ReMOTE SL / Zero SL to transmit the currently active template memory.',
    byteCount: 9,
    tags: ['Novation', 'ReMOTE']
  },
  novation_remote_dump: {
    controller: 'ReMOTE Zero SL / 25 SL',
    mfr: 'Novation',
    category: 'Novation',
    name: 'Novation ReMOTE SL — Template 1 Factory Dump',
    hex: 'F0 00 20 29 02 0A 79 00 01 00 54 65 6D 70 6C 61 74 65 20 31 00 15 16 17 18 19 1A 1B 1C 29 2A 2B 2C 2D 2E 2F 30 70 71 72 73 74 75 76 77 F7',
    desc: 'Complete Template 1 header and control assignment structure for Novation ReMOTE SL series.',
    byteCount: 46,
    tags: ['Novation', 'ReMOTE']
  },

  // --- ROLAND ---
  roland_tr8s_req: {
    controller: 'TR-8S Rhythm Performer',
    mfr: 'Roland',
    category: 'Roland',
    name: 'Roland TR-8S — Kit Data Parameter Request',
    hex: 'F0 41 10 00 00 00 4B 11 00 00 00 00 00 00 01 00 7F F7',
    desc: 'Sends Roland DT1/RQ1 handshake requesting current drum kit sound and level parameters.',
    byteCount: 18,
    tags: ['Roland', 'TR8S']
  },
  roland_sp404_inquiry: {
    controller: 'SP-404 / SX / A (MK1)',
    mfr: 'Roland',
    category: 'Roland',
    name: 'Roland SP-404 MK1 — Device Identity Inquiry',
    hex: 'F0 7E 10 06 01 F7',
    desc: 'Inquires SP-404 / SX / A sampler hardware identity and firmware revision.',
    byteCount: 6,
    tags: ['Roland', 'SP404']
  },
  roland_sp404mk2_init: {
    controller: 'SP-404MKII',
    mfr: 'Roland',
    category: 'Roland',
    name: 'Roland SP-404MKII — Bus FX Routing & Config Inquiry',
    hex: 'F0 41 10 00 00 00 7B 11 00 00 00 00 00 00 01 00 7F F7',
    desc: 'Requests current SP-404MKII dual bus FX routing matrix and pad bank configuration.',
    byteCount: 18,
    tags: ['Roland', 'SP404MKII']
  },
  roland_sp404mk3_init: {
    controller: 'SP-404MK3 (Studio)',
    mfr: 'Roland',
    category: 'Roland',
    name: 'Roland SP-404MK3 — Studio Sampler Initialization',
    hex: 'F0 41 10 00 00 00 7C 11 00 00 00 00 00 00 01 00 7F F7',
    desc: 'Sends studio initialization handshake for 16 expressive pads and dual crossfaders.',
    byteCount: 18,
    tags: ['Roland', 'SP404MK3']
  },

  // --- DJ-TECH ---
  djtech_kontrol_one_init: {
    controller: 'Kontrol One',
    mfr: 'DJ-Tech',
    category: 'DJ-Tech',
    name: 'DJ-Tech Kontrol One — Deck A/B Factory Preset Init',
    hex: 'F0 00 20 6B 01 01 00 7F F7',
    desc: 'Initializes scratch jogwheel sensitivity and 4 FX rotary pots for Deck A/B operation.',
    byteCount: 9,
    tags: ['DJTech', 'KontrolOne']
  },

  // --- BEHRINGER ---
  behringer_edge_init: {
    controller: 'Edge Percussion Synthesizer',
    mfr: 'Behringer',
    category: 'Behringer',
    name: 'Behringer Edge — Sequencer Parameter Init',
    hex: 'F0 00 20 32 00 7F 06 01 02 01 F7',
    desc: 'Initializes dual 8-step pitch/velocity sequencer registers and clock sync divisors.',
    byteCount: 11,
    tags: ['Behringer', 'Edge']
  },

  // --- AKAI PROFESSIONAL ---
  akai_lpd8_dump1: {
    controller: 'LPD8',
    mfr: 'Akai Professional',
    category: 'Akai',
    name: 'Akai LPD8 — Preset 1 Full Configuration Dump',
    hex: 'F0 47 7F 75 63 00 01 01 00 24 00 01 00 25 01 02 00 26 02 03 00 27 03 04 00 28 04 01 00 29 05 02 00 2A 06 03 00 2B 07 04 00 01 00 7F 02 00 7F 03 00 7F 04 00 7F 05 00 7F 06 00 7F 07 00 7F 08 00 7F F7',
    desc: 'Full factory Preset 1 dump for LPD8 (8 velocity pads + 8 knobs CC/Note configuration).',
    byteCount: 65,
    tags: ['Akai', 'LPD8']
  },
  akai_lpd8_dump2: {
    controller: 'LPD8',
    mfr: 'Akai Professional',
    category: 'Akai',
    name: 'Akai LPD8 — Preset 2 Ableton Mapping Dump',
    hex: 'F0 47 7F 75 63 00 01 02 07 58 1E 18 07 59 1F 19 07 5A 20 1A 07 5B 21 1B 07 5C 1A 1C 07 5D 1B 1D 07 5E 1C 1E 07 5F 1D 1F 07 32 00 7F 07 33 00 7F 07 34 00 7F 07 35 00 7F 07 36 00 7F 07 37 00 7F 07 38 00 7F 07 39 00 7F F7',
    desc: 'Ableton Live clip launch and macro device mapping dump for LPD8.',
    byteCount: 65,
    tags: ['Akai', 'LPD8']
  },
  akai_lpd8_req1: {
    controller: 'LPD8',
    mfr: 'Akai Professional',
    category: 'Akai',
    name: 'Akai LPD8 — Read Preset 1 Request',
    hex: 'F0 47 7F 75 61 00 01 01 F7',
    desc: 'Requests Preset 1 configuration dump from connected Akai LPD8 hardware.',
    byteCount: 9,
    tags: ['Akai', 'LPD8']
  },
  akai_midimix_init: {
    controller: 'MIDImix',
    mfr: 'Akai Professional',
    category: 'Akai',
    name: 'Akai MIDImix — Factory CC Mapping Init',
    hex: 'F0 47 7F 31 63 00 01 00 10 11 12 13 14 15 16 17 18 19 1A 1B 1C 1D 1E 1F 20 21 22 23 24 25 26 27 28 29 2A 2B 2C 2D 2E 2F F7',
    desc: 'Restores 24 knobs, 9 faders, and 17 buttons to standard Ableton/DAW channel layout.',
    byteCount: 40,
    tags: ['Akai', 'MIDImix']
  },

  // --- UNIVERSAL ---
  universal_inquiry: {
    controller: 'All MIDI Hardware',
    mfr: 'Universal MMA / AMEI',
    category: 'Universal',
    name: 'Universal MIDI Device Inquiry (All Hardware)',
    hex: 'F0 7E 7F 06 01 F7',
    desc: 'Standard non-realtime device identity inquiry recognized by all MMA/AMEI compliant synthesizers and controllers.',
    byteCount: 6,
    tags: ['Universal', 'MMA']
  }
};

window.STANDARD_SYSEX_TEMPLATES = STANDARD_SYSEX_TEMPLATES;

// Dynamically populates the SysEx Template Selectors
window.renderDynamicSysExTemplateSelector = function(filterCategory = 'All', target = 'panel') {
  const selId = target === 'panel' ? 'sysex-template-preset-select' : 'sysex-modal-preset-select';
  const sel = document.getElementById(selId);
  if (!sel) return;

  const categories = ['All', 'Native Instruments', 'Novation', 'Roland', 'Akai', 'DJ-Tech', 'Behringer', 'Universal'];
  
  let optionsHtml = '<option value="">-- Choose a standard starting template --</option>';

  const grouped = {};
  Object.keys(STANDARD_SYSEX_TEMPLATES).forEach(key => {
    const item = STANDARD_SYSEX_TEMPLATES[key];
    const cat = item.category || 'Other';
    if (filterCategory !== 'All' && cat !== filterCategory) return;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ key, ...item });
  });

  Object.keys(grouped).forEach(cat => {
    optionsHtml += `<optgroup label="${cat}">`;
    grouped[cat].forEach(item => {
      optionsHtml += `<option value="${item.key}">${item.name} (${item.byteCount} bytes)</option>`;
    });
    optionsHtml += `</optgroup>`;
  });

  sel.innerHTML = optionsHtml;
};

// Selection logic: Populates textarea, triggers visualizer, and shows info card
window.loadStandardSysExTemplate = function(key, target = 'panel') {
  if (!key || !STANDARD_SYSEX_TEMPLATES[key]) return;
  const tmpl = STANDARD_SYSEX_TEMPLATES[key];

  if (target === 'panel') {
    const ta = document.getElementById('sysex-panel-textarea');
    if (ta) {
      ta.value = tmpl.hex;
      if (typeof window.updateSysExPanelVisualizer === 'function') window.updateSysExPanelVisualizer();
    }
    renderSysExTemplateCard(tmpl, 'sysex-panel-card-container');
    toast(`Loaded factory SysEx template: ${tmpl.name}`, 'info');
  } else if (target === 'inspector') {
    const ta = document.getElementById('sysex-inspector-textarea');
    if (ta) {
      ta.value = tmpl.hex;
      if (typeof window.updateSysExVisualizer === 'function') window.updateSysExVisualizer();
    }
    renderSysExTemplateCard(tmpl, 'sysex-modal-card-container');
    toast(`Loaded factory SysEx template: ${tmpl.name}`, 'info');
  }
};

window.filterSysExTemplatesByCategory = function(category, target = 'panel') {
  window.renderDynamicSysExTemplateSelector(category, target);
  
  // Highlight active filter button
  const filterContainer = document.getElementById(`sysex-${target}-filters`);
  if (filterContainer) {
    const btns = filterContainer.querySelectorAll('button');
    btns.forEach(b => {
      b.classList.toggle('primary', b.dataset.cat === category);
    });
  }
};

function renderSysExTemplateCard(tmpl, containerId) {
  let container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="background:rgba(56, 189, 248, 0.08); border:1px solid rgba(56, 189, 248, 0.3); border-radius:6px; padding:10px 12px; margin-top:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
      <div style="flex:1; min-width:200px;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
          <span style="font-size:0.65rem; background:#0284c7; color:#fff; padding:1px 6px; border-radius:3px; font-weight:700;">${tmpl.mfr}</span>
          <span style="font-size:0.8rem; font-weight:700; color:#e2e8f0;">${tmpl.controller}</span>
          <span style="font-size:0.7rem; color:#94a3b8; font-family:monospace;">${tmpl.byteCount} bytes</span>
        </div>
        <div style="font-size:0.72rem; color:#94a3b8; line-height:1.3;">${tmpl.desc}</div>
      </div>
      <div>
        <button class="btn sm primary" onclick="sendActiveSysExTemplate()" title="Transmit this SysEx message to connected MIDI Out device">
          ⚡ Send to Hardware
        </button>
      </div>
    </div>
  `;
}

window.sendActiveSysExTemplate = function() {
  const ta = document.getElementById('sysex-panel-textarea') || document.getElementById('sysex-inspector-textarea');
  if (!ta || !ta.value.trim()) {
    toast('No SysEx bytes to send.', 'error');
    return;
  }

  const hexClean = ta.value.replace(/[^0-9A-Fa-f]/g, '');
  if (hexClean.length % 2 !== 0 || hexClean.length === 0) {
    toast('Invalid SysEx hex byte sequence.', 'error');
    return;
  }

  const bytes = new Uint8Array(hexClean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexClean.substr(i * 2, 2), 16);
  }

  if (typeof sendSysExOut === 'function') {
    sendSysExOut(bytes);
    toast(`Transmitted ${bytes.length} SysEx bytes to hardware.`, 'success');
  } else if (typeof sendMidiOut === 'function') {
    sendMidiOut(bytes);
    toast(`Transmitted ${bytes.length} SysEx bytes to hardware.`, 'success');
  } else {
    toast('No MIDI Output port currently connected.', 'error');
  }
};

window.loadSelectedTemplateBtn = function(target) {
  const selId = target === 'panel' ? 'sysex-template-preset-select' : 'sysex-modal-preset-select';
  const sel = document.getElementById(selId);
  if (sel && sel.value) {
    window.loadStandardSysExTemplate(sel.value, target);
  } else {
    toast('Please choose a controller from the dropdown first.', 'info');
  }
};

