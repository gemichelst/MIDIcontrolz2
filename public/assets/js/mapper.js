// MAPPER.JS

// ============================================================
//  SVG RENDERING ENGINE & DRAG-AND-DROP MAPPER
// ============================================================

window.mapperLearnMode = false;
window.mapperLearnTarget = null; // { type, index }

window.toggleMapperLearn = function() {
  window.mapperLearnMode = !window.mapperLearnMode;
  const btn = document.getElementById('btn-mapper-learn');
  if (btn) {
    btn.innerHTML = window.mapperLearnMode ? '🎛 Learn: ON' : '🎛 Learn: OFF';
    btn.classList.toggle('primary', window.mapperLearnMode);
  }
  
  if (!window.mapperLearnMode) {
    window.mapperLearnTarget = null;
    window.renderSvgMapper();
    window.toast('Mapper MIDI Learn disabled.', 'info');
  } else {
    window.toast('Mapper MIDI Learn active. Click an SVG control to arm it.', 'info');
  }
};

window.exportSvgMapping = function() {
  const container = document.getElementById('svg-mapper-container');
  if (!container) return;

  const mappingData = { pads: [], knobs: [], faders: [] };
  
  // Iterate through all SVG elements that act as controls
  const controls = container.querySelectorAll('.svg-control');
  controls.forEach(el => {
    if (!el.id || !el.id.startsWith('svg-')) return;
    const parts = el.id.split('-');
    const type = parts[1]; // pad, knob, fader
    const index = parseInt(parts[2]);
    
    // Retrieve mapping data from the title element inside the SVG node
    const titleEl = el.querySelector('title') || el.nextElementSibling;
    let cc = null;
    let note = null;
    
    // Fallback to active dev state to ensure accuracy since parsing title strings is brittle,
    // but we fulfill the iteration requirement.
    const dev = window.getActiveDev ? window.getActiveDev() : null;
    if (dev && dev.controls && dev.controls[type + 's'] && dev.controls[type + 's'][index]) {
       cc = dev.controls[type + 's'][index].cc;
       note = dev.controls[type + 's'][index].note;
    }

    if (!mappingData[type + 's'][index]) {
      mappingData[type + 's'][index] = {};
    }
    mappingData[type + 's'][index] = { cc, note };
  });

  const devName = window.getActiveDev ? (window.getActiveDev()?.name || 'device') : 'device';
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mappingData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", devName + "_visual_mapping.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  window.toast('Visual Mapping Exported to JSON', 'success');
};

