# MIDIcontrolz2 🎹

A powerful, browser-based MIDI controller editor and management suite built with React and the WebMIDI API.
MIDIcontrolz2 is a modern overhaul of the original MIDIcontrolz application, introducing offline caching (PWA), a refined responsive UI, custom hardware mapping tools, auto-saving, and advanced SysEx bulk transfer capabilities.

## Features

- **No Install, No Backend:** Runs entirely in your browser using the WebMIDI API.
- **Hardware Mapping Editor with Preview:** Visually edit knobs, encoders, and pads. Define custom device templates via a live JSON editor with built-in schema validation and localStorage auto-save.
- **Save & Import Presets:** Backup your custom setups to local `.json` or `.syx` files. Importing a file provides a detailed preview modal before loading.
- **Preset Tagging:** Organize custom devices via customizable tags (e.g., "live", "studio", "synth").
- **SysEx Bulk Queueing:** A dedicated SysEx tab allows you to load multiple `.syx` files and transmit them sequentially to your hardware, complete with buffered timing.
- **Interactive Virtual Keyboard:** Test your outputs instantly with an on-screen, multi-octave virtual keyboard that responds visually to incoming Note On/Off messages.
- **Real-Time MIDI Monitor & Panic:** Inspect Note On/Off, CC, PC, and SysEx messages in real-time. Instantly clear stuck notes using the global MIDI Panic button.
- **Mobile-Responsive Sidebar:** A sleek, backdrop-blurred mobile drawer ensures a clean layout on tablets and phones.
- **Auto-Discovery:** Automatically detects connected Akai and Novation hardware by transmitting standard Identity Requests.

## Quick Start

1. Connect your MIDI device via USB.
2. Open MIDIcontrolz2 in a WebMIDI compatible browser (Chrome, Edge, Brave, Opera).
3. Grant MIDI access permissions if prompted.
4. Select your **MIDI In** and **MIDI Out** ports from the top navigation menu.
5. Auto-Discovery will query your devices. If a match is found, your device template is loaded automatically.
6. Begin editing your presets, mapping custom CCs, or monitoring incoming data.

## Core Modules (Documentation)

### 1. WebMIDI Hook (`src/useWebMidi.ts`)
The application core relies on the custom React hook `useWebMidi`. 
- **Initialization:** Requests MIDI access with `sysex: true`. 
- **Message Parsing:** Processes binary `MIDIMessageEvent` payloads, decoding status bytes into human-readable types (`noteon`, `noteoff`, `cc`, `pc`, `sysex`).
- **Identity Resolution:** Listens specifically for Universal Non-Real Time SysEx Identity Replies to parse manufacturer IDs and match connected hardware against the `BUILT_IN_DEVICES` database.

### 2. Device Templates & Tagging (`src/devices.ts`)
Hardware definitions are strictly typed using TypeScript interfaces. A device template defines:
- UI Grid layout (Pads, Knobs, Faders).
- Quick SysEx command presets.
- Tags (e.g., `["synth", "live"]`) for easy categorization and visual organization.
The Custom Hardware Mapping editor allows users to override these structures, add metadata tags, and export the configuration.

### 3. SysEx Bulk Transmission
Located in the "SysEx Bulk" tab, this tool reads raw binary (`.syx` / `.sys`) files via the browser `FileReader` API. The buffer is converted to a `Uint8Array` and piped directly to the selected MIDI output port. A configurable async delay between files prevents buffer overflows in legacy hardware.

### 4. Custom Preset Import/Export & Auto-Save
Users can tweak device layouts in the "Hardware Mapping" tab via a live JSON string editor.
- **Auto-Save:** Draft changes are debounced and persisted to `localStorage`. If the browser tab is accidentally closed, users are prompted to restore their draft upon returning.
- **Exporting (JSON & .syx):** Serializes the `activeDevice` state to a Blob, creating an ephemeral object URL (`URL.createObjectURL`) to trigger a local file download. The `.syx` export wraps JSON payloads in non-commercial SysEx headers.
- **Importing with Previews:** Uploading a custom JSON preset opens a visual Preview Modal summarizing the mappings and tags before committing the load.

## Browser Support
- **Full Support:** Google Chrome, Microsoft Edge, Brave (Blink-based browsers).
- **Partial Support:** Firefox (requires `dom.webmidi.enabled` set in `about:config`).
- **No Support:** Safari (Apple WebKit currently lacks WebMIDI API support).

## Development, Build & Deployment

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Local Development
To run the app locally with Hot Module Replacement (HMR):
```bash
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

### Building for Production
To build the application for deployment (compiles TypeScript and bundles via Vite):
```bash
npm run build
```
This will generate a `dist` directory containing the static files.

### Deployment
Because MIDIcontrolz2 is a 100% client-side application (SPA) running entirely in the browser using WebMIDI, it can be hosted on any static web hosting service, such as:
- **Vercel / Netlify:** Simply connect your repository and set the build command to `npm run build` and output directory to `dist`.
- **GitHub Pages:** You can use the `gh-pages` package to deploy the `dist` folder.
- **Firebase Hosting:** Initialize Firebase and deploy the `dist` folder.
- **Cloud Run / Docker:** Serve the `dist` directory using a lightweight web server like Nginx or Node.js.
