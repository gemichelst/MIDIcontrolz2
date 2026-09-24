# MIDIcontrolz2 🎛️

Welcome to **MIDIcontrolz2** – an offline-first, highly advanced MIDI mapping and diagnostic tool built purely with WebMIDI, HTML5, and vanilla JavaScript. No external dependencies, no server backends required. Runs directly in any modern browser.

## 🚀 Features (v2.18.0)

### 🎛️ Expanded Hardware Controller Library (15 New Controllers, 16 Device Definitions)
Full native support, custom vector controls, pad layouts, encoders, faders, MIDI Learn, and SysEx definitions for:
*   **Native Instruments Maschine Series:**
    *   **Maschine Mikro MK1:** 16 velocity-sensitive pads, master push encoder, wheel, and transport controls.
    *   **Maschine Mikro MK2:** 16 RGB backlit pads, high-contrast display, dual-mode encoder.
    *   **Maschine Mikro MK3:** 16 oversized multi-color pads, dual-touch Smart Strip, compact 4-D encoder.
    *   **Maschine MK1:** 16 pads, 8 rotary encoders with dual display soft-buttons, full transport section.
    *   **Maschine MK2:** 16 high-sensitivity RGB pads, 8 rotary encoders, master push encoder, dual displays.
    *   **Maschine MK3:** 16 ultra-responsive RGB pads, 8 touch-sensitive knobs, 4-D encoder, Smart Strip, and Studio navigation.
*   **Novation Performance & Launch Controllers:**
    *   **Launch Control XL MK1 & MK2:** 24 rotary knobs (Send A, Send B, Pan), 8 smooth 60mm faders, 16 multi-color track focus/control buttons, and template dump requests.
    *   **Launchpad MK2:** Iconic 8x8 RGB grid (64 pads) with scene launch and function control buttons.
    *   **Launchpad Pro:** Professional 64-pad velocity & poly-aftertouch performance grid with dedicated navigation and Programmer Mode.
*   **DJ-Tech Modular Controller:**
    *   **Kontrol One:** Dedicated USB DJ controller with 4 FX rotary knobs, scratch jogwheel, loop encoder, tempo pitch fader, 4 hot cues, and deck select switches.
*   **Roland Rhythm & Sampler Series:**
    *   **TR-8S Rhythm Performer:** 11 instrument tracks with dedicated Tune, Decay, and CTRL knobs, 11 level faders, master FX CTRL, TR-REC step pads, and kit dump requests.
    *   **SP-404 / SX / A (MK1):** 12 sample trigger pads, 3 top control knobs for realtime Vinyl Sim and multi-effects, external source triggers.
    *   **SP-404MKII:** 16 velocity pads across 10 banks (A-J), top FX control knobs, value push encoder, and dual bus FX switches.
    *   **SP-404MK3 (Studio Sampler):** Extended 16 expressive pads, 6 multi-FX macro encoders, dual crossfaders, and chromatic/slice modes.
*   **Behringer Synthesizers:**
    *   **Edge Percussion Synthesizer:** Dual 8-step sequencer pitch/velocity knobs, VCF Cutoff/Resonance, VCF/VCA Decay, Pitch Mod depth, Pink Noise, and step trigger pads.

### 📦 Pre-configured Standard SysEx Template Library
*   **Instant Starting Point:** Integrated template selector dropdown right inside the **Template Importer** panel and the **SysEx Inspector Modal**.
*   **Supported Out-of-the-Box Templates:**
    *   *Akai Professional:* LPD8 Preset 1 Dump Request, Preset 1 Full Configuration Dump, Preset 2 Ableton Mapping Dump.
    *   *Novation:* Remote SL Template Dump Request, Remote SL Template 1 Factory Dump, Nocturn Automap Enable, Launch Control XL Template 1 Request & Dump, Launchpad Programmer Mode.
    *   *Roland:* SP-404MKII Device Identity Inquiry, TR-8S Kit Data Parameter Request.
    *   *Universal & Standards:* Native Instruments Controller Inquiry, Behringer Synthesizer Identity Request, Universal MIDI Device Inquiry (All Devices).
*   **Realtime Structural Visualization:** Instant hexadecimal decoding, byte segmentation, ASCII preview, and validation.

---

## 📜 Changelog

