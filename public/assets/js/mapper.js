// MAPPER.JS

// ============================================================
//  SVG RENDERING ENGINE & DRAG-AND-DROP MAPPER
// ============================================================

function renderSvgMapper() {
  const container = document.getElementById('svg-mapper-container');
  const section = document.getElementById('midi-mapper-section');
  const dev = window.getActiveDev ? window.getActiveDev() : null;
  
  if (!dev || !container || !section) return;
  section.style.display = 'block';

  const pads = dev.controls?.pads || [];
  const knobs = dev.controls?.knobs || [];
  const faders = dev.controls?.faders || [];

  let svgHtml = `<svg width="100%" height="100%" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" style="background:#1e293b; border-radius:8px;">`;
  
  svgHtml += `<rect x="10" y="10" width="580" height="280" rx="10" fill="#0f172a" stroke="#334155" stroke-width="2"/>`;
  
  const startX = 30;
  let currX = startX;
  const startY = 30;
  
  if (pads.length > 0) {
    let px = currX;
    let py = startY + 50;
    pads.forEach((pad, i) => {
      svgHtml += `<rect id="svg-pad-${i}" class="svg-control" x="${px}" y="${py}" width="40" height="40" rx="4" fill="#334155" stroke="#475569" stroke-width="1" onclick="selectSvgControl('pad', ${i})" />`;
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
      svgHtml += `<circle id="svg-knob-${i}" class="svg-control" cx="${kx+20}" cy="${ky+20}" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="2" onclick="selectSvgControl('knob', ${i})" />`;
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
      svgHtml += `<rect class="svg-control" x="${fx}" y="${fy}" width="15" height="80" rx="2" fill="#0f172a" stroke="#475569" stroke-width="1" />`;
      svgHtml += `<rect id="svg-fader-${i}" class="svg-control" x="${fx-5}" y="${fy+40}" width="25" height="15" rx="3" fill="#64748b" onclick="selectSvgControl('fader', ${i})" />`;
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
    renderSvgMapper();
  }, 100);
};

let draggedCC = null;

window.dragCC = function(ev) {
  draggedCC = ev.target.getAttribute('data-cc');
  ev.dataTransfer.setData("text", draggedCC);
}

window.allowDrop = function(ev) {
  ev.preventDefault();
}

window.dropOnSvg = function(ev) {
  ev.preventDefault();
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
    logSyncEvent(`Mapped CC ${draggedCC} to ${type} ${index+1}`);
    renderSvgMapper();
    if (originalRenderDeviceEditor) originalRenderDeviceEditor();
  }
}

window.selectSvgControl = function(type, index) {
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
      logSyncEvent(`Updated ${type} ${index+1} mapping to ${newVal}`);
      renderSvgMapper();
      if (originalRenderDeviceEditor) originalRenderDeviceEditor();
    }
  }
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
