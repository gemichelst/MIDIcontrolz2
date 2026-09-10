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
- **Auto-Discovery:** Automatically detects connected Akai and Novation hardware by transmitting standard Identity Requests.

## Quick Start

1. Connect your MIDI device via USB.
2. Open MIDIcontrolz2 in a WebMIDI compatible browser (Chrome, Edge, Brave, Opera).
3. Grant MIDI access permissions if prompted.
4. Select your **MIDI In** and **MIDI Out** ports from the top navigation menu.
5. Auto-Discovery will query your devices. If a match is found, your device template is loaded automatically.
6. Begin editing your presets, mapping custom CCs, or monitoring incoming data.

## Technologies

- React 19
- TypeScript
- Tailwind CSS (v4)
- Vite with PWA plugin
- WebMIDI API
