# MIDIcontrolz2 🎹

A powerful, browser-based MIDI controller editor and management suite built with React and the WebMIDI API.
MIDIcontrolz2 is a modern overhaul of the original MIDIcontrolz application, introducing offline caching (PWA), a refined dark mode UI, custom hardware mapping tools, and advanced SysEx bulk transfer capabilities.

## Features

- **No Install, No Backend:** Runs entirely in your browser using the WebMIDI API.
- **Hardware Mapping Editor:** Visually edit knobs, encoders, and pads. Define your own custom device templates and configure parameter ranges via a live JSON editor.
- **Save & Import Presets:** Easily backup your custom setups to local `.json` files and restore them at any time.
- **SysEx Bulk Queueing:** A dedicated SysEx tab allows you to load multiple `.syx` files and transmit them sequentially to your hardware, complete with buffered timing to prevent data loss.
- **Virtual Keyboard:** Test your outputs instantly with an on-screen, multi-octave virtual keyboard capable of sending Note On/Off messages.
- **Real-Time MIDI Monitor:** Inspect Note On/Off, Control Change (CC), Program Change (PC), and System Exclusive (SysEx) messages in real-time.
- **Auto-Discovery:** Automatically detects connected Akai and Novation hardware by transmitting a standard Identity Request (`F0 7E 7F 06 01 F7`).
- **Offline Ready (PWA):** Install MIDIcontrolz2 as a Progressive Web App on your device. Once cached, it runs perfectly without an internet connection.

## Quick Start

1. Connect your MIDI device (e.g., Novation Remote SL, Akai LPD8) via USB.
2. Open MIDIcontrolz2 in a WebMIDI compatible browser (Chrome, Edge, Brave, Opera).
3. Grant MIDI access permissions if prompted.
4. Select your **MIDI In** and **MIDI Out** ports from the top dropdown menus.
5. Auto-Discovery will query your devices. If a match is found, your device template is loaded automatically.
6. Begin editing your presets, mapping custom CCs, or monitoring incoming data.

## Technologies

- React 19
- TypeScript
- Tailwind CSS (v4)
- Vite with PWA plugin
- WebMIDI API

## Architecture

This application uses zero backend servers. All MIDI communication happens directly between the browser's WebMIDI API layer and your operating system's MIDI drivers. Presets are converted to `Uint8Array` byte arrays and sent natively.