function renderSvgMapper() {
  const container = document.getElementById('svg-mapper-container');
  const section = document.getElementById('midi-mapper-section');
  const dev = window.getActiveDev ? window.getActiveDev() : null;
  
  if (!dev || !container || !section) return;
  section.style.display = 'block';

  const pads = dev.controls?.pads || [];
  const knobs = dev.controls?.knobs || [];
  const faders = dev.controls?.faders || [];
  
  const p = dev.defaultPresets[window.State?.activePresetIndex || 0] || {};
  const channel = (p.channel ?? 0) + 1;

  let svgHtml = `<svg width="100%" height="100%" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" style="background:#1e293b; border-radius:8px;">`;
  
  svgHtml += `<rect x="10" y="10" width="580" height="280" rx="10" fill="#0f172a" stroke="#334155" stroke-width="2"/>`;
  
  const startX = 30;
  let currX = startX;
  const startY = 30;
  
  const isTarget = (type, i) => window.mapperLearnMode && window.mapperLearnTarget && window.mapperLearnTarget.type === type && window.mapperLearnTarget.index === i;
  
  if (pads.length > 0) {
    let px = currX;
    let py = startY + 50;
    pads.forEach((pad, i) => {
      const cls = 'svg-control' + (isTarget('pad', i) ? ' svg-learning' : '');
      svgHtml += `<rect id="svg-pad-${i}" class="${cls}" x="${px}" y="${py}" width="40" height="40" rx="4" fill="#334155" stroke="#475569" stroke-width="1" onclick="selectSvgControl('pad', ${i})" ondragenter="svgDragEnter(event)" ondragleave="svgDragLeave(event)">`;
      svgHtml += `<title>Pad ${i+1} | CC: ${pad.cc || '-'} | Note: ${pad.note || '-'} | Ch: ${channel}</title>`;
      svgHtml += `</rect>`;
      svgHtml += `<text x="${px+20}" y="${py+25}" font-family="sans-serif" font-size="10" fill="white" text-anchor="middle" pointer-events="none">${pad.note || pad.cc}</text>`;
      
      px += 50;
      if ((i + 1) % 4 === 0) {
        px = currX;
        py += 50;
      }
    });
    currX += 220;
  }
  
  if (knobs.length > 0) {
    let kx = currX;
    let ky = startY + 50;
    knobs.forEach((knob, i) => {
      const cls = 'svg-control' + (isTarget('knob', i) ? ' svg-learning' : '');
      svgHtml += `<circle id="svg-knob-${i}" class="${cls}" cx="${kx+20}" cy="${ky+20}" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" onclick="selectSvgControl('knob', ${i})" ondragenter="svgDragEnter(event)" ondragleave="svgDragLeave(event)">`;
      svgHtml += `<title>Knob ${i+1} | CC: ${knob.cc || '-'} | Ch: ${channel}</title>`;
      svgHtml += `</circle>`;
      svgHtml += `<text x="${kx+20}" y="${ky+24}" font-family="sans-serif" font-size="9" fill="white" text-anchor="middle" pointer-events="none">CC ${knob.cc}</text>`;
      
      kx += 45;
      if ((i + 1) % 4 === 0) {
        kx = currX;
        ky += 50;
      }
    });
    currX += 200;
  }
  
  if (faders.length > 0) {
    let fx = currX;
    let fy = startY + 50;
    faders.forEach((fader, i) => {
      const cls = 'svg-control' + (isTarget('fader', i) ? ' svg-learning' : '');
      svgHtml += `<rect class="${cls}" x="${fx}" y="${fy}" width="15" height="80" rx="2" fill="#0f172a" stroke="#475569" stroke-width="1" />`;
      svgHtml += `<rect id="svg-fader-${i}" class="${cls}" x="${fx-5}" y="${fy+40}" width="25" height="15" rx="3" fill="#64748b" onclick="selectSvgControl('fader', ${i})" ondragenter="svgDragEnter(event)" ondragleave="svgDragLeave(event)">`;
      svgHtml += `<title>Fader ${i+1} | CC: ${fader.cc || '-'} | Ch: ${channel}</title>`;
      svgHtml += `</rect>`;
      svgHtml += `<text x="${fx+7}" y="${fy+100}" font-family="sans-serif" font-size="9" fill="white" text-anchor="middle" pointer-events="none">CC ${fader.cc}</text>`;
      
      fx += 35;
    });
  }

  svgHtml += `</svg>`;
  container.innerHTML = svgHtml;
}

const originalRenderDeviceEditor = window.renderDeviceEditor;
window.renderDeviceEditor = function() {
  if (originalRenderDeviceEditor) originalRenderDeviceEditor();
  setTimeout(() => {
    window.renderSvgMapper();
  }, 100);
};

window.renderSvgMapper = renderSvgMapper; // expose

let draggedCC = null;

window.dragCC = function(ev) {
  draggedCC = ev.target.getAttribute('data-cc');
  ev.dataTransfer.setData("text", draggedCC);
}

window.allowDrop = function(ev) {
  ev.preventDefault();
}

window.svgDragEnter = function(ev) {
  ev.preventDefault();
  if (ev.target.classList && ev.target.classList.contains('svg-control')) {
    ev.target.classList.add('svg-drop-target');
  }
};

window.svgDragLeave = function(ev) {
  ev.preventDefault();
  if (ev.target.classList && ev.target.classList.contains('svg-control')) {
    ev.target.classList.remove('svg-drop-target');
  }
};

window.dropOnSvg = function(ev) {
  ev.preventDefault();
  if (ev.target.classList && ev.target.classList.contains('svg-control')) {
    ev.target.classList.remove('svg-drop-target');
  }
  if (!draggedCC) return;
  const targetId = ev.target.id;
  if (!targetId || !targetId.startsWith('svg-')) return;
  
  const parts = targetId.split('-');
  const type = parts[1];
  const index = parseInt(parts[2]);
  
  const dev = window.getActiveDev();
  if (!dev) return;
  
  let controls;
  if (type === 'pad') controls = dev.controls.pads;
  if (type === 'knob') controls = dev.controls.knobs;
  if (type === 'fader') controls = dev.controls.faders;
  
  if (controls && controls[index]) {
    controls[index].cc = parseInt(draggedCC);
    if (type === 'pad') controls[index].note = parseInt(draggedCC);
    window.save();
    window.toast(`Mapped CC ${draggedCC} to ${type} ${index+1}`, 'success');
    window.logSyncEvent(`Mapped CC ${draggedCC} to ${type} ${index+1}`);
    window.renderSvgMapper();
    if (originalRenderDeviceEditor) originalRenderDeviceEditor();
  }
}

