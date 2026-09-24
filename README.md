# MIDIcontrolz2 🎛️

Welcome to **MIDIcontrolz2** – an offline-first, highly advanced MIDI mapping and diagnostic tool built purely with WebMIDI, HTML5, and vanilla JavaScript. No external dependencies, no server backends required. Runs directly in any modern browser.

## 🚀 Features (v2.21.1)

### 📦 SysEx Batch Processing Queue (Drag & Drop + Per-File Status)
*   **Drag & Drop File Intake:** Drag and drop multiple `.syx`, `.sys`, `.bin`, or `.mid` dump files directly into the dedicated drop zone or browse using multi-file selection.
*   **Per-File Real-Time Status Indicators:** Real-time visual lifecycle badges per queued file:
    *   ⏳ **Pending:** Awaiting sequential transmission.
    *   🔄 **Reading:** Extracting and decoding raw binary byte buffer.
    *   ⚡ **Transmitting...:** Active transmission over connected MIDI Out port with pulse animation.
    *   ✅ **Sent:** Successful transmission confirming exact byte payload count transmitted to hardware.
    *   ❌ **Error:** Error state displaying actionable error descriptions.
    *   ⏹ **Stopped / Paused:** Cleanly paused or cancelled state.
*   **Hardware Pace Control (FIFO Buffer Protection):** Selectable transmission pacing delay (50ms Fast, 150ms Standard, 300ms Safe, 600ms Vintage) to prevent hardware microcontroller buffer overruns and packet drops.
*   **Overall Progress Tracking:** Animated progress bar showing completed file counts and overall percentage.
*   **Interactive Queue Management:** Pause/Resume active queues, remove individual items, or clear the queue.
*   **Direct Visualizer Inspection:** Click the 🔍 inspect button on any queued file to immediately load its raw hexadecimal stream into the SysEx Template Visualizer and breakdown analyzer.

### 📐 Resolution- & Faceplate-Dimension-Aware Automatic Overlay Placement
*   **Screen Resolution & DPR Detection:** Detects screen resolution (`screen.width`, `screen.height`, `innerWidth`, `innerHeight`, and `devicePixelRatio`) and container bounding rects to dynamically scale hardware overlay dimensions.
*   **Intrinsic Image Dimension Calibration:** When a user uploads a custom top-view faceplate picture, the engine decodes its natural width and height, computes the precise aspect ratio, and constructs a calibrated `#faceplate-viewport` locked 1:1 to the image geometry.
*   **Strict Aspect-Ratio Locking for Knobs & Pads:** Knobs are mathematically calculated and locked to circular dials (`aspect-ratio: 1 / 1`), pads are locked to squares, and faders track vertical channel heights, preventing distortion or elliptical warping across any display size.
*   **Subpixel Move Mode Tracking:** Mouse dragging in Move Mode is calculated directly against the calibrated faceplate viewport, providing zero offset drift and subpixel accuracy when positioning controls over physical hardware photos.
*   **Auto-Calibrate Toolbar Action & ResizeObserver:** An instant **"📐 Auto-Calibrate (Res & Image)"** button in the mapper toolbar recalculates all control coordinates on demand. A continuous `ResizeObserver` ensures smooth, real-time adaptation when resizing the browser window or rotating screens.

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
*   **Single Unified Core:** Consolidated all core logic, built-in device definitions, and SysEx routines into `public/assets/js/midicontrolz2.js`.
*   **Offline Guarantee:** Built-in hardware definitions for all 22 devices embedded directly into `midicontrolz2.js`.

---

## 📜 Changelog

### [v2.21.1] - 2026-09-24
*   **Fixed:** Resolved runtime error `window.getDeviceControlPositions is not a function` in `mapper.js` by defining and exposing `window.getDeviceControlPositions(dev)` to safely read saved `localStorage` device positions with automatic fallback to `computePredefaultControlPositions`.
*   **Updated:** Bumped application version to v2.21.1 in `package.json`, `index.html`, and `README.md`.

### [v2.21.0] - 2026-09-24
*   **Added:** SysEx Batch Processing Queue in `midicontrolz2.js` supporting drag-and-drop ingestion of multiple `.syx` files.
*   **Added:** Per-file status indicators (`Pending`, `Reading`, `Transmitting`, `Sent`, `Error`, `Stopped`) with real-time byte count verification.
*   **Added:** Hardware pace control with selectable transmission delay presets (50ms, 150ms, 300ms, 600ms) and pause/resume capability.
*   **Added:** Overall batch progress bar with completion counters and direct inspection in the SysEx Template Visualizer.
*   **Added:** Resolution- and faceplate-dimension-aware automatic control placement engine in `mapper.js`.
*   **Added:** Calibrated `#faceplate-viewport` geometry locking 1:1 with natural image dimensions and display pixel ratios.
*   **Added:** Strict aspect ratio preservation for knobs (circular) and pads (square) with subpixel drag precision in Move Mode.
*   **Added:** "📐 Auto-Calibrate (Res & Image)" toolbar action and container `ResizeObserver` for adaptive layout updates.
*   **Updated:** Version bump to v2.21.0 across `package.json`, `index.html`, and `README.md`.

### [v2.20.0] - 2026-09-24
*   **Added:** Initial SysEx bulk queue architecture with sequential transmission safety locks.
*   **Added:** Hardware faceplate dimension detection foundations for custom photo uploads.
*   **Cleaned:** Sanitized markup and standardized device quick commands layout.

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
