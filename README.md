# MIDIcontrolz2 🎹

A powerful, browser-based MIDI controller editor and management suite built purely with Vanilla JavaScript, HTML, CSS, and the WebMIDI API.

MIDIcontrolz2 is a modern overhaul of the original MIDIcontrolz application, introducing offline caching (PWA), a refined responsive dark mode UI, custom hardware mapping tools, auto-saving, advanced SysEx bulk transfer capabilities, and a drag-and-drop Visual SVG Mapper.

## 🌟 Current Features

- **No Install, No Backend:** Runs entirely in your browser using the WebMIDI API. No Node server or database required.
- **Visual MIDI Mapper (SVG):** A drag-and-drop interface for mapping CCs directly onto an SVG representation of your hardware. Includes a visual "MIDI Learn" mode and direct JSON Export of your mappings.
- **Heatmap View:** Instantly visualize which devices in your manager have custom overrides with dynamic border highlights and override badges.
- **Advanced SysEx Bulk Queueing & Receiver:** Load multiple `.syx` files and transmit them sequentially to your hardware. Includes a **real-time Progress Bar** and a queue-based asynchronous output engine that prevents browser crashes during massive data dumps.
- **Device Quick Commands:** Dedicated buttons for device-specific actions, including a standard **Factory Reset (All-System-Reset)** quick command.
- **Real-Time MIDI Monitor & Recent CCs:** Inspect Note On/Off, CC, PC, and SysEx messages in real-time. Features a **Recent CC tracker** that displays the last 5 unique knobs/faders touched for lightning-fast mapping. Instantly clear stuck notes using the global MIDI Panic button.
- **Interactive Virtual Keyboard:** Test your outputs instantly with an on-screen, multi-octave virtual keyboard that responds visually to incoming Note On/Off messages.
- **Hardware Mapping Editor with Preview:** Visually edit knobs, encoders, and pads. Define custom device templates via a live JSON editor with built-in schema validation and localStorage auto-save.
- **Save, Backup & Restore:** Export full environment backups (devices and states) to local `.json` files and restore them anytime. Export individual presets directly.
- **Preset Tagging & Search:** Organize custom devices via customizable tags (e.g., "live", "studio", "synth"). Search and filter devices instantly in the Device Manager.
- **Mobile-Responsive Sidebar:** A sleek mobile hamburger menu ensures a clean layout on tablets and phones.
- **Offline Ready (PWA):** Install MIDIcontrolz2 as a Progressive Web App on your device. Once cached, it runs perfectly without an internet connection. Includes aggressive cache-busting during local development to ensure you always see the latest code.

## 🚫 What is NOT Contained (Limitations)

- **No Cloud Sync or Backend Server:** All configurations, backups, and settings are stored locally in your browser's `localStorage` or downloaded as local files. If you clear your browser data without exporting a backup, your mappings will be lost.
- **No Audio Generation (Synthesizer):** This application is strictly a MIDI control data router, editor, and monitor. It does not generate actual audio or contain any software synthesizers.
- **No Safari Support:** Apple WebKit currently lacks support for the WebMIDI API. You **must** use a WebMIDI-capable browser like Google Chrome, Microsoft Edge, Brave, or Opera.
- **No OS Driver Management:** The app communicates with devices already recognized by your operating system. It cannot automatically install proprietary hardware USB-MIDI drivers.

## 🚀 Quick Start

1. Connect your MIDI device via USB.
2. Open MIDIcontrolz2 in a WebMIDI compatible browser (Chrome, Edge, Brave, Opera).
3. Grant MIDI access permissions when prompted by the browser.
4. Select your **MIDI In** and **MIDI Out** ports from the top navigation menu.
5. Use the **Mapper** tab to drag and drop CCs onto your hardware layout, or use the **Monitor** to see incoming data.

## 🛠 Development, Build & Deployment

### Local Development
Because MIDIcontrolz2 is built purely with Vanilla HTML/JS/CSS, no complicated build pipelines are required! However, to utilize local serving and bundling, we use Vite.

```bash
npm install
npm run dev
```
The application will be available at `http://localhost:3000`. 
*Note: Vite HMR (Hot Module Replacement) is disabled in the config to prevent WebSocket proxy handshake errors in cloud preview environments. A manual refresh is used for updates.*

### Building for Production
To build the application for deployment:
```bash
npm run build
```
This generates a `dist` directory containing the static, minified files ready for the web.

### Deployment
MIDIcontrolz2 is a 100% client-side application (SPA). It can be hosted on any static web hosting service:
- **Vercel / Netlify:** Connect your repository and set the build command to `npm run build` and output directory to `dist`.
- **GitHub Pages:** Use the `gh-pages` package or GitHub Actions to deploy the `dist` folder.

## ⚙️ Core Architecture (Documentation)

### 1. WebMIDI Integration (`midicontrols.v4.js`)
The application core relies on the standard `navigator.requestMIDIAccess`.
- **Initialization:** Requests MIDI access with `sysex: true`.
- **Queue-based Output Engine:** All outgoing MIDI messages are pushed to a buffered Javascript array queue and flushed asynchronously in batches. This guarantees the browser will not lock up or crash when sending massive SysEx dumps.

### 2. SVG Drag & Drop Mapper (`mapper.js`)
A standalone mapping engine that renders SVG representations of your hardware (Pads, Knobs, Faders). Features drag-and-drop HTML5 data-transfer events, visual targeting, and a dedicated "MIDI Learn" mode that listens for incoming CCs and instantly maps them to the targeted SVG element.

### 3. SysEx Bulk Transmission & Receiver
Located in the SysEx tab, this tool reads raw binary (`.syx` / `.sys`) files via the browser `FileReader` API. The buffer is converted to a `Uint8Array` and piped through the asynchronous output queue with a visual progress bar.

### 4. PWA and Service Worker (`sw.js`)
A Service Worker caches the Application Shell (HTML, CSS, JS, Images) for offline use. During development, a cache-busting script automatically unregisters stale workers and deletes Cache Storage to ensure code updates are visible immediately.