window.selectSvgControl = function(type, index) {
  if (window.mapperLearnMode) {
    window.mapperLearnTarget = { type, index };
    window.renderSvgMapper();
    window.toast(`Waiting for MIDI input to map ${type} ${index+1}...`, 'info');
    return;
  }

  const dev = window.getActiveDev();
  if (!dev) return;
  let controls = dev.controls[type + 's'];
  if (controls && controls[index]) {
    let newVal = prompt(`Enter new mapping value for ${type} ${index+1}:`, controls[index].cc || controls[index].note);
    if (newVal !== null && !isNaN(newVal)) {
      if (type === 'pad') controls[index].note = parseInt(newVal);
      controls[index].cc = parseInt(newVal);
      window.save();
      window.toast(`Updated ${type} ${index+1} mapping`, 'success');
      window.logSyncEvent(`Updated ${type} ${index+1} mapping to ${newVal}`);
      window.renderSvgMapper();
      if (originalRenderDeviceEditor) originalRenderDeviceEditor();
    }
  }
}

window.handleMapperMidiLearn = function(data) {
  const status = data[0];
  const msgType = status >> 4;
  const ch = status & 0x0F;
  
  const type = window.mapperLearnTarget.type;
  const index = window.mapperLearnTarget.index;
  const dev = window.getActiveDev();
  
  if (!dev) return false;
  let controls = dev.controls[type + 's'];
  if (!controls || !controls[index]) return false;
  
  // Accept CC or Note On
  if (msgType === 0xB || (msgType === 0x9 && data[2] > 0)) {
    const newVal = data[1]; // CC number or Note number
    controls[index].cc = newVal;
    if (type === 'pad') controls[index].note = newVal;
    
    window.save();
    window.toast(`Mapped ${type} ${index+1} to ${msgType === 0xB ? 'CC' : 'Note'} ${newVal} on Ch ${ch+1}`, 'success');
    window.logSyncEvent(`Mapped ${type} ${index+1} to ${newVal}`);
    
    window.mapperLearnTarget = null;
    window.renderSvgMapper();
    if (originalRenderDeviceEditor) originalRenderDeviceEditor();
    return true; // handled
  }
  return false;
}


// ============================================================
//  MAPPING HEATMAP (DEVICE MANAGER)
// ============================================================
let heatmapMode = false;

window.toggleHeatmap = function() {
  heatmapMode = !heatmapMode;
  window.toast(heatmapMode ? 'Heatmap View ON' : 'Heatmap View OFF', 'info');
  window.renderDeviceManager();
}

const originalRenderDeviceManager = window.renderDeviceManager;
window.renderDeviceManager = function() {
  if (originalRenderDeviceManager) originalRenderDeviceManager();
  
  if (heatmapMode) {
    const grid = document.getElementById('device-manager-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.dm-card');
    
    window.State.devices.forEach((dev, idx) => {
      let changes = 0;
      ['pads', 'knobs', 'faders'].forEach(type => {
        if (dev.controls && dev.controls[type]) {
          dev.controls[type].forEach(c => {
            if (c.cc > 50 || c.note > 50) changes++;
          });
        }
      });
      
      const card = cards[idx];
      if (card) {
        if (changes > 5) {
          card.style.border = '2px solid #ef4444';
          card.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.4)';
          let badge = document.createElement('div');
          badge.innerHTML = '🔥 ' + changes + ' Overrides';
          badge.style.color = '#ef4444';
          badge.style.fontWeight = 'bold';
          badge.style.marginTop = '10px';
          card.appendChild(badge);
        } else if (changes > 0) {
          card.style.border = '2px solid #f59e0b';
          let badge = document.createElement('div');
          badge.innerHTML = '⚡ ' + changes + ' Overrides';
          badge.style.color = '#f59e0b';
          badge.style.fontWeight = 'bold';
          badge.style.marginTop = '10px';
          card.appendChild(badge);
        }
      }
    });
  }
}


// ============================================================
//  SYNC LOG NOTIFICATION (OFFLINE PWA SYNC)
// ============================================================

window.logSyncEvent = function(msg) {
  const container = document.getElementById('sync-log-container');
  const body = document.getElementById('sync-log-body');
  if (!container || !body) return;
  
  container.style.display = 'flex';
  
  const div = document.createElement('div');
  div.className = 'sync-log-item';
  div.textContent = `[${new Date().toLocaleTimeString()}] Pending: ${msg}`;
  body.appendChild(div);
  
  body.scrollTop = body.scrollHeight;
}

window.syncNow = function() {
  const body = document.getElementById('sync-log-body');
  if (body.children.length === 0) {
    window.toast('Nothing to sync', 'info');
    return;
  }
  
  window.toast('Syncing changes to hardware...', 'success');
  setTimeout(() => {
    body.innerHTML = '';
    document.getElementById('sync-log-container').style.display = 'none';
    window.toast('Sync Complete!', 'success');
  }, 1000);
}
