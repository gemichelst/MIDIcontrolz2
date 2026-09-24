# MIDIcontrolz2 🎛️

Welcome to **MIDIcontrolz2** – an offline-first, highly advanced MIDI mapping and diagnostic tool built purely with WebMIDI, HTML5, and vanilla JavaScript. No external dependencies, no server backends required. Runs directly in any modern browser.

## 🚀 Features (v2.19.0)

### 📷 Controller Faceplate Photo Upload & Top-View Visual Mapping
*   **Orthographic Top-View Faceplate Visualizer:** High-fidelity hardware faceplate canvas with generous dimensions (min 580px, responsive, expandable), displaying either procedural vector hardware faceplates or high-resolution user-uploaded photos.
*   **Top-View Image Upload Routine:** Upload custom faceplate photos directly from disk with clear, mandatory orthographic guidance (reminding users that straight 90° top-down photos are required to avoid perspective misalignments).
*   **Predefault Control Placement Routine:** Mathematically stable layout engine that automatically positions pads, knobs, faders, and buttons into ergonomically balanced groupings matching each controller's architecture (4x4 pad matrices, 3-tier knob racks, channel faders, TR-REC step sequencers, and jogwheels).
*   **Interactive Move Controls Mode:** Toggle into Move Mode to freely drag and drop any pad, knob, fader, or button overlay across the faceplate image. Position coordinates are saved persistently per device in `localStorage`.
*   **Auto-Arrange Controls:** Single-click realignment back to predefault geometric coordinates.
*   **Live MIDI Feedback:** Overlaid controls illuminate and dials/faders animate in real-time when incoming MIDI messages are received from connected hardware.

### 📦 Dynamic SysEx Template Library & Instant Hardware Inits
*   **Dynamic Hardware Catalog:** Integrated catalog in the **Template Importer** panel supporting Native Instruments (Maschine MK1/MK2/MK3, Mikro MK1/MK2/MK3), Novation (Launch Control XL MK1/MK2, Launchpad MK2/Pro, Nocturn, ReMOTE SL), Roland (TR-8S, SP-404 MK1/MK2/MK3), DJ-Tech (Kontrol One), Behringer (Edge), and Akai (LPD8, MIDImix).
*   **Category Filter Pills:** Rapidly filter by manufacturer (`All`, `Native Inst`, `Novation`, `Roland`, `Akai`, `DJ-Tech`, `Behringer`, `Universal`).
*   **Automatic Population & Live Breakdown:** Choosing any controller instantly populates the SysEx editor with factory initialization hex bytes, triggers packet visualization, and renders an interactive summary card.
*   **Direct Hardware Transmission:** Transmit loaded factory initialization hex messages directly to connected MIDI Output ports with the **"⚡ Send to Hardware"** button.

### 🧹 Codebase Consolidation & Performance
*   **Single Unified Core:** Removed legacy `midicontrol.*.js` scripts (`midicontrol.bak.js`, `midicontrols.v1.js`, `midicontrols.v2.js`, `midicontrols.v3.js`).
*   **Renamed to `midicontrolz2.js`:** All core logic, built-in device definitions, and SysEx routines consolidated into `public/assets/js/midicontrolz2.js`.
*   **Offline Guarantee:** Built-in hardware definitions for all 22 devices embedded directly into `midicontrolz2.js`.

### 🎛️ Expanded Hardware Controller Library (22 Device Definitions)
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
    *   **Launch Control MK1:** 16 rotary knobs, 8 pad buttons, 4 navigation switches.
    *   **Nocturn:** 8 endless encoders with LED rings, speed dial, and crossfader.
    *   **ReMOTE Zero SL & ReMOTE 25 SL Compact:** Dual LCD screens, 8 faders, 8 rotary pots, 8 encoders, and 32 buttons.
*   **DJ-Tech Modular Controller:**
    *   **Kontrol One:** Dedicated USB DJ controller with 4 FX rotary knobs, scratch jogwheel, loop encoder, tempo pitch fader, 4 hot cues, and deck select switches.
*   **Roland Rhythm & Sampler Series:**
    *   **TR-8S Rhythm Performer:** 11 instrument tracks with dedicated Tune, Decay, and CTRL knobs, 11 level faders, master FX CTRL, TR-REC step pads, and kit dump requests.
    *   **SP-404 / SX / A (MK1):** 12 sample trigger pads, 3 top control knobs for realtime Vinyl Sim and multi-effects, external source triggers.
    *   **SP-404MKII:** 16 velocity pads across 10 banks (A-J), top FX control knobs, value push encoder, and dual bus FX switches.
    *   **SP-404MK3 (Studio Sampler):** Extended 16 expressive pads, 6 multi-FX macro encoders, dual crossfaders, and chromatic/slice modes.
*   **Behringer Synthesizers:**
    *   **Edge Percussion Synthesizer:** Dual 8-step sequencer pitch/velocity knobs, VCF Cutoff/Resonance, VCF/VCA Decay, Pitch Mod depth, Pink Noise, and step trigger pads.
*   **Akai Professional:**
    *   **LPD8 (v1 & Wireless):** 8 velocity pads, 8 Q-Link knobs, 4 memory banks.
    *   **MIDImix:** 24 rotary knobs (3 per channel), 9 faders (8 channel + master), 16 channel mute/rec buttons.

---

## 📜 Changelog

### [v2.19.0] - 2026-09-24
*   **Added:** Controller Faceplate Photo Upload with mandatory top-view orthographic perspective notice and live image preview.
*   **Added:** Stable predefault control placement routine for pads, knobs, faders, and buttons matching hardware geometry.
*   **Added:** "Move Controls" mode allowing free dragging and positioning of controls on top-view photos with persistent local storage.
*   **Added:** Generous, non-reduced faceplate canvas sizing (min-height: 580px) with canvas expansion toggle and grid snapping.
*   **Added:** Dynamic SysEx template selector in Template Importer with manufacturer filter pills, live breakdown card, and direct "Send to Hardware" button.
*   **Added:** Offline built-in definitions for all 22 controllers embedded directly in `midicontrolz2.js`.
*   **Cleaned:** Removed legacy `midicontrol.*.js` files and renamed primary script to `public/assets/js/midicontrolz2.js`.
*   **Updated:** Version bump to v2.19.0 across `package.json`, `index.html`, and `README.md`.

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
