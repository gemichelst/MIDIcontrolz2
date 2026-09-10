const fs = require('fs');

let html = fs.readFileSync('index.html.bak', 'utf8');

// 1. Add CSS
const cssToInsert = `
  <style>
    /* New styles for SVG Map and Drag & Drop */
    #svg-mapper-container {
      width: 100%;
      min-height: 250px;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .svg-control {
      cursor: pointer;
      transition: all 0.2s;
    }
    .svg-control:hover {
      filter: brightness(1.2);
    }
    .svg-control.active {
      stroke: var(--accent);
      stroke-width: 3px;
    }
    .draggable-cc {
      display: inline-block;
      padding: 4px 8px;
      margin: 4px;
      background: var(--surface3);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: grab;
      user-select: none;
    }
    .draggable-cc:active {
      cursor: grabbing;
      background: var(--accent);
      color: white;
    }
    #sync-log-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      max-height: 250px;
      background: var(--surface2);
      border: 1px solid var(--accent);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      z-index: 10000;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .sync-log-header {
      background: var(--accent);
      color: white;
      padding: 8px 12px;
      font-weight: bold;
      font-size: 0.9rem;
      display: flex;
      justify-content: space-between;
    }
    .sync-log-body {
      padding: 12px;
      font-size: 0.8rem;
      overflow-y: auto;
      max-height: 150px;
    }
    .sync-log-item {
      padding: 4px 0;
      border-bottom: 1px solid var(--border);
    }
    .heatmap-btn {
      margin-left: 8px;
    }
  </style>
`;
html = html.replace('</head>', cssToInsert + '</head>');

// 2. Add mapper section to Editor Panel
const mapperHtml = `
      <!-- MIDI MAPPER & SVG ENGINE -->
      <div id="midi-mapper-section" style="display:none; margin-top:20px; background:var(--surface2); padding:12px; border-radius:8px;">
        <h2 style="font-size:1.1rem;margin-bottom:10px;">Visual MIDI Mapper (Drag & Drop)</h2>
        <p style="font-size:0.85rem;color:var(--text3);margin-bottom:10px;">Drag CC numbers onto the SVG controls to map them instantly. Click a control to edit.</p>
        <div id="draggable-ccs" style="margin-bottom:10px; background:var(--surface3); padding:10px; border-radius:6px; min-height:40px;">
          <span class="draggable-cc" draggable="true" ondragstart="dragCC(event)" data-cc="1">CC 1 (Mod)</span>
          <span class="draggable-cc" draggable="true" ondragstart="dragCC(event)" data-cc="7">CC 7 (Vol)</span>
          <span class="draggable-cc" draggable="true" ondragstart="dragCC(event)" data-cc="10">CC 10 (Pan)</span>
          <span class="draggable-cc" draggable="true" ondragstart="dragCC(event)" data-cc="74">CC 74 (Cutoff)</span>
          <span class="draggable-cc" draggable="true" ondragstart="dragCC(event)" data-cc="71">CC 71 (Reso)</span>
        </div>
        <div id="svg-mapper-container" ondrop="dropOnSvg(event)" ondragover="allowDrop(event)">
          <!-- SVG rendered by JS -->
        </div>
      </div>
`;
html = html.replace('<div id="editor-device" style="display:none;"></div>', '<div id="editor-device" style="display:none;"></div>\n' + mapperHtml);

// 3. Add Heatmap button to Device Manager Panel
html = html.replace('id="dm-search" placeholder="Search devices..." oninput="renderDeviceManager()" style="background:var(--surface3);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:4px;outline:none;font-size:0.8rem;">', 'id="dm-search" placeholder="Search devices..." oninput="renderDeviceManager()" style="background:var(--surface3);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:4px;outline:none;font-size:0.8rem;">\n          <button class="btn sm heatmap-btn" onclick="toggleHeatmap()">🔥 Toggle Heatmap</button>');

// 4. Add Sync log at bottom before modal
const syncLogHtml = `
<!-- Persistent Sync Log Notification -->
<div id="sync-log-container">
  <div class="sync-log-header">
    <span>Offline Sync Log</span>
    <button style="background:none;border:none;color:white;cursor:pointer;" onclick="document.getElementById('sync-log-container').style.display='none'">✕</button>
  </div>
  <div class="sync-log-body" id="sync-log-body">
    <!-- Log items -->
  </div>
  <div style="padding:12px; border-top:1px solid var(--border);">
    <button class="btn primary" style="width:100%;" onclick="syncNow()">Sync to Hardware Now</button>
  </div>
</div>
`;
html = html.replace('<!-- MODAL -->', syncLogHtml + '\n<!-- MODAL -->');

// 5. Add mapper.js script tag
html = html.replace('<script type="text/javascript" src="/assets/js/midicontrols.v4.js" defer></script>', '<script type="text/javascript" src="/assets/js/midicontrols.v4.js" defer></script>\n<script type="text/javascript" src="/assets/js/mapper.js" defer></script>');

fs.writeFileSync('index.html', html);
console.log('Restored and updated index.html');
