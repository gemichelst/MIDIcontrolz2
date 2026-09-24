(() => {
  "use strict";

  let draggedCC = null;
  let heatmapMode = false;
  let isMoveMode = false;
  let isSnapToGrid = true;
  let isWideMode = false;
  let activeDragControl = null;
  let dragOffset = { x: 0, y: 0 };

  const getState = () => window.State ?? null;
  const getActiveDevice = () =>
    typeof window.getActiveDev === "function" ? window.getActiveDev() : null;

  const notify = (message, type = "info") => {
    if (typeof window.toast === "function") {
      window.toast(message, type);
    } else {
      console.info(`[MIDIcontrolz2] ${message}`);
    }
  };

  const save = () => {
    if (typeof window.save === "function") window.save();
  };

  const syncLog = (message) => {
    if (typeof window.logSyncEvent === "function") window.logSyncEvent(message);
  };

  const refreshMapper = () => {
    window.renderSvgMapper?.();
    window.renderDeviceEditor?.();
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // ============================================================
  //  PREDEFAULT CONTROL PLACEMENT ROUTINE
  // ============================================================
  // Calculates mathematically stable, ergonomic top-view coordinates (%)
  // for any supported controller architecture.
  window.computePredefaultControlPositions = function(dev) {
    if (!dev) return {};
    const id = dev.id || '';
    const pads = dev.controls?.pads || [];
    const knobs = dev.controls?.knobs || [];
    const faders = dev.controls?.faders || [];
    const buttons = dev.controls?.buttons || [];
    const positions = {};

    // 1. Native Instruments Maschine MK1, MK2, MK3
    if (id.startsWith('ni_maschine_mk')) {
      // 16 pads in 4x4 matrix on right side
      const pCols = 4, pRows = 4;
      const pStartX = 58, pStartY = 28, pW = 8, pH = 13, pGapX = 1.8, pGapY = 2.4;
      pads.forEach((p, idx) => {
        const col = idx % pCols;
        const row = Math.floor(idx / pCols);
        positions[`pad-${idx}`] = {
          x: pStartX + col * (pW + pGapX),
          y: pStartY + row * (pH + pGapY),
          w: pW, h: pH
        };
      });

      // 8 Knobs across middle-left
      knobs.slice(0, 8).forEach((k, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        positions[`knob-${idx}`] = {
          x: 16 + col * 9.5,
          y: 42 + row * 18,
          w: 6.5, h: 10
        };
      });
      // Extra encoders if any (e.g. 4D encoder, master volume)
      if (knobs[8]) positions['knob-8'] = { x: 7, y: 38, w: 6.8, h: 10.5 };
      if (knobs[9]) positions['knob-9'] = { x: 7, y: 56, w: 6.8, h: 10.5 };

      // Buttons (transport and group buttons)
      buttons.forEach((b, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        positions[`button-${idx}`] = {
          x: 6 + col * 12,
          y: 80 + row * 9,
          w: 9.5, h: 6.5
        };
      });
      return positions;
    }

    // 2. Native Instruments Maschine Mikro MK1, MK2, MK3
    if (id.startsWith('ni_maschine_mikro')) {
      // 16 pads on center-right
      const pCols = 4;
      const pStartX = 48, pStartY = 22, pW = 10, pH = 15, pGapX = 2.2, pGapY = 3.2;
      pads.forEach((p, idx) => {
        const col = idx % pCols;
        const row = Math.floor(idx / pCols);
        positions[`pad-${idx}`] = {
          x: pStartX + col * (pW + pGapX),
          y: pStartY + row * (pH + pGapY),
          w: pW, h: pH
        };
      });

      // Master Encoder & Wheel
      knobs.forEach((k, idx) => {
        positions[`knob-${idx}`] = {
          x: 18,
          y: 28 + idx * 24,
          w: 9, h: 14
        };
      });

      // Buttons on left strip
      buttons.forEach((b, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        positions[`button-${idx}`] = {
          x: 8 + col * 16,
          y: 60 + row * 8.5,
          w: 12, h: 6.5
        };
      });
      return positions;
    }

    // 3. Novation Launch Control XL (MK1 & MK2)
    if (id.includes('launchcontrol_xl')) {
      const tracks = 8;
      const colStep = 10.5;
      const startX = 8.5;

      // 24 Knobs in 3 rows
      knobs.forEach((k, idx) => {
        const col = idx % tracks;
        const row = Math.floor(idx / tracks);
        positions[`knob-${idx}`] = {
          x: startX + col * colStep,
          y: 12 + row * 13,
          w: 6.2, h: 9.5
        };
      });

      // 8 Faders
      faders.forEach((f, idx) => {
        positions[`fader-${idx}`] = {
          x: startX + idx * colStep + 0.5,
          y: 54,
          w: 5.5, h: 26
        };
      });

      // 16 Buttons (2 rows of 8)
      buttons.forEach((b, idx) => {
        const col = idx % tracks;
        const row = Math.floor(idx / tracks);
        positions[`button-${idx}`] = {
          x: startX + col * colStep,
          y: 83 + row * 7.5,
          w: 7.2, h: 5.5
        };
      });
      return positions;
    }

    // 4. Novation Launchpad MK2 / Launchpad Pro
    if (id.includes('launchpad')) {
      const grid = 8;
      const startX = 14, startY = 16;
      const pW = 7.8, pH = 7.8, gap = 1.4;

      // 64 Pads
      pads.forEach((p, idx) => {
        const col = idx % grid;
        const row = Math.floor(idx / grid);
        positions[`pad-${idx}`] = {
          x: startX + col * (pW + gap),
          y: startY + row * (pH + gap),
          w: pW, h: pH
        };
      });

      // Buttons (Scene launch buttons on right)
      buttons.forEach((b, idx) => {
        positions[`button-${idx}`] = {
          x: 88,
          y: startY + idx * (pH + gap),
          w: 6.5, h: 6.5
        };
      });
      return positions;
    }

    // 5. Roland TR-8S Rhythm Performer
    if (id.includes('tr8s')) {
      const channels = 11;
      const colStep = 7.8;
      const startX = 6.5;

      // Knobs (Tune, Decay, CTRL)
      knobs.forEach((k, idx) => {
        const col = idx % channels;
        const row = Math.floor(idx / channels);
        positions[`knob-${idx}`] = {
          x: startX + col * colStep,
          y: 14 + row * 12,
          w: 5.4, h: 8.5
        };
      });

      // 11 Level Faders
      faders.forEach((f, idx) => {
        positions[`fader-${idx}`] = {
          x: startX + idx * colStep,
          y: 46,
          w: 5.2, h: 30
        };
      });

      // 11 Instrument Pads / Mute triggers
      pads.forEach((p, idx) => {
        positions[`pad-${idx}`] = {
          x: startX + idx * colStep,
          y: 82,
          w: 6.2, h: 12
        };
      });

      // Extra Buttons
      buttons.forEach((b, idx) => {
        positions[`button-${idx}`] = {
          x: 90 + idx * 4,
          y: 18,
          w: 3.5, h: 5
        };
      });
      return positions;
    }

    // 6. Roland SP-404 MK1, MK2, MK3
    if (id.includes('sp404')) {
      // Top 3 or 4 control knobs
      knobs.slice(0, 4).forEach((k, idx) => {
        positions[`knob-${idx}`] = {
          x: 18 + idx * 19,
          y: 12,
          w: 7.5, h: 11
        };
      });

      // Sample Pads: 3x4 (12 pads) or 4x4 (16 pads)
      const pCols = pads.length > 12 ? 4 : 4;
      const pStartX = 24, pStartY = 38, pW = 10.5, pH = 12, pGapX = 2.5, pGapY = 2.5;
      pads.forEach((p, idx) => {
        const col = idx % pCols;
        const row = Math.floor(idx / pCols);
        positions[`pad-${idx}`] = {
          x: pStartX + col * (pW + pGapX),
          y: pStartY + row * (pH + pGapY),
          w: pW, h: pH
        };
      });

      // Buttons
      buttons.forEach((b, idx) => {
        positions[`button-${idx}`] = {
          x: 8 + (idx % 2) * 10,
          y: 42 + Math.floor(idx / 2) * 11,
          w: 8, h: 7
        };
      });
      return positions;
    }

    // 7. DJ-Tech Kontrol One
    if (id.includes('kontrol_one')) {
      // 4 FX knobs across top
      knobs.slice(0, 4).forEach((k, idx) => {
        positions[`knob-${idx}`] = {
          x: 12 + idx * 21,
          y: 10,
          w: 7.5, h: 11
        };
      });
      // Center Loop Encoder
      if (knobs[4]) positions['knob-4'] = { x: 44, y: 26, w: 9, h: 13 };
      if (knobs[5]) positions['knob-5'] = { x: 78, y: 26, w: 7, h: 10 };

      // Big Jogwheel (represented as a master circular pad)
      positions['jogwheel'] = { x: 26, y: 32, w: 46, h: 36 };

      // Pitch fader on right
      faders.forEach((f, idx) => {
        positions[`fader-${idx}`] = {
          x: 84,
          y: 40,
          w: 7, h: 36
        };
      });

      // 4 Cue Pads
      pads.forEach((p, idx) => {
        positions[`pad-${idx}`] = {
          x: 12 + idx * 18,
          y: 74,
          w: 13, h: 10
        };
      });

      // Buttons (Play, Cue, Sync)
      buttons.forEach((b, idx) => {
        positions[`button-${idx}`] = {
          x: 12 + idx * 18,
          y: 87,
          w: 14, h: 8.5
        };
      });
      return positions;
    }

    // 8. Behringer Edge
    if (id.includes('behringer_edge')) {
      // Dual 8-step sequencer knobs (16 knobs or 8 knobs + 8 pads)
      knobs.forEach((k, idx) => {
        const col = idx % 8;
        const row = Math.floor(idx / 8);
        positions[`knob-${idx}`] = {
          x: 12 + col * 9.8,
          y: 18 + row * 18,
          w: 6.5, h: 10
        };
      });

      // 8 Step Trigger Pads along bottom
      pads.forEach((p, idx) => {
        positions[`pad-${idx}`] = {
          x: 12 + idx * 9.8,
          y: 72,
          w: 7.5, h: 14
        };
      });

      // Buttons
      buttons.forEach((b, idx) => {
        positions[`button-${idx}`] = {
          x: 84 + idx * 4.5,
          y: 52,
          w: 4, h: 6.5
        };
      });
      return positions;
    }

    // 9. Akai LPD8
    if (id.includes('lpd8')) {
      // 8 pads in 2x4 on left
      pads.forEach((p, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        positions[`pad-${idx}`] = {
          x: 8 + col * 10,
          y: 26 + row * 34,
          w: 8.5, h: 26
        };
      });

      // 8 knobs in 2x4 on right
      knobs.forEach((k, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        positions[`knob-${idx}`] = {
          x: 54 + col * 10.5,
          y: 28 + row * 32,
          w: 7, h: 11
        };
      });
      return positions;
    }

    // 10. Akai MIDImix
    if (id.includes('midimix')) {
      const tracks = 8;
      const colStep = 10.5;
      const startX = 8;

      // 24 Knobs in 3 rows
      knobs.forEach((k, idx) => {
        const col = idx % tracks;
        const row = Math.floor(idx / tracks);
        positions[`knob-${idx}`] = {
          x: startX + col * colStep,
          y: 12 + row * 13,
          w: 6, h: 9.5
        };
      });

      // 8 Channel Faders + 1 Master Fader
      faders.forEach((f, idx) => {
        positions[`fader-${idx}`] = {
          x: idx < 8 ? startX + idx * colStep : 92,
          y: 54,
          w: 5.5, h: 26
        };
      });

      // Buttons
      buttons.forEach((b, idx) => {
        const col = idx % tracks;
        const row = Math.floor(idx / tracks);
        positions[`button-${idx}`] = {
          x: startX + col * colStep,
          y: 83 + row * 7.5,
          w: 7.2, h: 5.5
        };
      });
      return positions;
    }

    // 11. Generic / Fallback arrangement
    let curX = 6;
    if (pads.length > 0) {
      const cols = Math.min(8, Math.ceil(Math.sqrt(pads.length)));
      const pW = Math.min(9, 65 / cols);
      const pH = pW * 1.3;
      pads.forEach((p, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        positions[`pad-${idx}`] = {
          x: curX + col * (pW + 2),
          y: 18 + row * (pH + 2.5),
          w: pW, h: pH
        };
      });
      curX += cols * (pW + 2) + 6;
    }

    if (knobs.length > 0) {
      const kCols = Math.min(8, Math.ceil(knobs.length / 3) || 4);
      knobs.forEach((k, idx) => {
        const col = idx % kCols;
        const row = Math.floor(idx / kCols);
        positions[`knob-${idx}`] = {
          x: curX + col * 8.5,
          y: 18 + row * 14,
          w: 6.5, h: 10
        };
      });
      curX += kCols * 8.5 + 6;
    }

    if (faders.length > 0) {
      faders.forEach((f, idx) => {
        positions[`fader-${idx}`] = {
          x: curX + idx * 7,
          y: 35,
          w: 5.5, h: 32
        };
      });
      curX += faders.length * 7 + 6;
    }

    if (buttons.length > 0) {
      buttons.forEach((b, idx) => {
        positions[`button-${idx}`] = {
          x: 6 + (idx % 10) * 8.5,
          y: 82 + Math.floor(idx / 10) * 8,
          w: 7.5, h: 6
        };
      });
    }

    return positions;
  };

  // Retrieves stored custom layout or computes predefaults
  window.getDeviceControlPositions = function(dev) {
    if (!dev) return {};
    try {
      const saved = localStorage.getItem(`mc_layout_${dev.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch(e) {}
    return window.computePredefaultControlPositions(dev);
  };

  // ============================================================
  //  PROCEDURAL VECTOR TOP-VIEW FACEPLATE GENERATOR
  // ============================================================
  // Generates a realistic top-view hardware faceplate graphic (SVG)
  // for any controller when no custom image is uploaded.
  function generateDefaultControllerFaceplateSVG(dev) {
    const id = dev.id || '';
    const name = escapeHtml(dev.name || 'MIDI Controller');
    const mfr = escapeHtml(dev.manufacturer || 'Hardware');

    let bgGrad = 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)';
    let brandColor = '#38bdf8';
    let badgeText = name;

    if (id.startsWith('ni_')) {
      bgGrad = 'linear-gradient(180deg, #18181b 0%, #09090b 100%)';
      brandColor = '#f59e0b';
      badgeText = `NATIVE INSTRUMENTS · ${name.toUpperCase()}`;
    } else if (id.startsWith('novation_')) {
      bgGrad = 'linear-gradient(180deg, #0f172a 0%, #020617 100%)';
      brandColor = '#06b6d4';
      badgeText = `NOVATION · ${name.toUpperCase()}`;
    } else if (id.startsWith('roland_')) {
      bgGrad = 'linear-gradient(180deg, #27272a 0%, #18181b 100%)';
      brandColor = '#f97316';
      badgeText = `ROLAND · ${name.toUpperCase()}`;
    } else if (id.startsWith('behringer_')) {
      bgGrad = 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)';
      brandColor = '#ef4444';
      badgeText = `BEHRINGER · ${name.toUpperCase()}`;
    } else if (id.startsWith('djtech_')) {
      bgGrad = 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)';
      brandColor = '#8b5cf6';
      badgeText = `DJ-TECH · ${name.toUpperCase()}`;
    } else if (id.startsWith('akai_')) {
      bgGrad = 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)';
      brandColor = '#dc2626';
      badgeText = `AKAI PROFESSIONAL · ${name.toUpperCase()}`;
    }

    return `
      <div style="position:absolute; inset:0; pointer-events:none; border-radius:10px; background:${bgGrad}; box-shadow:inset 0 0 40px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(255,255,255,0.06); overflow:hidden;">
        <!-- Top Header Bezel -->
        <div style="position:absolute; top:0; left:0; right:0; height:38px; background:rgba(0,0,0,0.5); border-bottom:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:space-between; padding:0 20px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:8px; height:8px; border-radius:50%; background:${brandColor}; box-shadow:0 0 8px ${brandColor};"></div>
            <span style="font-size:0.75rem; font-weight:800; letter-spacing:1.5px; color:#e2e8f0; text-transform:uppercase;">${badgeText}</span>
          </div>
          <div style="display:flex; align-items:center; gap:16px;">
            <span style="font-size:0.65rem; color:#94a3b8; font-family:monospace; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:4px;">TOP-VIEW ORTHO</span>
            <div style="font-size:0.7rem; color:#64748b; font-family:monospace;">MIDIcontrolz2 SUITE</div>
          </div>
        </div>

        <!-- Corner Screws -->
        <div style="position:absolute; top:8px; left:8px; width:6px; height:6px; border-radius:50%; background:#475569; box-shadow:inset 1px 1px 1px #000;"></div>
        <div style="position:absolute; top:8px; right:8px; width:6px; height:6px; border-radius:50%; background:#475569; box-shadow:inset 1px 1px 1px #000;"></div>
        <div style="position:absolute; bottom:8px; left:8px; width:6px; height:6px; border-radius:50%; background:#475569; box-shadow:inset 1px 1px 1px #000;"></div>
        <div style="position:absolute; bottom:8px; right:8px; width:6px; height:6px; border-radius:50%; background:#475569; box-shadow:inset 1px 1px 1px #000;"></div>

        <!-- Subtle Grid Guidelines -->
        <div style="position:absolute; inset:44px 10px 10px 10px; background-image:radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px); background-size:24px 24px;"></div>
      </div>
    `;
  }

  // ============================================================
  //  RENDER TOP-VIEW MAPPER CANVAS
  // ============================================================
  window.renderSvgMapper = function renderSvgMapper() {
    const container = document.getElementById("svg-mapper-container");
    const section = document.getElementById("midi-mapper-section");
    const dev = getActiveDevice();

    if (!container || !section) return;

    if (!dev) {
      section.style.display = "none";
      container.innerHTML = "";
      return;
    }

    section.style.display = "block";

    // Setup Toolbar HTML if not already injected
    ensureMapperToolbar(dev);

    // Get active preset info
    const presetIndex = getState()?.activePresetIndex ?? 0;
    const preset = dev.defaultPresets?.[presetIndex] ?? {};
    const channel = (preset.channel ?? 0) + 1;

    // Retrieve positions
    const positions = window.getDeviceControlPositions(dev);

    // Check for custom uploaded top-view photo
    const customPhoto = localStorage.getItem(`mc_photo_${dev.id}`);

    // Dynamic Sizing: Generous, responsive, professional
    container.style.position = "relative";
    container.style.width = "100%";
    container.style.minHeight = isWideMode ? "720px" : "580px";
    container.style.maxHeight = isWideMode ? "850px" : "660px";
    container.style.borderRadius = "12px";
    container.style.overflow = "hidden";
    container.style.background = "#090d16";
    container.style.border = isMoveMode ? "2px dashed #f59e0b" : "1px solid var(--border)";
    container.style.boxShadow = "0 8px 30px rgba(0,0,0,0.5)";
    container.style.userSelect = "none";

    let html = "";

    // 1. Background Layer: Either Custom Top-View Image or Procedural Vector Faceplate
    if (customPhoto) {
      html += `
        <div style="position:absolute; inset:0; background-image:url('${customPhoto}'); background-size:contain; background-repeat:no-repeat; background-position:center; filter:brightness(0.95); pointer-events:none; border-radius:10px;"></div>
        <div style="position:absolute; top:10px; right:14px; background:rgba(0,0,0,0.75); border:1px solid rgba(255,255,255,0.15); border-radius:4px; padding:3px 8px; font-size:0.68rem; color:#38bdf8; z-index:5; pointer-events:none;">
          📷 Custom Top-View Active
        </div>
      `;
    } else {
      html += generateDefaultControllerFaceplateSVG(dev);
    }

    // 2. Interactive Overlay Container
    html += `<div id="faceplate-controls-layer" style="position:absolute; inset:0; z-index:10; pointer-events:auto;">`;

    const groups = [
      ["pad", "pads", dev.controls?.pads ?? []],
      ["knob", "knobs", dev.controls?.knobs ?? []],
      ["fader", "faders", dev.controls?.faders ?? []],
      ["button", "buttons", dev.controls?.buttons ?? []]
    ];

    groups.forEach(([type, plural, items]) => {
      items.forEach((item, index) => {
        const key = `${type}-${index}`;
        const pos = positions[key] || { x: 10 + (index % 8) * 10, y: 30 + Math.floor(index / 8) * 15, w: 8, h: 10 };
        const id = `svg-${type}-${index}`;

        const isTarget = window.mapperLearnMode && window.mapperLearnTarget?.type === type && window.mapperLearnTarget?.index === index;
        const liveVal = item._liveValue;
        const isNoteActive = item._liveActive;

        const label = type === "pad"
          ? `Pad ${index + 1} · Note ${item.note ?? "-"} · CC ${item.cc ?? "-"} · Ch ${channel}`
          : `${type.toUpperCase()} ${index + 1} · CC ${item.cc ?? "-"} · Ch ${channel}`;

        const cursorStyle = isMoveMode ? "move" : "pointer";
        const borderGlow = isTarget ? "2px solid #ef4444; box-shadow:0 0 15px #ef4444;" : (isNoteActive ? "2px solid #38bdf8; box-shadow:0 0 18px #38bdf8;" : "1px solid rgba(255,255,255,0.2)");

        if (type === "pad") {
          const padBg = isNoteActive ? "#38bdf8" : (isTarget ? "#ef4444" : "#1e293b");
          const textColor = isNoteActive ? "#000" : "#f8fafc";

          html += `
            <div id="${id}" class="svg-control ${isTarget ? "svg-learning" : ""}" 
                 data-type="${type}" data-index="${index}" data-key="${key}"
                 title="${escapeHtml(label)}"
                 onclick="onFaceplateControlClick('${type}', ${index}, event)"
                 onmousedown="onFaceplateControlMouseDown('${key}', event)"
                 ondragenter="svgDragEnter(event)" ondragleave="svgDragLeave(event)"
                 style="position:absolute; left:${pos.x}%; top:${pos.y}%; width:${pos.w}%; height:${pos.h}%; border-radius:6px; background:${padBg}; border:${borderGlow}; cursor:${cursorStyle}; display:flex; flex-direction:column; align-items:center; justify-content:center; transition:background 0.1s, transform 0.08s; box-shadow:0 3px 6px rgba(0,0,0,0.4); z-index:${isTarget ? 20 : 12};">
              <span style="font-size:0.65rem; font-weight:700; color:${textColor}; pointer-events:none; line-height:1;">P${index + 1}</span>
              <span style="font-size:0.6rem; color:${textColor}; opacity:0.85; pointer-events:none; margin-top:2px;">N${item.note ?? item.cc ?? "-"}</span>
              ${isMoveMode ? '<span style="position:absolute; top:2px; right:2px; font-size:0.55rem; color:#f59e0b; opacity:0.8;">✥</span>' : ''}
            </div>
          `;
        } else if (type === "knob") {
          const rotation = typeof liveVal === "number" ? Math.round((liveVal / 127) * 270 - 135) : -135;
          const knobBg = isTarget ? "#ef4444" : "#1e293b";

          html += `
            <div id="${id}" class="svg-control ${isTarget ? "svg-learning" : ""}"
                 data-type="${type}" data-index="${index}" data-key="${key}"
                 title="${escapeHtml(label)}"
                 onclick="onFaceplateControlClick('${type}', ${index}, event)"
                 onmousedown="onFaceplateControlMouseDown('${key}', event)"
                 ondragenter="svgDragEnter(event)" ondragleave="svgDragLeave(event)"
                 style="position:absolute; left:${pos.x}%; top:${pos.y}%; width:${pos.w}%; height:${pos.h}%; border-radius:50%; background:${knobBg}; border:${borderGlow}; cursor:${cursorStyle}; display:flex; flex-direction:column; align-items:center; justify-content:center; transition:transform 0.08s; box-shadow:0 3px 8px rgba(0,0,0,0.5); z-index:${isTarget ? 20 : 12};">
              <!-- Rotary Dial Notch -->
              <div style="position:absolute; width:2px; height:45%; background:#38bdf8; top:6%; transform:rotate(${rotation}deg); transform-origin:bottom center; pointer-events:none;"></div>
              <span style="font-size:0.58rem; font-weight:700; color:#f8fafc; pointer-events:none; margin-top:14px;">CC${item.cc ?? "-"}</span>
              ${isMoveMode ? '<span style="position:absolute; top:1px; right:1px; font-size:0.5rem; color:#f59e0b;">✥</span>' : ''}
            </div>
          `;
        } else if (type === "fader") {
          const faderPercent = typeof liveVal === "number" ? Math.round((liveVal / 127) * 80) : 20;

          html += `
            <div id="${id}" class="svg-control ${isTarget ? "svg-learning" : ""}"
                 data-type="${type}" data-index="${index}" data-key="${key}"
                 title="${escapeHtml(label)}"
                 onclick="onFaceplateControlClick('${type}', ${index}, event)"
                 onmousedown="onFaceplateControlMouseDown('${key}', event)"
                 ondragenter="svgDragEnter(event)" ondragleave="svgDragLeave(event)"
                 style="position:absolute; left:${pos.x}%; top:${pos.y}%; width:${pos.w}%; height:${pos.h}%; border-radius:4px; background:#0f172a; border:${borderGlow}; cursor:${cursorStyle}; display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:3px 0; z-index:${isTarget ? 20 : 12};">
              <!-- Fader Track -->
              <div style="position:absolute; top:6px; bottom:6px; width:4px; background:#334155; border-radius:2px; pointer-events:none;"></div>
              <!-- Fader Cap -->
              <div style="position:absolute; bottom:${faderPercent}%; width:90%; height:14px; background:#94a3b8; border-radius:2px; border:1px solid #cbd5e1; box-shadow:0 2px 5px rgba(0,0,0,0.5); pointer-events:none;"></div>
              <span style="font-size:0.55rem; color:#94a3b8; margin-top:auto; pointer-events:none; z-index:2;">CC${item.cc ?? "-"}</span>
              ${isMoveMode ? '<span style="position:absolute; top:1px; right:1px; font-size:0.5rem; color:#f59e0b;">✥</span>' : ''}
            </div>
          `;
        } else {
          // Button
          const btnBg = isNoteActive ? "#10b981" : (isTarget ? "#ef4444" : "#1e293b");
          html += `
            <div id="${id}" class="svg-control ${isTarget ? "svg-learning" : ""}"
                 data-type="${type}" data-index="${index}" data-key="${key}"
                 title="${escapeHtml(label)}"
                 onclick="onFaceplateControlClick('${type}', ${index}, event)"
                 onmousedown="onFaceplateControlMouseDown('${key}', event)"
                 ondragenter="svgDragEnter(event)" ondragleave="svgDragLeave(event)"
                 style="position:absolute; left:${pos.x}%; top:${pos.y}%; width:${pos.w}%; height:${pos.h}%; border-radius:4px; background:${btnBg}; border:${borderGlow}; cursor:${cursorStyle}; display:flex; align-items:center; justify-content:center; padding:2px; z-index:${isTarget ? 20 : 12};">
              <span style="font-size:0.58rem; color:#f8fafc; pointer-events:none; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.label || 'B' + (index + 1)}</span>
              ${isMoveMode ? '<span style="position:absolute; top:0; right:1px; font-size:0.5rem; color:#f59e0b;">✥</span>' : ''}
            </div>
          `;
        }
      });
    });

    html += `</div>`; // End faceplate-controls-layer
    container.innerHTML = html;
  };

  // ============================================================
  //  TOOLBAR & CONTROLLER PICTURE UPLOAD ROUTINES
  // ============================================================
  function ensureMapperToolbar(dev) {
    let toolbar = document.getElementById("mapper-toolbar-controls");
    if (!toolbar) {
      const section = document.getElementById("midi-mapper-section");
      if (!section) return;

      const headerDiv = section.querySelector("div");
      if (headerDiv) {
        toolbar = document.createElement("div");
        toolbar.id = "mapper-toolbar-controls";
        toolbar.style.cssText = "display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:8px; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.08);";
        headerDiv.insertAdjacentElement("afterend", toolbar);
      }
    }

    if (!toolbar) return;

    const hasCustomPhoto = !!localStorage.getItem(`mc_photo_${dev.id}`);

    toolbar.innerHTML = `
      <button class="btn sm ${isMoveMode ? 'warning' : ''}" id="btn-toggle-move-mode" onclick="toggleMoveMode()" title="Toggle free placement of controls on the top-view faceplate">
        ${isMoveMode ? '✋ Move Controls: ACTIVE' : '🎛️ Mode: Map & Learn'}
      </button>

      <button class="btn sm" onclick="autoPlaceControls()" title="Mathematically align all controls to predefault ergonomic positions">
        🔄 Auto-Place Controls
      </button>

      <button class="btn sm" onclick="openUploadFaceplateModal()" title="Upload a custom top-view orthographic picture of your controller">
        📷 Upload Top-View Photo
      </button>

      ${hasCustomPhoto ? `
        <button class="btn sm danger" onclick="resetDefaultArtwork()" title="Remove custom photo and restore vector artwork">
          ↺ Reset Artwork
        </button>
      ` : ''}

      <label style="display:flex; align-items:center; gap:4px; font-size:0.75rem; color:var(--text2); margin-left:auto; cursor:pointer;">
        <input type="checkbox" ${isSnapToGrid ? 'checked' : ''} onchange="toggleSnapGrid(this.checked)">
        Snap Grid (2%)
      </label>

      <button class="btn sm" onclick="toggleWideMode()" title="Expand mapping canvas width and height">
        ${isWideMode ? '🗗 Standard Size' : '🗖 Expand Canvas'}
      </button>
    `;
  }

  window.toggleMoveMode = function() {
    isMoveMode = !isMoveMode;
    if (isMoveMode) {
      window.mapperLearnMode = false;
      window.mapperLearnTarget = null;
      notify("Move Mode Active: Drag any control on the faceplate to position it on your photo.", "info");
    } else {
      notify("Map & Learn Mode Active: Click controls to map, drag CC tokens, or arm MIDI Learn.", "info");
    }
    window.renderSvgMapper?.();
  };

  window.toggleSnapGrid = function(checked) {
    isSnapToGrid = checked;
    notify(`Snap to Grid ${checked ? 'Enabled (2%)' : 'Disabled'}`, 'info');
  };

  window.toggleWideMode = function() {
    isWideMode = !isWideMode;
    window.renderSvgMapper?.();
  };

  window.autoPlaceControls = function() {
    const dev = getActiveDevice();
    if (!dev) return;
    const defaults = window.computePredefaultControlPositions(dev);
    localStorage.setItem(`mc_layout_${dev.id}`, JSON.stringify(defaults));
    notify(`Auto-arranged all controls on ${dev.name} faceplate.`, "success");
    window.renderSvgMapper?.();
  };

  window.resetDefaultArtwork = function() {
    const dev = getActiveDevice();
    if (!dev) return;
    if (!confirm(`Remove uploaded photo and restore standard vector faceplate for ${dev.name}?`)) return;
    localStorage.removeItem(`mc_photo_${dev.id}`);
    notify("Restored default vector artwork.", "info");
    window.renderSvgMapper?.();
  };

  // ============================================================
  //  UPLOAD TOP-VIEW MODAL WITH MANDATORY NOTICE
  // ============================================================
  window.openUploadFaceplateModal = function() {
    const dev = getActiveDevice();
    if (!dev) {
      notify("Select a device first.", "error");
      return;
    }

    const currentImg = localStorage.getItem(`mc_photo_${dev.id}`);

    const html = `
      <div style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
        <h2 style="margin:0; font-size:1.15rem;">📷 Controller Faceplate Photo Upload</h2>
        <button class="btn sm" onclick="closeModal()">✕</button>
      </div>

      <!-- MANDATORY TOP-VIEW NOTIFICATION BANNER -->
      <div style="background:rgba(245, 158, 11, 0.12); border:1px solid #f59e0b; border-radius:8px; padding:12px 14px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:8px; color:#f59e0b; font-weight:700; font-size:0.88rem; margin-bottom:4px;">
          <span>⚠️</span>
          <span>MANDATORY REQUIREMENT: STRAIGHT TOP-VIEW PHOTO</span>
        </div>
        <p style="margin:0; font-size:0.8rem; color:#e2e8f0; line-height:1.4;">
          The uploaded image <strong>MUST be a straight top-view picture (orthographic 90° overhead angle)</strong> of your hardware controller.
        </p>
        <ul style="margin:6px 0 0 16px; padding:0; font-size:0.75rem; color:#cbd5e1; line-height:1.4;">
          <li>Perspective or angled photos will cause overlay pads, knobs, and faders to be misaligned.</li>
          <li>Ensure good, even lighting with minimal shadow or glare.</li>
          <li>Crop the image tightly to the perimeter of the physical controller chassis.</li>
          <li>Supported formats: PNG, JPG, WebP, SVG.</li>
        </ul>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block; font-size:0.8rem; font-weight:600; color:var(--text2); margin-bottom:6px;">Select Top-View Image File:</label>
        <input type="file" id="faceplate-file-input" accept="image/*" onchange="previewUploadedFaceplate(event)" style="display:block; width:100%; font-size:0.8rem; padding:8px; background:var(--surface3); border:1px solid var(--border); border-radius:6px; color:var(--text);">
      </div>

      <!-- Image Preview Area -->
      <div id="faceplate-preview-container" style="margin-bottom:16px; min-height:180px; max-height:240px; background:#090d16; border:1px dashed var(--border); border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;">
        ${currentImg 
          ? `<img id="faceplate-preview-img" src="${currentImg}" style="max-width:100%; max-height:220px; object-fit:contain;">`
          : '<span id="faceplate-preview-placeholder" style="color:var(--text3); font-size:0.8rem;">No custom image selected yet. Default vector artwork will be used.</span>'
        }
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn" onclick="closeModal()">Cancel</button>
        ${currentImg ? `<button class="btn danger" onclick="resetDefaultArtwork(); closeModal();">Reset to Default</button>` : ''}
        <button class="btn primary" onclick="applyUploadedFaceplate()">Apply Faceplate</button>
      </div>
    `;

    if (typeof window.openModal === 'function') {
      window.openModal(html);
    }
  };

  let _pendingFaceplateDataUrl = null;

  window.previewUploadedFaceplate = function(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      _pendingFaceplateDataUrl = e.target.result;
      const container = document.getElementById("faceplate-preview-container");
      if (container) {
        container.innerHTML = `<img src="${_pendingFaceplateDataUrl}" style="max-width:100%; max-height:220px; object-fit:contain; border-radius:4px;">`;
      }
    };
    reader.readAsDataURL(file);
  };

  window.applyUploadedFaceplate = function() {
    const dev = getActiveDevice();
    if (!dev) return;

    if (!_pendingFaceplateDataUrl) {
      notify("Please select an image file first.", "error");
      return;
    }

    try {
      localStorage.setItem(`mc_photo_${dev.id}`, _pendingFaceplateDataUrl);
      notify(`Top-view picture successfully applied to ${dev.name}.`, "success");
      if (typeof window.closeModal === 'function') window.closeModal();
      window.renderSvgMapper?.();
    } catch(e) {
      notify("Failed to store image: image file may be too large for storage. Please compress slightly.", "error");
    }
  };

  // ============================================================
  //  MOUSE DRAG & MOVE INTERACTION ON FACEPLATE
  // ============================================================
  window.onFaceplateControlMouseDown = function(key, event) {
    if (!isMoveMode) return;
    event.preventDefault();
    event.stopPropagation();

    const container = document.getElementById("svg-mapper-container");
    if (!container) return;

    const dev = getActiveDevice();
    if (!dev) return;

    const positions = window.getDeviceControlPositions(dev);
    const curPos = positions[key] || { x: 50, y: 50, w: 8, h: 10 };

    activeDragControl = { key, pos: curPos };

    const rect = container.getBoundingClientRect();
    const mouseXPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const mouseYPercent = ((event.clientY - rect.top) / rect.height) * 100;

    dragOffset = {
      x: mouseXPercent - curPos.x,
      y: mouseYPercent - curPos.y
    };

    window.addEventListener("mousemove", onFaceplateControlMouseMove);
    window.addEventListener("mouseup", onFaceplateControlMouseUp);
  };

  function onFaceplateControlMouseMove(event) {
    if (!activeDragControl) return;

    const container = document.getElementById("svg-mapper-container");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let newX = ((event.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    let newY = ((event.clientY - rect.top) / rect.height) * 100 - dragOffset.y;

    if (isSnapToGrid) {
      newX = Math.round(newX / 2) * 2;
      newY = Math.round(newY / 2) * 2;
    }

    newX = Math.max(1, Math.min(94, newX));
    newY = Math.max(4, Math.min(92, newY));

    activeDragControl.pos.x = parseFloat(newX.toFixed(1));
    activeDragControl.pos.y = parseFloat(newY.toFixed(1));

    // Update DOM directly for smooth 60fps drag
    const el = document.querySelector(`[data-key="${activeDragControl.key}"]`);
    if (el) {
      el.style.left = `${newX}%`;
      el.style.top = `${newY}%`;
    }
  }

  function onFaceplateControlMouseUp() {
    if (activeDragControl) {
      const dev = getActiveDevice();
      if (dev) {
        const positions = window.getDeviceControlPositions(dev);
        positions[activeDragControl.key] = { ...activeDragControl.pos };
        localStorage.setItem(`mc_layout_${dev.id}`, JSON.stringify(positions));
      }
      activeDragControl = null;
    }
    window.removeEventListener("mousemove", onFaceplateControlMouseMove);
    window.removeEventListener("mouseup", onFaceplateControlMouseUp);
  }

  // ============================================================
  //  CLICK HANDLING: MAPPING & LEARN
  // ============================================================
  window.onFaceplateControlClick = function(type, index, event) {
    if (isMoveMode) return; // ignore mapping clicks when in move mode
    event.stopPropagation();

    const dev = getActiveDevice();
    const controls = dev?.controls?.[type === "button" ? "buttons" : `${type}s`];
    if (!Array.isArray(controls) || !controls[index]) return;

    if (window.mapperLearnMode) {
      window.mapperLearnTarget = { type, index };
      window.renderSvgMapper?.();
      notify(`Waiting for MIDI input to map ${type.toUpperCase()} ${index + 1}...`, "info");
      return;
    }

    // Direct value prompt
    const current = type === "pad"
      ? controls[index].note ?? controls[index].cc ?? 0
      : controls[index].cc ?? 0;

    const response = window.prompt(
      `Configure ${type.toUpperCase()} ${index + 1}: Enter MIDI ${type === "pad" ? "Note / CC" : "CC"} (0–127):`,
      String(current)
    );

    if (response === null) return;
    const val = Number(response);
    if (!Number.isInteger(val) || val < 0 || val > 127) {
      notify("Please enter a valid MIDI value between 0 and 127.", "error");
      return;
    }

    controls[index].cc = val;
    if (type === "pad") controls[index].note = val;

    save();
    syncLog(`Updated ${type} ${index + 1} mapping to ${val}`);
    notify(`Updated ${type} ${index + 1} to value ${val}.`, "success");
    refreshMapper();
  };

  // ============================================================
  //  DRAG & DROP CC TOKENS ONTO CONTROLS
  // ============================================================
  window.dragCC = function dragCC(event) {
    draggedCC = event.currentTarget?.dataset?.cc ?? null;
    if (draggedCC && event.dataTransfer) {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/plain", draggedCC);
    }
  };

  window.allowDrop = function allowDrop(event) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    const container = document.getElementById('svg-mapper-container');
    if (container) container.classList.add('container-glow');
  };

  window.svgDragEnter = function svgDragEnter(event) {
    event.preventDefault();
    event.currentTarget?.classList?.add("svg-drop-target");
  };

  window.svgDragLeave = function svgDragLeave(event) {
    event.preventDefault();
    event.currentTarget?.classList?.remove("svg-drop-target");
  };

  window.dropOnSvg = function dropOnSvg(event) {
    event.preventDefault();
    const target = event.target.closest?.(".svg-control");
    target?.classList?.remove("svg-drop-target");

    const value = Number(
      event.dataTransfer?.getData("text/plain") || draggedCC
    );
    if (!Number.isInteger(value) || value < 0 || value > 127) return;

    const type = target?.dataset?.type;
    const index = Number(target?.dataset?.index);
    if (!type || isNaN(index)) return;

    const dev = getActiveDevice();
    const controls = dev?.controls?.[type === "button" ? "buttons" : `${type}s`];
    if (!Array.isArray(controls) || !controls[index]) return;

    controls[index].cc = value;
    if (type === "pad") controls[index].note = value;

    save();
    syncLog(`Mapped CC ${value} to ${type} ${index + 1}`);
    notify(`Mapped CC ${value} to ${type} ${index + 1}.`, "success");
    refreshMapper();
  };

  // ============================================================
  //  MIDI LEARN & LIVE ACTIVITY HOOK
  // ============================================================
  window.toggleMapperLearn = function toggleMapperLearn() {
    window.mapperLearnMode = !window.mapperLearnMode;
    if (!window.mapperLearnMode) {
      window.mapperLearnTarget = null;
    }

    const button = document.getElementById("btn-mapper-learn");
    if (button) {
      button.innerHTML = window.mapperLearnMode
        ? "<span class='svg-learning' style='display:inline-block; border-radius:50%;'>🔴</span> Learning..."
        : "🎛 Learn: OFF";
      button.classList.toggle("primary", window.mapperLearnMode);
    }

    window.renderSvgMapper?.();
    notify(
      window.mapperLearnMode
        ? "Mapper MIDI Learn active. Click any control on the faceplate to arm it."
        : "Mapper MIDI Learn disabled.",
      "info"
    );
  };

  window.handleMapperMidiLearn = function handleMapperMidiLearn(data) {
    const target = window.mapperLearnTarget;
    if (!target || !data?.length) return false;

    const status = data[0];
    const messageType = status >> 4;
    const channel = (status & 0x0f) + 1;
    const isCC = messageType === 0x0b;
    const isNoteOn = messageType === 0x09 && data[2] > 0;

    if (!isCC && !isNoteOn) return false;

    const dev = getActiveDevice();
    const controls = dev?.controls?.[target.type === "button" ? "buttons" : `${target.type}s`];
    if (!Array.isArray(controls) || !controls[target.index]) return false;

    const value = data[1];
    controls[target.index].cc = value;
    if (target.type === "pad") controls[target.index].note = value;

    window.mapperLearnTarget = null;
    save();
    syncLog(`Mapped ${target.type} ${target.index + 1} to ${isCC ? "CC" : "note"} ${value}`);
    notify(
      `Mapped ${target.type} ${target.index + 1} to ${isCC ? "CC" : "note"} ${value} on channel ${channel}.`,
      "success"
    );
    refreshMapper();
    return true;
  };

  // Real-time animation hook when MIDI In arrives
  window.animateFaceplateMidiActivity = function(status, byte1, byte2) {
    const dev = getActiveDevice();
    if (!dev) return;

    const msgType = status >> 4;
    const isNoteOn = msgType === 0x09 && byte2 > 0;
    const isNoteOff = msgType === 0x08 || (msgType === 0x09 && byte2 === 0);
    const isCC = msgType === 0x0b;

    if (isNoteOn || isNoteOff) {
      const pads = dev.controls?.pads || [];
      pads.forEach((p, idx) => {
        if (p.note === byte1 || p.cc === byte1) {
          const el = document.getElementById(`svg-pad-${idx}`);
          if (el) {
            el.style.background = isNoteOn ? "#38bdf8" : "#1e293b";
            el.style.transform = isNoteOn ? "scale(0.94)" : "scale(1)";
          }
        }
      });
    } else if (isCC) {
      // Check knobs
      const knobs = dev.controls?.knobs || [];
      knobs.forEach((k, idx) => {
        if (k.cc === byte1) {
          const el = document.getElementById(`svg-knob-${idx}`);
          if (el) {
            const rot = Math.round((byte2 / 127) * 270 - 135);
            const notch = el.querySelector("div");
            if (notch) notch.style.transform = `rotate(${rot}deg)`;
            el.style.boxShadow = "0 0 12px #38bdf8";
            setTimeout(() => { if (el) el.style.boxShadow = "0 3px 8px rgba(0,0,0,0.5)"; }, 200);
          }
        }
      });

      // Check faders
      const faders = dev.controls?.faders || [];
      faders.forEach((f, idx) => {
        if (f.cc === byte1) {
          const el = document.getElementById(`svg-fader-${idx}`);
          if (el) {
            const cap = el.querySelectorAll("div")[1];
            if (cap) cap.style.bottom = `${Math.round((byte2 / 127) * 80)}%`;
          }
        }
      });
    }
  };

  // Export visual mapping JSON
  window.exportSvgMapping = function exportSvgMapping() {
    const dev = getActiveDevice();
    if (!dev) {
      notify("Select a device first.", "error");
      return;
    }

    const positions = window.getDeviceControlPositions(dev);
    const payload = {
      device: {
        id: dev.id,
        name: dev.name,
        manufacturer: dev.manufacturer ?? null
      },
      positions,
      hasCustomPhoto: !!localStorage.getItem(`mc_photo_${dev.id}`),
      controls: dev.controls,
      exported: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const name = String(dev.name || dev.id || "device").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}-topview-mapping.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify("Top-view mapping configuration exported.", "success");
  };

})();