### [v2.18.0] - 2026-09-24
*   **Added:** 15 newly requested hardware MIDI controller models (16 configurations total) across Native Instruments, Novation, Roland, DJ-Tech, and Behringer.
*   **Added:** Pre-configured Standard SysEx Template Library dropdown within the Template Importer panel and modal.
*   **Enhanced:** Template Importer auto-fills with accurate hexadecimal payloads and previews for Akai, Novation, Roland, NI, and Behringer.
*   **Fixed:** Fixed duplicate attribute typo in the device quick commands container.

### [v2.17.1] - 2026-09-24
*   **Added:** Multi-port routing for MIDI Clock (Internal host, External receive, and Auto detect modes).
*   **Added:** SysEx Template Importer module and modal for manual template dumps.
*   **Fixed:** Canvas context initialization for `#vk-curve-canvas`.

### 1. Advanced MIDI Utilities
*   **MIDI Multi-Track Recorder:** Capture incoming MIDI events in real-time. Hit record, play your sequence, and loop or play it back instantly out to your active MIDI port using internal scheduling.
*   **Chord Memory:** Transform your single-key physical triggers into massive, complex chord voicings. Simply "Learn" a trigger note, "Learn" the chord voicing, and the engine will intercept and output your custom chords on the fly.
*   **MIDI Sync & Clock (Auto/Host/Receive):** Advanced multi-port MIDI Clock routing. **INTERNAL (Host)** mode sends a customizable BPM clock to explicitly selected MIDI Out ports. **EXTERNAL (Receive)** mode syncs to inbound clocks on specifically chosen MIDI In ports. **AUTO (Detect)** dynamically switches modes based on active hardware clock signals without menu diving.
*   **LFO Generator:** Continuously output mathematical sine-wave sweeps to modulate any CC parameter on your external hardware in real-time.
*   **Chord Progression Creator:** Audition synthesizers rapidly using the interactive chord pads (Major, Minor, 7th, Diminished).
*   **Latency & Connection Tester:** Use the built-in loopback tester. Plug a cable from your device's MIDI Out into its MIDI In, and the app calculates millisecond-accurate round-trip latency.

*   **SysEx Template Importer / Inspector:** Dedicated Template Receive module in the SysEx panel (and Editor modal). Automatically catches hardware dumps (e.g. Novation SL), visualizes the raw hexadecimal structure, validates terminators, and allows manual `.syx` file loading directly from disk.
### 2. Deep Editor & Visual Mapper
*   **Version History Engine:** Click "Save Version" to instantly snapshot your layout. The Version History sidebar allows you to rollback your layout to any timestamp if you make a mistake.
*   **Visual SVG Mapper:** A drag-and-drop workspace! Drag CC numbers directly onto an interactive SVG graphic of your hardware. Click any control to arm MIDI Learn mode instantly.
*   **Macro Builder:** Assign a single physical control (e.g., Mod Wheel) to trigger multiple destination CCs simultaneously. Ideal for complex live performance sweeps.
*   **Virtual Keyboard Strumming:** Click and drag across the virtual keys to sweep across notes.
*   **Velocity Curve Editor:** Apply visual Linear, Exponential, or Logarithmic curves to scale the velocity of notes played on the Virtual Keyboard.
*   **Scale Quantizer:** Force all outgoing notes from the Virtual Keyboard to musically snap to selected scales (Major, Minor, Dorian, Mixolydian, Pentatonic) rooted to any base note.

*   **Global Toast Notifications:** Immediate visual feedback via sliding toast notifications for critical background operations like SysEx reads/writes and mapping modifications.
### 3. Device Manager & Presets
*   **Hover-Preview System:** Hover over any Preset Tab in the editor to view a fast, floating overview tooltip of its internal mappings without destructively loading the preset.
*   **Import / Export Library:** Easily back up your entire studio setup or export filtered bundles of devices via Tag selection.
*   **Built-in Device Library:** Comes pre-loaded with manifests for popular hardware like the **Akai LPD8**, **Korg nanoKONTROL2**, **Arturia MiniLab**, as well as **Novation Remote SL** and **Novation Nocturn**.
*   **SysEx Support:** Import and export binary `.syx` files for legacy hardware direct integration. Features automated SysEx handshaking and template dump requests specifically for Novation Remote SL and Nocturn hardware.

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
*Built with pure ♥️ by gemichelst.*
