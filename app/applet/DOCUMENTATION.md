# Documentation for MIDIcontrolz2

## Overview
MIDIcontrolz2 is a Progressive Web Application (PWA) designed to provide musicians, engineers, and producers with a portable, hardware-agnostic tool to configure MIDI controllers without requiring manufacturer-specific bloatware.

## Core Modules

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
