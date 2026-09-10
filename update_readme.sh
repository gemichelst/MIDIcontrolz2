cat << 'README_CONTENT' > README.md
# MIDIcontrolz2 🎹

A powerful, browser-based MIDI controller editor and management suite built purely with Vanilla JavaScript, HTML, CSS, and the WebMIDI API.

MIDIcontrolz2 is a modern overhaul of the original MIDIcontrolz application, introducing offline caching (PWA), a refined responsive dark mode UI, custom hardware mapping tools, auto-saving, and advanced SysEx bulk transfer capabilities.

## Features

- **No Install, No Backend:** Runs entirely in your browser using the WebMIDI API. No Node server or database required.
- **Hardware Mapping Editor with Preview:** Visually edit knobs, encoders, and pads. Define custom device templates via a live JSON editor with built-in schema validation and localStorage auto-save.
- **Save & Import Presets:** Backup your custom setups to local `.json` or export them directly as `.syx` files. Importing a file provides a detailed preview modal before loading.
- **Preset Tagging:** Organize custom devices via customizable tags (e.g., "live", "studio", "synth"). Search and filter devices instantly in the Device Manager.
- **SysEx Bulk Queueing & Receiver:** A dedicated SysEx area allows you to load multiple `.syx` files and transmit them sequentially to your hardware, complete with buffered timing. It also listens for and captures incoming SysEx template dumps.
- **Interactive Virtual Keyboard:** Test your outputs instantly with an on-screen, multi-octave virtual keyboard that responds visually to incoming Note On/Off messages.
- **MIDI Learn:** Click the 'Learn' button next to any pad or knob in the editor, tap your physical hardware, and the application will instantly capture the CC or Note number.
- **Real-Time MIDI Monitor & Panic:** Inspect Note On/Off, CC, PC, and SysEx messages in real-time. Instantly clear stuck notes using the global MIDI Panic button.
- **Mobile-Responsive Sidebar:** A sleek mobile hamburger menu ensures a clean layout on tablets and phones.
- **Offline Ready (PWA):** Install MIDIcontrolz2 as a Progressive Web App on your device. Once cached, it runs perfectly without an internet connection.

## Quick Start

1. Connect your MIDI device via USB.
2. Open MIDIcontrolz2 in a WebMIDI compatible browser (Chrome, Edge, Brave, Opera).
3. Grant MIDI access permissions if prompted.
4. Select your **MIDI In** and **MIDI Out** ports from the top navigation menu.
5. Auto-Discovery will query your devices, or you can manually select them.
6. Begin editing your presets, mapping custom CCs, or monitoring incoming data.

## Development, Build & Deployment

### Local Development
Because MIDIcontrolz2 is built purely with Vanilla HTML/JS/CSS, no complicated build pipelines are required! However, to utilize Hot Module Replacement and serve the files locally, we use Vite.
```bash
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

### Building for Production
To build the application for deployment (copies assets and prepares the service worker via Vite):
```bash
npm run build
```
This generates a `dist` directory containing the static, minified files ready for the web.

### Deployment
MIDIcontrolz2 is a 100% client-side application (SPA). It can be hosted on any static web hosting service:
- **Vercel / Netlify:** Connect your repository and set the build command to `npm run build` and output directory to `dist`.
- **GitHub Pages:** Use the `gh-pages` package or GitHub Actions to deploy the `dist` folder.
- **Firebase Hosting:** Initialize Firebase and deploy the `dist` folder.

## Core Architecture (Documentation)

### 1. WebMIDI Integration (`midicontrols.v4.js`)
The application core relies on the standard `navigator.requestMIDIAccess`. 
- **Initialization:** Requests MIDI access with `sysex: true`. 
- **Message Parsing:** Processes binary `MIDIMessageEvent` payloads, decoding status bytes into human-readable types (`note_on`, `note_off`, `cc`, `pc`, `sysex`).
- **Identity Resolution:** Listens specifically for Universal Non-Real Time SysEx Identity Replies to parse manufacturer IDs and match connected hardware.

### 2. Device Templates & Tagging
Hardware definitions are stored in memory and localStorage. A device template defines:
- UI Grid layout (Pads, Knobs, Faders).
- Tags (e.g., `["synth", "live"]`) for easy categorization and visual organization.
The Custom Hardware Mapping editor allows users to override these structures and save the configuration.

### 3. SysEx Bulk Transmission & Receiver
Located in the SysEx tab, this tool reads raw binary (`.syx` / `.sys`) files via the browser `FileReader` API. The buffer is converted to a `Uint8Array` and piped directly to the selected MIDI output port. A configurable async delay between files prevents buffer overflows in legacy hardware. It can also receive and store incoming SysEx dumps from devices like the Novation Remote SL.

### 4. Custom Preset Import/Export & Auto-Save
- **Auto-Save:** Draft changes are persisted to `localStorage` automatically every 5 seconds.
- **Exporting (JSON & .syx):** Serializes the active device state to a Blob, creating an ephemeral object URL (`URL.createObjectURL`) to trigger a local file download.
- **Importing with Previews:** Uploading a custom JSON preset opens a visual Preview Modal summarizing the mappings and tags before committing the load.

## Browser Support
- **Full Support:** Google Chrome, Microsoft Edge, Brave (Blink-based browsers).
- **Partial Support:** Firefox (requires `dom.webmidi.enabled` set in `about:config`).
- **No Support:** Safari (Apple WebKit currently lacks WebMIDI API support).
README_CONTENT
rm DOCUMENTATION.md
