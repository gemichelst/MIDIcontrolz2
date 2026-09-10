# 🎹 MidiControls

**Browser-based MIDI controller editor — no install, no backend, no build step.**

Live at **[midicontrols.doerd.de](https://midicontrols.doerd.de)**

Edit device presets visually, send and receive SysEx, monitor MIDI traffic in real time,
and back up everything to JSON. Runs entirely in the browser via the WebMIDI API.

---

## Quickstart

```bash
git clone https://github.com/YOUR_USERNAME/midicontrols.git
cd midicontrols
npx serve .
```

Open **http://localhost:3000** in Chrome or Edge.  
Plug in your USB MIDI device → select ports in the top bar → start editing.

> **Why a local server?**  
> Device templates load via `fetch()` from `devices/*/device.json`.  
> Browsers block `fetch()` on `file://` URLs. Any static HTTP server works fine.

### Alternative servers

```bash
python3 -m http.server 8080   # http://localhost:8080
php -S localhost:8080          # http://localhost:8080
npx http-server .              # http://localhost:8080
```

---

## Browser Support

| Browser | Status | Notes |
|---|---|---|
| Chrome 80+ | ✅ Full | Recommended |
| Edge 80+ | ✅ Full | |
| Brave / Opera | ✅ Full | Chromium-based |
| Firefox | ⚠️ Partial | Enable `dom.webmidi.enabled` + `dom.webmidi.sysex.enabled` in `about:config` |
| Safari | ❌ None | No WebMIDI API |

SysEx access triggers a browser permission prompt on first use — click **Allow**.

---

## Features

### Editor
- Visual pad / knob / fader / button grid per device
- Live CC value display — knobs and faders update in real time from incoming MIDI
- **MIDI Learn** — click LEARN on any pad, press a hardware key → auto-maps the note
- **Knob drag** — drag any knob up/down to send live CC to MIDI Out
- **Button LEDs** — click any button in the UI to trigger Note On/Off via MIDI Out
- Per-preset MIDI channel selector (Ch 1–16)
- Pad toggle between Momentary and Toggle mode
- **Read Device** — request a SysEx preset dump from hardware (LPD8 fully supported)
- **Write Device** — send current preset to hardware over SysEx (LPD8 fully supported)

### MIDI Monitor
- Real-time message log — Note On/Off, CC, PC, SysEx
- Filter by message type
- Pause / resume without losing buffered messages
- Hex value display toggle
- Up to 500 messages buffered, newest on top

### SysEx Panel
- Send raw SysEx as space-separated hex bytes
- Built-in hex parser with byte count and validation
- Send raw CC / Note On / Note Off / Program Change directly
- Per-device **Quick Commands** — one-click SysEx buttons for common operations

### Backup & Restore
- Save named snapshots per device at any time (`Ctrl+S`)
- Restore any snapshot with one click
- Export full backup as a single `.json` file
- Restore from file or drag & drop anywhere on the page
- Export individual preset as `.json`
- Copy full CC map to clipboard as plain text

### Device Manager
- Add new devices via UI form — generates the control structure automatically
- Import / export device templates as `.json`
- Remove user-added devices
- Built-in devices are protected (cannot be accidentally deleted)

### Settings
- MIDI Thru — echo MIDI In to MIDI Out
- Highlight controls on incoming message
- Auto-refresh port list on device connect/disconnect
- Show note names (C4, D#3…) or raw numbers
- Show CC values as hex
- Compact layout mode

---

## Project Structure

```
MidiControls/
│
├── index.html ← App shell — HTML only
├── README.md
├── manifest.json ← PWA manifest
├── favicon.ico ← Root favicon (16+32+48 ICO)
├── gen-icons.mjs ← One-time icon generator
│
├── assets/
│ ├── css/
│ │ └── midicontrols.v1.css ← All styles
│ ├── js/
│ │ └── midicontrols.v2.js ← All application logic
│ ├── apple-touch-icon.png
│ ├── icon-16.png … icon-512.png ← All platform icons
│ └── og-image.png ← 1200×630 social preview
│
└── devices/
├── akai_lpd8_v1/
│ └── device.json
├── akai_midimix/
│ └── device.json
├── novation_launchcontrol_mk1/
│ └── device.json
├── novation_nocturn/
│ └── device.json
├── novation_remote_zero_sl_mk1/
│ └── device.json
└── novation_remote25_sl_compact_mk1/
└── device.json
```

---

## Included Devices

| Device | Manufacturer | Pads | Knobs | Faders | Buttons | SysEx |
|---|---|:---:|:---:|:---:|:---:|:---:|
| LPD8 | Akai Professional | 8 | 8 | — | — | ✅ Read + Write |
| MIDImix | Akai Professional | — | 24 | 8+1 | 17 | — |
| Launch Control mk1 | Novation | 8 | — | — | 4 | ✅ LED control |
| Nocturn | Novation | — | 9 | — | 8 | ✅ Automap |
| Remote Zero SL mk1 | Novation | — | 8 | 8 | 14 | ✅ LCD write |
| Remote 25 SL Compact mk1 | Novation | 8 | 8 | — | 6 | ✅ LCD write |

---

## Device Reference

### Akai LPD8

**Specs:** 8 velocity-sensitive pads · 8 × 270° assignable knobs · 4 programs · 16 MIDI channels · USB bus-powered · 310×80×28 mm · 34 g

**4 programs** (presets) are stored on-device and fully editable over SysEx.
Each program sets the MIDI channel independently for all 8 pads and 8 knobs.

Per pad (editable):
- `Note` — MIDI note number sent on hit (0–127)
- `CC` — CC number sent in CC mode (0–127)
- `PC` — Program Change number sent in PC mode (0–127)
- `Mode` — `Momentary` (note on + note off) or `Toggle` (latching)

Per knob (editable):
- `CC` — CC number (0–127)
- `Lo` / `Hi` — output value range (0–127 each)

**SysEx — Read preset N (1–4):**
F0 47 7F 75 61 00 01 0N F7

**SysEx — Write preset N (1–4):**
F0 47 7F 75 62 00 00 3F 0N [ch] [pad×8×4 bytes] [knob×8×3 bytes] F7

- Pad bytes: `[note] [pc] [cc] [mode: 00=Momentary 01=Toggle]`
- Knob bytes: `[cc] [lo] [hi]`
- Channel byte: `0x00`–`0x0F` (Ch 1–16)

Use the **Read Device** / **Write Device** buttons — no manual SysEx entry needed.

> Also supports **Send to RAM**: sends a preset temporarily without overwriting stored programs.

---

### Akai MIDImix

**Specs:** 24 × 270° knobs (3 per channel) · 8 channel faders · 1 master fader (all 30 mm) · 8 Mute + 1 Solo + 8 Rec Arm + 2 Bank + 1 Send All buttons · amber/red LEDs · USB bus-powered · 23.9×20.1×3.0 cm · 0.7 kg

Fixed CC map — no SysEx. All controls transmit on **Ch 1**.

| Control | Channels 1–8 | CC Numbers |
|---|---|---|
| Knob Row 1 | Ch 1–8 | CC 57–64 |
| Knob Row 2 | Ch 1–8 | CC 65–72 |
| Knob Row 3 | Ch 1–8 | CC 73–80 |
| Mute buttons | Ch 1–8 | CC 81–88 |
| Solo buttons | Ch 1–8 | CC 89–96 |
| Rec Arm buttons | Ch 1–8 | CC 41–47, 57 |
| Channel Faders 1–8 | Ch 1 | CC 48–55 |
| Master Fader | Ch 1 | CC 56 |

> **Bank Left / Right** buttons shift the 8 channels MIDImix controls left or right in your DAW.  
> **Send All** transmits all current controller values at once — useful after connecting to re-sync DAW state.
> Note: Send All has no effect in DAWs using "pickup/takeover" mode.

**Ableton Live setup:**  
`Preferences → MIDI/Sync → Control Surface: MIDI Mix → Input & Output: MIDI Mix`  
Set **Track: On** and **Remote: On** for full two-way control.

---

### Novation Launch Control mk1

16 templates (8 user + 8 factory), bi-colour LEDs.

| Operation | SysEx |
|---|---|
| Change template | `F0 00 20 29 02 0A 77 [00–0F] F7` |
| Set LED colour | `F0 00 20 29 02 0A 78 [template] [led] [colour] F7` |

LED colour values: `0C` off · `0D` red low · `0F` red full · `1C` green low · `3C` green full · `3F` amber full

---

### Novation Nocturn

8 endless encoders (relative CC) + speed dial + 8 backlit buttons + Automap protocol.

| Operation | SysEx |
|---|---|
| Automap On | `F0 00 20 29 40 5C F7` |
| Automap Off | `F0 00 20 29 40 5D F7` |

---

### Novation Remote SL (Zero SL mk1 / Remote 25 SL Compact)

Up to 40 templates, Automap + direct MIDI modes, 2-line LCD display.

| Operation | SysEx |
|---|---|
| Init Automap | `F0 00 20 29 03 03 12 01 F7` |
| Write LCD line 1 | `F0 00 20 29 03 03 04 00 [ASCII…] 00 F7` |
| Write LCD line 2 | `F0 00 20 29 03 03 04 01 [ASCII…] 00 F7` |

LCD accepts up to 72 ASCII characters per line.  
Transport note numbers: Stop=115 · Play=118 · Record=119 · Rewind=116 · Forward=117 · Loop=113

**Ableton Live setup** (from screenshots / official docs):  
`Preferences → MIDI/Sync → Control Surface: RemoteSL → Input: SL MkII (Port 2) → Output: SL MkII (Port 2)`

MIDI Ports configuration:
| Port | Track | Sync | Remote |
|---|:---:|:---:|:---:|
| Input: SL MkII (Port 1) | On | Off | On |
| Input: RemoteSL Input (SL MkII Port 2) | On | Off | On |
| Input: Automap MIDI | On | Off | On |
| Output: SL MkII (Port 1) | On | On | Off |
| Output: RemoteSL Output (SL MkII Port 2) | Off | Off | On |
| Output: Automap MIDI | Off | Off | On |

---

## Adding a New Device

### Option A — UI (no files)

1. Open **Devices → ➕ Add Device**
2. Fill in name, manufacturer, control counts
3. The device is saved to `localStorage` immediately
4. Export via **Device Manager → 📤 Export** to save as a permanent `device.json`

### Option B — JSON file (recommended for sharing)

**1. Create the folder**
```bash
mkdir -p devices/my_controller_v1
```

**2. Write `devices/my_controller_v1/device.json`**
```json
{
  "id": "my_controller_v1",
  "name": "My Controller",
  "manufacturer": "ACME",
  "icon": "🎹",
  "color": "#6c63ff",
  "midiName": ["My Controller", "ACME MIDI"],
  "sysex": false,
  "presets": 1,
  "description": "8 pads · 8 knobs",
  "controls": {
    "pads": [
      { "id": "pad1", "label": "Pad 1", "note": 36, "cc": 1, "pc": 0, "mode": "Momentary" }
    ],
    "knobs": [
      { "id": "k1", "label": "K1", "cc": 1, "lo": 0, "hi": 127 }
    ],
    "faders": [],
    "buttons": []
  },
  "defaultPresets": [
    { "name": "Preset 1", "channel": 0 }
  ],
  "quickSysEx": []
}
```

**3. Register it in `assets/js/midicontrols.v2.js`**
```js
const DEVICE_MANIFEST = [
  'akai_lpd8_v1',
  'akai_midimix',
  'novation_launchcontrol_mk1',
  'novation_nocturn',
  'novation_remote_zero_sl_mk1',
  'novation_remote25_sl_compact_mk1',
  'my_controller_v1'    // ← add this line
];
```

**4. Reload** — the device appears in the sidebar.

---

## Control Reference

### Pad
```json
{ "id": "pad1", "label": "Pad 1", "note": 36, "cc": 1, "pc": 0, "mode": "Momentary" }
```

| Field | Range | Description |
|---|---|---|
| `note` | 0–127 | MIDI note sent on hit |
| `cc` | 0–127 | CC number (CC mode) |
| `pc` | 0–127 | Program Change number (PC mode) |
| `mode` | string | `"Momentary"` (note on + off) or `"Toggle"` (latching) |

### Knob / Encoder
```json
{ "id": "k1", "label": "K1", "cc": 1, "lo": 0, "hi": 127 }
```

| Field | Range | Description |
|---|---|---|
| `cc` | 0–127 | CC number |
| `lo` | 0–127 | Minimum output value |
| `hi` | 0–127 | Maximum output value |

### Fader
```json
{ "id": "f1", "label": "Ch 1", "cc": 19 }
```

### Button / LED
```json
{ "id": "btn1", "label": "Mute 1", "note": 1, "cc": 1, "color": "amber" }
```

| Field | Values | Description |
|---|---|---|
| `note` | 0–127 | Note sent on click |
| `cc` | 0–127 | CC number |
| `color` | `"red"` `"green"` `"amber"` | LED colour |

### Preset override
Presets can override any control value per-preset by including the matching array:
```json
{
  "name": "Ableton Live",
  "channel": 7,
  "pads":  [{ "note": 88, "cc": 30, "pc": 24, "mode": "Momentary" }],
  "knobs": [{ "cc": 50, "lo": 0, "hi": 127 }]
}
```
Only included fields are overridden — everything else falls back to the base `controls` definition.

### Quick SysEx command
```json
{ "label": "Reset", "bytes": "F0 7E 7F 09 01 F7" }
```
Must start with `F0` and end with `F7`. Appears as a one-click button in the SysEx panel when the device is selected.

---

## Data & Storage

Everything is stored in `localStorage`. No data is sent anywhere.

| Key | Contents |
|---|---|
| `mc_presets` | User-edited preset data, keyed by device ID |
| `mc_backups` | Backup snapshots array |
| `mc_settings` | UI and MIDI behaviour settings |
| `mc_user_devices` | Devices added via the UI (not from `devices/` folder) |

Base device configs are always re-fetched from `devices/*/device.json` on load.
Updating a JSON file is reflected immediately after reload — user preset edits are preserved.

**Always export a full backup before clearing localStorage or switching browsers.**

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + S` | Save backup of the current device |
| `Ctrl + M` | Switch to MIDI Monitor |
| `Ctrl + E` | Switch to Editor |
| `Escape` | Close modal / cancel MIDI Learn |

---

## Deploy

### Netlify
Drag the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop) — live in 30 seconds.

### Vercel
```bash
npx vercel --prod
```

### GitHub Pages
Push to a repo → Settings → Pages → Source: `main` branch `/root` → Save.

### Plesk / shared hosting
Upload the entire folder via File Manager or FTP. No server-side config needed.

### Cache busting on updates
Rename the file and update `index.html`:
```html
<link rel="stylesheet" href="assets/css/midicontrols.v2.css">
<script src="assets/js/midicontrols.v3.js"></script>
```
Also bump the service worker cache key in the JS file:
```js
const CACHE = 'mc-v2'; // increment on each deploy
```

---

## Troubleshooting

**Devices show 404 in the console**  
→ The `devices/` subfolders don't exist yet or `device.json` is missing. Run:
```bash
find devices -name "device.json"   # should list 6 files
```

**`icon-*.png` 404 in console**  
→ Icons live in `assets/` — run `gen-icons.mjs` or use the browser console snippet in the setup docs.

**WebMIDI permission denied**  
→ Chrome requires HTTPS or `localhost`. Never open via `file://`.

**No MIDI ports appear in the dropdowns**  
→ Connect and power-on the device *before* opening the app. On macOS check **Audio MIDI Setup → MIDI Studio**. On Windows check **Device Manager**. Replugging triggers an auto-refresh.

**Firefox — no MIDI access**  
→ Open `about:config` → set `dom.webmidi.enabled` and `dom.webmidi.sysex.enabled` to `true` → reload.

**LPD8 Read/Write doesn't work**  
→ Make sure *both* MIDI In and MIDI Out are set to the LPD8 in the top bar. SysEx requires a bidirectional connection. Grant SysEx permission when the browser prompts.

**MIDImix faders/knobs out of sync in DAW**  
→ Press the **Send All** button on the hardware to broadcast all current values. Does not work in DAWs with pickup/takeover mode until faders are physically moved to match.

---

## Contributing

1. Fork the repo
2. Add your device to `devices/YOUR_DEVICE_ID/device.json`
3. Test with a real MIDI device or a virtual port:
   - **macOS** — IAC Driver in Audio MIDI Setup
   - **Windows** — [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html)
   - **Linux** — `modprobe snd-virmidi` or JACK
4. Open a pull request — device JSONs only, no changes to core JS required

---

## License

MIT — use freely, attribution appreciated.

---

*WebMIDI API · Pure HTML/CSS/JS · No frameworks · No tracking · No server required*  
*Live: [midicontrols.doerd.de](https://midicontrols.doerd.de)*