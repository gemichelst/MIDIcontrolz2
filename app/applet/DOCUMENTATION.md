# Documentation for MIDIcontrolz2

## Overview
MIDIcontrolz2 is a Progressive Web Application (PWA) designed to provide musicians, engineers, and producers with a portable, hardware-agnostic tool to configure MIDI controllers without requiring manufacturer-specific bloatware.

## Core Modules

### 1. WebMIDI Hook (`src/useWebMidi.ts`)
The application core relies on the custom React hook `useWebMidi`. 
- **Initialization:** Requests MIDI access with `sysex: true`. 
- **Message Parsing:** Processes binary `MIDIMessageEvent` payloads, decoding status bytes into human-readable types (`noteon`, `noteoff`, `cc`, `pc`, `sysex`).
- **Identity Resolution:** Listens specifically for Universal Non-Real Time SysEx Identity Replies (`F0 7E <channel> 06 02 ... F7`) to parse manufacturer IDs and match connected hardware against the `BUILT_IN_DEVICES` database.

### 2. Device Templates (`src/devices.ts`)
Hardware definitions are strictly typed using TypeScript interfaces (`DeviceConfig`, `PadControl`, `KnobControl`). A device template defines:
- UI Grid layout (Pads, Knobs, Faders).
- Quick SysEx command presets.
- Base CC and Note values.
The Custom Hardware Mapping editor allows users to override these structures and export the configuration to JSON.

### 3. SysEx Bulk Transmission
Located in the "SysEx Bulk" tab, this tool reads raw binary (`.syx` / `.sys`) files via the browser `FileReader` API as an `ArrayBuffer`. The buffer is converted to a `Uint8Array` and piped directly to the selected MIDI output port. A configurable async delay (`setTimeout(..., 200)`) between files prevents buffer overflows in legacy hardware (like the Novation Remote SL mk1).

### 4. Custom Preset Import/Export
Users can tweak device layouts in the "Hardware Mapping" tab via a raw JSON string editor. 
- **Exporting:** Serializes the `activeDevice` state to a Blob, creating an ephemeral object URL (`URL.createObjectURL`) to trigger a local file download.
- **Importing:** Uses a standard `<input type="file" />` to parse uploaded JSON strings back into the React state, persisting custom modifications.

## Browser Support
- **Full Support:** Google Chrome, Microsoft Edge, Brave (Blink-based browsers).
- **Partial Support:** Firefox (requires `dom.webmidi.enabled` set in `about:config`).
- **No Support:** Safari (Apple WebKit currently lacks WebMIDI API support).
