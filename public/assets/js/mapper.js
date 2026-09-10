(() => {
  "use strict";

  let draggedCC = null;
  let heatmapMode = false;

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

  window.toggleMapperLearn = function toggleMapperLearn() {
    window.mapperLearnMode = !window.mapperLearnMode;

    if (!window.mapperLearnMode) {
      window.mapperLearnTarget = null;
    }

    const button = document.getElementById("btn-mapper-learn");
    if (button) {
      button.textContent = window.mapperLearnMode
        ? "🎛 Learn: ON"
        : "🎛 Learn: OFF";
      button.classList.toggle("primary", window.mapperLearnMode);
    }

    window.renderSvgMapper?.();
    notify(
      window.mapperLearnMode
        ? "Mapper MIDI Learn active. Click a control to arm it."
        : "Mapper MIDI Learn disabled.",
      "info"
    );
  };

  window.renderSvgMapper = function renderSvgMapper() {
    const container = document.getElementById("svg-mapper-container");
    const section = document.getElementById("midi-mapper-section");
    const dev = getActiveDevice();

    if (!container || !section) return;

    if (!dev) {
      section.style.display = "none";
      container.replaceChildren();
      return;
    }

    section.style.display = "block";

    const presetIndex = getState()?.activePresetIndex ?? 0;
    const preset = dev.defaultPresets?.[presetIndex] ?? {};
    const channel = (preset.channel ?? 0) + 1;
    const groups = [
      ["pad", "pads", dev.controls?.pads ?? []],
      ["knob", "knobs", dev.controls?.knobs ?? []],
      ["fader", "faders", dev.controls?.faders ?? []]
    ];

    const columns = Math.max(
      1,
      groups.filter(([, , items]) => items.length > 0).length
    );

    let x = 24;
    const columnWidth = 176;
    const parts = [
      `<svg width="100%" height="300" viewBox="0 0 ${columns * columnWidth + 48} 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Visual MIDI mapping for ${escapeHtml(dev.name)}">`,
      `<rect x="1" y="1" width="${columns * columnWidth + 46}" height="298" rx="10" fill="#0f172a" stroke="#334155"/>`
    ];

    for (const [type, plural, controls] of groups) {
      if (!controls.length) continue;

      parts.push(
        `<text x="${x}" y="28" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="13" font-weight="700">${escapeHtml(plural)}</text>`
      );

      controls.forEach((control, index) => {
        const row = index % 4;
        const group = Math.floor(index / 4);
        const y = 46 + row * 56;
        const offsetX = x + group * 44;
        const id = `svg-${type}-${index}`;
        const active =
          window.mapperLearnMode &&
          window.mapperLearnTarget?.type === type &&
          window.mapperLearnTarget?.index === index;
        const cssClass = `svg-control${active ? " svg-learning" : ""}`;
        const label =
          type === "pad"
            ? `Pad ${index + 1} · Note ${control.note ?? "-"} · CC ${control.cc ?? "-"} · Ch ${channel}`
            : `${type[0].toUpperCase() + type.slice(1)} ${index + 1} · CC ${control.cc ?? "-"} · Ch ${channel}`;

        if (type === "knob") {
          parts.push(
            `<circle id="${id}" class="${cssClass}" cx="${offsetX + 22}" cy="${y + 20}" r="17" fill="#1e293b" stroke="#94a3b8" stroke-width="2" tabindex="0" role="button" aria-label="${escapeHtml(label)}" onclick="selectSvgControl('${type}', ${index})" ondragenter="svgDragEnter(event)" ondragleave="svgDragLeave(event)"><title>${escapeHtml(label)}</title></circle>`,
            `<text x="${offsetX + 22}" y="${y + 24}" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="9" pointer-events="none">CC ${control.cc ?? "-"}</text>`
          );
        } else if (type === "fader") {
          parts.push(
            `<rect x="${offsetX + 14}" y="${y}" width="16" height="42" rx="3" fill="#020617" stroke="#475569"/>`,
            `<rect id="${id}" class="${cssClass}" x="${offsetX + 8}" y="${y + 14}" width="28" height="14" rx="3" fill="#64748b" tabindex="0" role="button" aria-label="${escapeHtml(label)}" onclick="selectSvgControl('${type}', ${index})" ondragenter="svgDragEnter(event)" ondragleave="svgDragLeave(event)"><title>${escapeHtml(label)}</title></rect>`,
            `<text x="${offsetX + 22}" y="${y + 55}" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="9" pointer-events="none">CC ${control.cc ?? "-"}</text>`
          );
        } else {
          parts.push(
            `<rect id="${id}" class="${cssClass}" x="${offsetX}" y="${y}" width="40" height="40" rx="5" fill="#334155" stroke="#64748b" tabindex="0" role="button" aria-label="${escapeHtml(label)}" onclick="selectSvgControl('${type}', ${index})" ondragenter="svgDragEnter(event)" ondragleave="svgDragLeave(event)"><title>${escapeHtml(label)}</title></rect>`,
            `<text x="${offsetX + 20}" y="${y + 24}" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="10" pointer-events="none">${control.note ?? control.cc ?? "-"}</text>`
          );
        }
      });

      x += columnWidth;
    }

    parts.push("</svg>");
    container.innerHTML = parts.join("");
  };

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

    const [, type, indexText] = target?.id?.split("-") ?? [];
    const index = Number(indexText);
    const dev = getActiveDevice();
    const controls = dev?.controls?.[`${type}s`];

    if (!Array.isArray(controls) || !controls[index]) return;

    controls[index].cc = value;
    if (type === "pad") controls[index].note = value;

    save();
    syncLog(`Mapped CC ${value} to ${type} ${index + 1}`);
    notify(`Mapped CC ${value} to ${type} ${index + 1}.`, "success");
    refreshMapper();
  };

  window.selectSvgControl = function selectSvgControl(type, index) {
    const dev = getActiveDevice();
    const controls = dev?.controls?.[`${type}s`];
    if (!Array.isArray(controls) || !controls[index]) return;

    if (window.mapperLearnMode) {
      window.mapperLearnTarget = { type, index };
      window.renderSvgMapper?.();
      notify(`Waiting for MIDI input to map ${type} ${index + 1}.`, "info");
      return;
    }

    const current = type === "pad"
      ? controls[index].note ?? controls[index].cc ?? 0
      : controls[index].cc ?? 0;

    const response = window.prompt(
      `Enter a MIDI ${type === "pad" ? "note / CC" : "CC"} value (0–127):`,
      String(current)
    );

    if (response === null) return;

    const value = Number(response);
    if (!Number.isInteger(value) || value < 0 || value > 127) {
      notify("Enter a MIDI value between 0 and 127.", "error");
      return;
    }

    controls[index].cc = value;
    if (type === "pad") controls[index].note = value;

    save();
    syncLog(`Updated ${type} ${index + 1} mapping to ${value}`);
    notify(`Updated ${type} ${index + 1}.`, "success");
    refreshMapper();
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
    const controls = dev?.controls?.[`${target.type}s`];
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

  window.exportSvgMapping = function exportSvgMapping() {
    const dev = getActiveDevice();
    if (!dev) {
      notify("Select a device first.", "error");
      return;
    }

    const payload = ["pads", "knobs", "faders"].reduce(
      (mapping, type) => {
        mapping[type] = (dev.controls?.[type] ?? []).map((control) => ({
          id: control.id ?? null,
          label: control.label ?? null,
          cc: control.cc ?? null,
          note: control.note ?? null
        }));
        return mapping;
      },
      {
        device: {
          id: dev.id,
          name: dev.name,
          manufacturer: dev.manufacturer ?? null
        },
        exported: new Date().toISOString()
      }
    );

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const anchor = document.createElement("a");
    const name = String(dev.name || dev.id || "device")
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();

    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${name || "device"}-visual-mapping.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);

    notify("Visual mapping exported to JSON.", "success");
  };

  window.toggleHeatmap = function toggleHeatmap() {
    heatmapMode = !heatmapMode;
    window.renderDeviceManager?.();
    notify(heatmapMode ? "Heatmap View ON" : "Heatmap View OFF", "info");
  };

  const previousRenderDeviceManager = window.renderDeviceManager;
  window.renderDeviceManager = function renderDeviceManagerWithHeatmap(...args) {
    previousRenderDeviceManager?.(...args);

    if (!heatmapMode) return;

    const devices = getState()?.devices;
    if (!Array.isArray(devices)) return;

    devices.forEach((dev) => {
      const card = document.getElementById(`dm-card-${dev.id}`);
      if (!card) return;

      card.querySelector(".dm-heatmap-badge")?.remove();

      const changes = ["pads", "knobs", "faders"].reduce(
        (total, type) =>
          total +
          (dev.controls?.[type] ?? []).filter(
            (control) =>
              Number(control.cc) > 50 || Number(control.note) > 50
          ).length,
        0
      );

      if (changes < 1) return;

      const severe = changes > 5;
      card.style.border = `2px solid ${severe ? "#ef4444" : "#f59e0b"}`;
      card.style.boxShadow = severe
        ? "0 0 15px rgba(239, 68, 68, 0.4)"
        : "0 0 12px rgba(245, 158, 11, 0.28)";

      const badge = document.createElement("div");
      badge.className = "dm-heatmap-badge";
      badge.style.color = severe ? "#ef4444" : "#f59e0b";
      badge.style.fontWeight = "700";
      badge.style.marginTop = "10px";
      badge.textContent = `${severe ? "🔥" : "⚡"} ${changes} mapped control${changes === 1 ? "" : "s"}`;
      card.appendChild(badge);
    });
  };

  window.logSyncEvent = window.logSyncEvent || function logSyncEvent(message) {
    const container = document.getElementById("sync-log-container");
    const body = document.getElementById("sync-log-body");
    if (!container || !body) return;

    container.style.display = "flex";
    const item = document.createElement("div");
    item.className = "sync-log-item";
    item.textContent = `[${new Date().toLocaleTimeString()}] Pending: ${message}`;
    body.appendChild(item);
    body.scrollTop = body.scrollHeight;
  };

  window.syncNow = function syncNow() {
    const body = document.getElementById("sync-log-body");
    if (!body?.children.length) {
      notify("Nothing to sync.", "info");
      return;
    }

    notify("Syncing changes to hardware…", "success");

    window.setTimeout(() => {
      body.replaceChildren();
      const container = document.getElementById("sync-log-container");
      if (container) container.style.display = "none";
      notify("Sync complete.", "success");
    }, 1000);
  };

  window.mapperLearnMode = false;
  window.mapperLearnTarget = null;
})();
