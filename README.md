# MIDIcontrolz2 🎛️

Welcome to **MIDIcontrolz2** – an offline-first, highly advanced MIDI mapping and diagnostic tool built purely with WebMIDI, HTML5, and vanilla JavaScript. No external dependencies, no server backends required. Runs directly in any modern browser.

## 🚀 Features (v2.10.0)

### 1. Advanced MIDI Utilities
*   **MIDI Multi-Track Recorder:** Capture incoming MIDI events in real-time. Hit record, play your sequence, and loop or play it back instantly out to your active MIDI port using internal scheduling.
*   **Chord Memory:** Transform your single-key physical triggers into massive, complex chord voicings. Simply "Learn" a trigger note, "Learn" the chord voicing, and the engine will intercept and output your custom chords on the fly.
*   **MIDI Sync & Clock:** Send an internal Timing Clock (0xF8) directly from the browser at a customizable BPM, complete with Start/Continue/Stop transport controls for syncing hardware sequencers.
*   **LFO Generator:** Continuously output mathematical sine-wave sweeps to modulate any CC parameter on your external hardware in real-time.
*   **Chord Progression Creator:** Audition synthesizers rapidly using the interactive chord pads (Major, Minor, 7th, Diminished).
*   **Latency & Connection Tester:** Use the built-in loopback tester. Plug a cable from your device's MIDI Out into its MIDI In, and the app calculates millisecond-accurate round-trip latency.

### 2. Deep Editor & Visual Mapper
*   **Version History Engine:** Click "Save Version" to instantly snapshot your layout. The Version History sidebar allows you to rollback your layout to any timestamp if you make a mistake.
*   **Visual SVG Mapper:** A drag-and-drop workspace! Drag CC numbers directly onto an interactive SVG graphic of your hardware. Click any control to arm MIDI Learn mode instantly.
*   **Macro Builder:** Assign a single physical control (e.g., Mod Wheel) to trigger multiple destination CCs simultaneously. Ideal for complex live performance sweeps.
*   **Virtual Keyboard Strumming:** Click and drag across the virtual keys to sweep across notes.
*   **Velocity Curve Editor:** Apply visual Linear, Exponential, or Logarithmic curves to scale the velocity of notes played on the Virtual Keyboard.
*   **Scale Quantizer:** Force all outgoing notes from the Virtual Keyboard to musically snap to selected scales (Major, Minor, Dorian, Mixolydian, Pentatonic) rooted to any base note.

### 3. Device Manager & Presets
*   **Hover-Preview System:** Hover over any Preset Tab in the editor to view a fast, floating overview tooltip of its internal mappings without destructively loading the preset.
*   **Import / Export Library:** Easily back up your entire studio setup or export filtered bundles of devices via Tag selection.
*   **Built-in Device Library:** Comes pre-loaded with manifests for popular hardware like the **Akai LPD8**, **Korg nanoKONTROL2**, and **Arturia MiniLab**.
*   **SysEx Support:** Import and export binary `.syx` files for legacy hardware direct integration.

### 4. Diagnostics & Analytics
*   **Real-time Velocity Analytics:** Inside the Monitor panel, a live Recharts-powered Bar Chart visualizes the mathematical distribution of your incoming note velocities, helping you train your playing dynamics or diagnose hardware sensor faults.
*   **Advanced MIDI Monitor:** High-speed event logging with dedicated syntax highlighting for Note On (Bold Blue), Note Off (Muted Blue), CC (Emerald), PC (Purple), and SysEx (Yellow).

## 🛠️ Installation & Usage

1. **Deploy / Run:** Since this is a vanilla frontend app, you can just serve the root directory statically (e.g., `npm run dev` with Vite, or a simple python HTTP server).
2. **Connect Hardware:** Plug in a USB-MIDI interface or direct USB synth.
3. **Approve Permissions:** When the browser asks, allow MIDI (and SysEx) permissions.
4. **Select Ports:** Choose your hardware in the top navigation bar.

## 🎨 Design Philosophy

This tool intentionally avoids complex build steps where possible, relying on a clean HTML/JS architecture to guarantee extreme performance and direct low-level DOM access.

---
*Built iteratively via Google AI Studio Build.*
