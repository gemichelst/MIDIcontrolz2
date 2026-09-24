(() => {
  "use strict";

  let draggedCC = null;
  let heatmapMode = false;
  let isMoveMode = false;
  let isSnapToGrid = true;
  let isWideMode = false;
  let activeDragControl = null;
  let dragOffset = { x: 0, y: 0 };
  let _mapperResizeObserver = null;

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
  //  SCREEN RESOLUTION & FACEPLATE GEOMETRY CALCULATION ENGINE
  // ============================================================
  window.detectFaceplateGeometry = function(container, dev, forcedMeta = null) {
    const screenW = window.screen?.width || window.innerWidth || 1920;
    const screenH = window.screen?.height || window.innerHeight || 1080;
    const dpr = parseFloat((window.devicePixelRatio || 1).toFixed(2));
    const containerW = (container && container.clientWidth > 100) ? container.clientWidth : 960;
    const containerH = isWideMode ? 740 : 580;

    const customPhoto = dev ? localStorage.getItem(`mc_photo_${dev.id}`) : null;
    let photoMeta = forcedMeta;
    if (!photoMeta && dev) {
      try {
        const raw = localStorage.getItem(`mc_photo_meta_${dev.id}`);
        if (raw) photoMeta = JSON.parse(raw);
      } catch(e) {}
    }

    // Determine intrinsic aspect ratio of faceplate (width / height)
    let imgAspect = 1.6; // Default standard landscape
    if (photoMeta && photoMeta.aspect) {
      imgAspect = photoMeta.aspect;
    } else if (dev) {
      const id = dev.id || '';
      if (id.includes('launchcontrol_xl') || id.includes('midimix')) {
        imgAspect = 2.15; // Wide channel strip
      } else if (id.includes('kontrol_one')) {
        imgAspect = 0.68; // Vertical DJ deck
      } else if (id.includes('tr8s')) {
        imgAspect = 1.85; // Wide rhythm performer
      } else if (id.includes('behringer_edge')) {
        imgAspect = 1.7;  // Wide desktop synth
      } else if (id.includes('maschine') || id.includes('sp404') || id.includes('launchpad')) {
        imgAspect = 1.25; // Compact/square groovebox
      }
    }

    // Fit viewport inside container maintaining exact aspect ratio
    const containerAspect = containerW / containerH;
    let viewW, viewH, offX, offY;

    if (imgAspect > containerAspect) {
      viewW = containerW;
      viewH = Math.round(containerW / imgAspect);
      offX = 0;
      offY = Math.max(0, Math.round((containerH - viewH) / 2));
    } else {
      viewH = containerH;
      viewW = Math.round(containerH * imgAspect);
      offX = Math.max(0, Math.round((containerW - viewW) / 2));
      offY = 0;
    }

    // Calculate aspect-corrected control overlay sizes scaled to resolution & viewport
    // Circular knob: keep diameter proportional to viewport width & lock aspect-ratio
    const knobPx = Math.max(26, Math.min(54, Math.round(viewW * 0.054)));
    const knobWPct = parseFloat(((knobPx / viewW) * 100).toFixed(2));
    const knobHPct = parseFloat(((knobPx / viewH) * 100).toFixed(2));

    // Vertical fader: track scaled to viewport height & channel width
    const faderWPx = Math.max(18, Math.min(34, Math.round(viewW * 0.038)));
    const faderHPx = Math.max(76, Math.min(180, Math.round(viewH * 0.28)));
    const faderWPct = parseFloat(((faderWPx / viewW) * 100).toFixed(2));
    const faderHPct = parseFloat(((faderHPx / viewH) * 100).toFixed(2));

    // Square pad (1:1)
    const padPx = Math.max(32, Math.min(74, Math.round(viewW * 0.084)));
    const padWPct = parseFloat(((padPx / viewW) * 100).toFixed(2));
    const padHPct = parseFloat(((padPx / viewH) * 100).toFixed(2));

    // Buttons
    const btnWPx = Math.max(30, Math.min(78, Math.round(viewW * 0.076)));
    const btnHPx = Math.max(20, Math.min(36, Math.round(viewH * 0.046)));
    const btnWPct = parseFloat(((btnWPx / viewW) * 100).toFixed(2));
    const btnHPct = parseFloat(((btnHPx / viewH) * 100).toFixed(2));

    return {
      screenW,
      screenH,
      dpr,
      containerW,
      containerH,
      viewW,
      viewH,
      offX,
      offY,
      imgAspect,
      photoMeta,
      hasCustomPhoto: !!customPhoto,
      customPhoto,
      knobWPct,
      knobHPct,
      faderWPct,
      faderHPct,
      padWPct,
      padHPct,
      btnWPct,
      btnHPct
    };
  };

  // ============================================================
  //  DEVICE CONTROL POSITIONS RETRIEVAL & STORAGE
  // ============================================================
  window.getDeviceControlPositions = function(dev) {
    if (!dev) return {};
    const raw = localStorage.getItem(`mc_layout_${dev.id}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn("[Mapper] Failed to parse custom layout", e);
      }
    }
    return window.computePredefaultControlPositions(dev);
  };

  // ============================================================
  //  AUTOMATIC OVERLAY CALCULATION ROUTINE
  // ============================================================
  // Recalculates control overlay positions and dimensions dynamically based
  // on detected screen resolution and user-uploaded faceplate image dimensions.
  window.autoCalculateOverlayLayout = function(dev, forcedMeta = null) {
    if (!dev) dev = getActiveDevice();
    if (!dev) return {};

    const container = document.getElementById("svg-mapper-container");
    const geom = window.detectFaceplateGeometry(container || { clientWidth: 960 }, dev, forcedMeta);

    const positions = window.computePredefaultControlPositions(dev, geom);
    localStorage.setItem(`mc_layout_${dev.id}`, JSON.stringify(positions));
    return positions;
  };

  // ============================================================
  //  PREDEFAULT CONTROL PLACEMENT ROUTINE
  // ============================================================
  // Calculates mathematically stable, ergonomic top-view coordinates (%)
  // calibrated to the detected viewport geometry and image dimensions.
  window.computePredefaultControlPositions = function(dev, geom = null) {
    if (!dev) return {};
    const id = dev.id || '';
    const pads = dev.controls?.pads || [];
    const knobs = dev.controls?.knobs || [];
    const faders = dev.controls?.faders || [];
    const buttons = dev.controls?.buttons || [];
    const positions = {};

    if (!geom) {
      const container = document.getElementById("svg-mapper-container");
      geom = window.detectFaceplateGeometry(container || { clientWidth: 960 }, dev);
    }

    const kW = geom.knobWPct;
    const kH = geom.knobHPct;
    const fW = geom.faderWPct;
    const fH = geom.faderHPct;
    const pW = geom.padWPct;
    const pH = geom.padHPct;
    const bW = geom.btnWPct;
    const bH = geom.btnHPct;
    const aspect = geom.imgAspect;

    // 1. Native Instruments Maschine MK1, MK2, MK3
    if (id.startsWith('ni_maschine_mk')) {
      const pCols = 4;
      const pStartX = aspect > 1.4 ? 60 : 54;
      const pStartY = 28;
      const pGapX = 1.6;
      const pGapY = 2.2;
      pads.forEach((p, idx) => {
        const col = idx % pCols;
        const row = Math.floor(idx / pCols);
        positions[`pad-${idx}`] = {
          x: parseFloat((pStartX + col * (pW + pGapX)).toFixed(1)),
          y: parseFloat((pStartY + row * (pH + pGapY)).toFixed(1)),
          w: pW, h: pH
        };
      });

      // 8 Encoders across middle-left
      knobs.slice(0, 8).forEach((k, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        positions[`knob-${idx}`] = {
          x: parseFloat((16 + col * (kW + 3.2)).toFixed(1)),
          y: parseFloat((42 + row * (kH + 7.5)).toFixed(1)),
          w: kW, h: kH
        };
      });
      if (knobs[8]) positions['knob-8'] = { x: 7, y: 38, w: kW, h: kH };
      if (knobs[9]) positions['knob-9'] = { x: 7, y: 56, w: kW, h: kH };

      // Buttons
      buttons.forEach((b, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        positions[`button-${idx}`] = {
          x: parseFloat((6 + col * (bW + 2)).toFixed(1)),
          y: parseFloat((80 + row * (bH + 2.5)).toFixed(1)),
          w: bW, h: bH
        };
      });
      return positions;
    }

    // 2. Native Instruments Maschine Mikro MK1, MK2, MK3
    if (id.startsWith('ni_maschine_mikro')) {
      const pCols = 4;
      const pStartX = aspect > 1.3 ? 50 : 44;
      const pStartY = 22;
      const pGapX = 1.8;
      const pGapY = 2.8;
      pads.forEach((p, idx) => {
        const col = idx % pCols;
        const row = Math.floor(idx / pCols);
        positions[`pad-${idx}`] = {
          x: parseFloat((pStartX + col * (pW + pGapX)).toFixed(1)),
          y: parseFloat((pStartY + row * (pH + pGapY)).toFixed(1)),
          w: pW, h: pH
        };
      });

      knobs.forEach((k, idx) => {
        positions[`knob-${idx}`] = {
          x: 18,
          y: parseFloat((28 + idx * (kH + 12)).toFixed(1)),
          w: kW * 1.3, h: kH * 1.3
        };
      });

      buttons.forEach((b, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        positions[`button-${idx}`] = {
          x: parseFloat((8 + col * (bW + 2.5)).toFixed(1)),
          y: parseFloat((62 + row * (bH + 2)).toFixed(1)),
          w: bW, h: bH
        };
      });
      return positions;
    }

    // 3. Novation Launch Control XL (MK1 & MK2)
    if (id.includes('launchcontrol_xl')) {
      const tracks = 8;
      const startX = 7.5;
      const colStep = (100 - startX * 2) / tracks;

      // 24 Knobs in 3 rows
      knobs.forEach((k, idx) => {
        const col = idx % tracks;
        const row = Math.floor(idx / tracks);
        positions[`knob-${idx}`] = {
          x: parseFloat((startX + col * colStep + (colStep - kW) / 2).toFixed(1)),
          y: parseFloat((10 + row * (kH + 2.8)).toFixed(1)),
          w: kW, h: kH
        };
      });

      // 8 Faders aligned to each column
      faders.forEach((f, idx) => {
        positions[`fader-${idx}`] = {
          x: parseFloat((startX + idx * colStep + (colStep - fW) / 2).toFixed(1)),
          y: 52,
          w: fW, h: fH
        };
      });

      // 16 Buttons (2 rows of 8)
      buttons.forEach((b, idx) => {
        const col = idx % tracks;
        const row = Math.floor(idx / tracks);
        positions[`button-${idx}`] = {
          x: parseFloat((startX + col * colStep + (colStep - bW) / 2).toFixed(1)),
          y: parseFloat((82 + row * (bH + 1.8)).toFixed(1)),
          w: bW, h: bH
        };
      });
      return positions;
    }

    // 4. Novation Launchpad MK2 / Launchpad Pro
    if (id.includes('launchpad')) {
      const grid = 8;
      const startX = 12, startY = 14;
      const gap = 1.2;

      pads.forEach((p, idx) => {
        const col = idx % grid;
        const row = Math.floor(idx / grid);
        positions[`pad-${idx}`] = {
          x: parseFloat((startX + col * (pW + gap)).toFixed(1)),
          y: parseFloat((startY + row * (pH + gap)).toFixed(1)),
          w: pW, h: pH
        };
      });

      buttons.forEach((b, idx) => {
        positions[`button-${idx}`] = {
          x: parseFloat((startX + grid * (pW + gap) + 1.5).toFixed(1)),
          y: parseFloat((startY + idx * (pH + gap)).toFixed(1)),
          w: bW * 0.8, h: bH * 0.8
        };
      });
      return positions;
    }

    // 5. Roland TR-8S Rhythm Performer
    if (id.includes('tr8s')) {
      const channels = 11;
      const startX = 5.5;
      const colStep = (100 - startX * 2) / channels;

      // Knobs (Tune, Decay, CTRL)
      knobs.forEach((k, idx) => {
        const col = idx % channels;
        const row = Math.floor(idx / channels);
        positions[`knob-${idx}`] = {
          x: parseFloat((startX + col * colStep + (colStep - kW) / 2).toFixed(1)),
          y: parseFloat((12 + row * (kH + 2.2)).toFixed(1)),
          w: kW, h: kH
        };
      });

      // 11 Level Faders
      faders.forEach((f, idx) => {
        positions[`fader-${idx}`] = {
          x: parseFloat((startX + idx * colStep + (colStep - fW) / 2).toFixed(1)),
          y: 44,
          w: fW, h: fH
        };
      });

      // 11 Instrument Trigger Pads
      pads.forEach((p, idx) => {
        positions[`pad-${idx}`] = {
          x: parseFloat((startX + idx * colStep + (colStep - pW) / 2).toFixed(1)),
          y: 80,
          w: pW, h: pH * 0.85
        };
      });

      buttons.forEach((b, idx) => {
        positions[`button-${idx}`] = {
          x: parseFloat((90 + idx * 3.8).toFixed(1)),
          y: 18,
          w: bW * 0.6, h: bH * 0.7
        };
      });
      return positions;
    }

    // 6. Roland SP-404 MK1, MK2, MK3
    if (id.includes('sp404')) {
      // Top control knobs
      knobs.slice(0, 4).forEach((k, idx) => {
        positions[`knob-${idx}`] = {
          x: parseFloat((18 + idx * 19).toFixed(1)),
          y: 12,
          w: kW * 1.15, h: kH * 1.15
        };
      });

      // Sample Pads: 4x4 matrix
      const pCols = 4;
      const pStartX = 24, pStartY = 38;
      const pGapX = 2.2, pGapY = 2.2;
      pads.forEach((p, idx) => {
        const col = idx % pCols;
        const row = Math.floor(idx / pCols);
        positions[`pad-${idx}`] = {
          x: parseFloat((pStartX + col * (pW + pGapX)).toFixed(1)),
          y: parseFloat((pStartY + row * (pH + pGapY)).toFixed(1)),
          w: pW, h: pH
        };
      });

      buttons.forEach((b, idx) => {
        positions[`button-${idx}`] = {
          x: parseFloat((8 + (idx % 2) * 10).toFixed(1)),
          y: parseFloat((42 + Math.floor(idx / 2) * 10).toFixed(1)),
          w: bW, h: bH
        };
      });
      return positions;
    }

    // 7. DJ-Tech Kontrol One
    if (id.includes('kontrol_one')) {
      knobs.slice(0, 4).forEach((k, idx) => {
        positions[`knob-${idx}`] = {
          x: parseFloat((14 + idx * 20).toFixed(1)),
          y: 9,
          w: kW * 1.2, h: kH * 1.2
        };
      });
      if (knobs[4]) positions['knob-4'] = { x: 44, y: 24, w: kW * 1.3, h: kH * 1.3 };
      if (knobs[5]) positions['knob-5'] = { x: 76, y: 24, w: kW, h: kH };

      positions['jogwheel'] = { x: 26, y: 32, w: 48, h: 36 };

      faders.forEach((f, idx) => {
        positions[`fader-${idx}`] = {
          x: 82,
          y: 38,
          w: fW * 1.2, h: fH * 1.2
        };
      });

      pads.forEach((p, idx) => {
        positions[`pad-${idx}`] = {
          x: parseFloat((14 + idx * 18).toFixed(1)),
          y: 74,
          w: pW * 1.3, h: pH
        };
      });

      buttons.forEach((b, idx) => {
        positions[`button-${idx}`] = {
          x: parseFloat((14 + idx * 18).toFixed(1)),
          y: 87,
          w: bW * 1.3, h: bH
        };
      });
      return positions;
    }

    // 8. Behringer Edge
    if (id.includes('behringer_edge')) {
      knobs.forEach((k, idx) => {
        const col = idx % 8;
        const row = Math.floor(idx / 8);
        positions[`knob-${idx}`] = {
          x: parseFloat((10 + col * (kW + 3.5)).toFixed(1)),
          y: parseFloat((18 + row * (kH + 6)).toFixed(1)),
          w: kW, h: kH
        };
      });

      pads.forEach((p, idx) => {
        positions[`pad-${idx}`] = {
          x: parseFloat((10 + idx * (pW + 2)).toFixed(1)),
          y: 74,
          w: pW, h: pH
        };
      });
      return positions;
    }

    // 9. Akai MIDImix
    if (id.includes('midimix')) {
      const tracks = 8;
      const startX = 7.0;
      const colStep = (100 - startX * 2) / 8.5;

      knobs.forEach((k, idx) => {
        const col = idx % tracks;
        const row = Math.floor(idx / tracks);
        positions[`knob-${idx}`] = {
          x: parseFloat((startX + col * colStep + (colStep - kW) / 2).toFixed(1)),
          y: parseFloat((10 + row * (kH + 3)).toFixed(1)),
          w: kW, h: kH
        };
      });

      faders.forEach((f, idx) => {
        positions[`fader-${idx}`] = {
          x: parseFloat((startX + idx * colStep + (colStep - fW) / 2).toFixed(1)),
          y: 54,
          w: fW, h: fH
        };
      });

      buttons.forEach((b, idx) => {
        const col = idx % tracks;
        const row = Math.floor(idx / tracks);
        positions[`button-${idx}`] = {
          x: parseFloat((startX + col * colStep + (colStep - bW) / 2).toFixed(1)),
          y: parseFloat((84 + row * (bH + 2)).toFixed(1)),
          w: bW, h: bH
        };
      });
      return positions;
    }

    // 10. Default / Generic fallback
    const cols = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(pads.length || knobs.length || 8))));
    pads.forEach((p, idx) => {
      positions[`pad-${idx}`] = {
        x: parseFloat((10 + (idx % cols) * (pW + 2)).toFixed(1)),
        y: parseFloat((25 + Math.floor(idx / cols) * (pH + 3)).toFixed(1)),
        w: pW, h: pH
      };
    });

    knobs.forEach((k, idx) => {
      positions[`knob-${idx}`] = {
        x: parseFloat((10 + (idx % cols) * (kW + 3)).toFixed(1)),
        y: parseFloat((12 + Math.floor(idx / cols) * (kH + 4)).toFixed(1)),
        w: kW, h: kH
      };
    });

    faders.forEach((f, idx) => {
      positions[`fader-${idx}`] = {
        x: parseFloat((10 + idx * (fW + 3)).toFixed(1)),
        y: 60,
        w: fW, h: fH
      };
    });

    buttons.forEach((b, idx) => {
      positions[`button-${idx}`] = {
        x: parseFloat((10 + idx * (bW + 2)).toFixed(1)),
        y: 88,
        w: bW, h: bH
      };
    });

    return positions;
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

    // Setup container resize observer for dynamic resolution auto-alignment
    setupMapperResizeObserver();

    // Get active preset info
    const presetIndex = getState()?.activePresetIndex ?? 0;
    const preset = dev.defaultPresets?.[presetIndex] ?? {};
    const channel = (preset.channel ?? 0) + 1;

    // Detect screen resolution, container rect, and image dimensions
    const geom = window.detectFaceplateGeometry(container, dev);

    // Retrieve or auto-calculate positions
    let positions = window.getDeviceControlPositions(dev);
    if (!positions || Object.keys(positions).length === 0) {
      positions = window.autoCalculateOverlayLayout(dev);
    }

    // Dynamic Sizing: Generous, responsive, professional
    container.style.position = "relative";
    container.style.width = "100%";
    container.style.minHeight = isWideMode ? "740px" : "580px";
    container.style.height = (geom.viewH + 34) + "px";
    container.style.borderRadius = "12px";
    container.style.overflow = "hidden";
    container.style.background = "#090d16";
    container.style.boxShadow = "0 8px 30px rgba(0,0,0,0.5)";
    container.style.userSelect = "none";

    let html = `
      <!-- Calibrated Faceplate Viewport (Synchronized 1:1 with photo dimensions & resolution) -->
      <div id="faceplate-viewport" style="position:absolute; left:${geom.offX}px; top:${geom.offY}px; width:${geom.viewW}px; height:${geom.viewH}px; overflow:hidden; border-radius:10px; background:#0f172a; border:${isMoveMode ? "2px dashed #f59e0b" : "1px solid rgba(255,255,255,0.12)"}; box-shadow:0 6px 25px rgba(0,0,0,0.6);">
    `;

    // 1. Background Layer: Either Custom Top-View Image or Procedural Vector Faceplate
    if (geom.customPhoto) {
      html += `
        <div style="position:absolute; inset:0; background-image:url('${geom.customPhoto}'); background-size:100% 100%; background-repeat:no-repeat; filter:brightness(0.96); pointer-events:none;"></div>
        <div style="position:absolute; top:8px; right:10px; background:rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.18); border-radius:4px; padding:2px 8px; font-size:0.65rem; color:#38bdf8; z-index:5; pointer-events:none; font-family:monospace;">
          📷 Calibrated (${geom.photoMeta?.naturalWidth || geom.viewW}×${geom.photoMeta?.naturalHeight || geom.viewH} · ${(geom.imgAspect).toFixed(2)}:1)
        </div>
      `;
    } else {
      html += generateDefaultControllerFaceplateSVG(dev);
    }

    // 2. Interactive Overlay Container (100% bounds of calibrated viewport)
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
                 style="position:absolute; left:${pos.x}%; top:${pos.y}%; width:${pos.w}%; aspect-ratio:1/1; border-radius:6px; background:${padBg}; border:${borderGlow}; cursor:${cursorStyle}; display:flex; flex-direction:column; align-items:center; justify-content:center; transition:background 0.1s, transform 0.08s; box-shadow:0 3px 6px rgba(0,0,0,0.4); z-index:${isTarget ? 20 : 12};">
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
                 style="position:absolute; left:${pos.x}%; top:${pos.y}%; width:${pos.w}%; aspect-ratio:1/1; border-radius:50%; background:${knobBg}; border:${borderGlow}; cursor:${cursorStyle}; display:flex; flex-direction:column; align-items:center; justify-content:center; transition:transform 0.08s; box-shadow:0 3px 8px rgba(0,0,0,0.5); z-index:${isTarget ? 20 : 12};">
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
    html += `</div>`; // End faceplate-viewport
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

      <button class="btn sm" onclick="recalibrateOverlayLayout()" title="Automatically recalculate control overlay sizes & positions based on detected screen resolution and image dimensions">
        📐 Auto-Calibrate (Res & Image)
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

  
  window.recalibrateOverlayLayout = function() {
    const dev = getActiveDevice();
    if (!dev) return;
    window.autoCalculateOverlayLayout(dev);
    notify(`Auto-calibrated ${dev.name} controls for detected screen resolution & image dimensions.`, "success");
    window.renderSvgMapper?.();
  };

  function setupMapperResizeObserver() {
    const container = document.getElementById("svg-mapper-container");
    if (!container || _mapperResizeObserver) return;
    try {
      _mapperResizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 200) {
            // Update viewport positioning smoothly without full re-render
            const dev = getActiveDevice();
            if (dev) {
              const geom = window.detectFaceplateGeometry(container, dev);
              const vp = document.getElementById("faceplate-viewport");
              if (vp) {
                vp.style.left = geom.offX + "px";
                vp.style.top = geom.offY + "px";
                vp.style.width = geom.viewW + "px";
                vp.style.height = geom.viewH + "px";
                container.style.height = (geom.viewH + 34) + "px";
              }
            }
          }
        }
      });
      _mapperResizeObserver.observe(container);
    } catch(e) {}
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

    const img = new Image();
    img.onload = function() {
      const meta = {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        aspect: parseFloat((img.naturalWidth / img.naturalHeight).toFixed(4)),
        uploadedAt: Date.now()
      };

      try {
        localStorage.setItem(`mc_photo_${dev.id}`, _pendingFaceplateDataUrl);
        localStorage.setItem(`mc_photo_meta_${dev.id}`, JSON.stringify(meta));
        
        // Automatically calculate and position control overlays (knobs/faders)
        // based on detected screen resolution and user-uploaded faceplate image dimensions!
        window.autoCalculateOverlayLayout(dev, meta);

        notify(`Top-view photo (${meta.naturalWidth}×${meta.naturalHeight}px) applied with automatic control overlay calibration.`, "success");
        if (typeof window.closeModal === 'function') window.closeModal();
        window.renderSvgMapper?.();
      } catch(e) {
        notify("Failed to store image: image file may be too large for storage. Please compress slightly.", "error");
      }
    };
    img.onerror = function() {
      notify("Could not decode image file.", "error");
    };
    img.src = _pendingFaceplateDataUrl;
  };

  // ============================================================
  //  MOUSE DRAG & MOVE INTERACTION ON FACEPLATE
  // ============================================================
  window.onFaceplateControlMouseDown = function(key, event) {
    if (!isMoveMode) return;
    event.preventDefault();
    event.stopPropagation();

    const viewport = document.getElementById("faceplate-viewport") || document.getElementById("svg-mapper-container");
    if (!viewport) return;

    const dev = getActiveDevice();
    if (!dev) return;

    const positions = window.getDeviceControlPositions(dev);
    const curPos = positions[key] || { x: 50, y: 50, w: 8, h: 10 };

    activeDragControl = { key, pos: curPos };

    const rect = viewport.getBoundingClientRect();
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

    const viewport = document.getElementById("faceplate-viewport") || document.getElementById("svg-mapper-container");
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    let newX = ((event.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    let newY = ((event.clientY - rect.top) / rect.height) * 100 - dragOffset.y;

    if (isSnapToGrid) {
      newX = Math.round(newX / 2) * 2;
      newY = Math.round(newY / 2) * 2;
    }

    newX = Math.max(1, Math.min(95, newX));
    newY = Math.max(2, Math.min(94, newY));

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
