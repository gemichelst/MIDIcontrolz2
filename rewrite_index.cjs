const fs = require('fs');

let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MidiControls UI</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
  <meta name="theme-color" content="#0f172a">
  <link rel="manifest" href="manifest.json">
  <link rel="stylesheet" href="/assets/css/midicontrols.v2.css">
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
</head>
<body>
<div id="app">
  <nav id="topnav">
    <div class="logo">Midi<span>Controls</span></div>
    <div id="device-selector-bar">
      <div class="device-select-wrap">
        <select id="device-select" onchange="onDeviceSelectChange(this.value)">
          <option value="">— Select Device —</option>
        </select>
      </div>
      <button class="btn-add-device-top" onclick="openAddDeviceModal()">
        <span>＋</span> Add Device
      </button>
    </div>
    <div class="nav-tabs">
      <button class="nav-tab active" onclick="showPanel('editor')" id="tab-editor">Editor</button>
      <button class="nav-tab" onclick="showPanel('manager')" id="tab-manager">Device Manager</button>
      <button class="nav-tab" onclick="showPanel('backup')" id="tab-backup">Backup</button>
      <button class="nav-tab" onclick="showPanel('settings')" id="tab-settings">Settings</button>
    </div>
    <div id="port-status">
      <div class="status-dot" id="midi-dot"></div>
      <span id="midi-status-text">No WebMIDI</span>
    </div>
    <div id="port-selects" style="display:flex;align-items:center;">
      <select id="sel-in" onchange="connectMidiPorts()">
        <option value="">— MIDI In —</option>
      </select>
      <select id="sel-out" onchange="connectMidiPorts()">
        <option value="">— MIDI Out —</option>
      </select>
      <button class="btn sm danger" onclick="midiPanic()" style="margin-left:8px;" title="Send All Notes Off / All Sound Off">🛑 Panic</button>
    </div>
  </nav>

  <div id="main">
    <div id="content">
      <!-- EDITOR PANEL -->
      <div class="panel active" id="panel-editor">
        
        <div style="margin-bottom:16px;background:var(--surface2);padding:12px;border-radius:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="font-size:0.9rem;margin:0;">Virtual Keyboard</h3>
            <span style="font-size:0.75rem;color:var(--text3);">Incoming Note-On events highlight keys</span>
          </div>
          <div id="virtual-keyboard" style="display:flex;height:80px;position:relative;width:max-content;background:var(--surface3);border:1px solid var(--border);border-radius:4px;overflow:hidden;"></div>
        </div>

        <div id="editor-welcome" class="welcome-screen">
          <div class="big-icon">🎹</div>
          <h2>Select a device to start editing</h2>
        </div>

        <div id="editor-device" style="display:none;"></div>
        
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

      </div>

      <!-- DEVICE MANAGER PANEL -->
      <div class="panel" id="panel-manager">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;align-items:center;gap:16px;">
            <h2 style="font-size:1.1rem;">Device Manager</h2>
            <input type="text" id="dm-search" placeholder="Search devices..." oninput="renderDeviceManager()" style="background:var(--surface3);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:4px;outline:none;font-size:0.8rem;">
            <button class="btn sm heatmap-btn" onclick="toggleHeatmap()">🔥 Toggle Heatmap</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn primary" onclick="openAddDeviceModal()">＋ Add Device</button>
            <button class="btn" onclick="importDeviceJSON()">📂 Import (.json/.syx)</button>
            <input type="file" id="import-device-input" accept=".json,.syx" style="display:none" onchange="handleImportDevice(event)">
          </div>
        </div>
        <div class="device-manager-grid" id="device-manager-grid"></div>
      </div>

      <!-- BACKUP PANEL -->
      <div class="panel" id="panel-backup">
        <h2 style="margin-bottom:8px;font-size:1.1rem;">Backup &amp; Restore</h2>
        <p style="color:var(--text3);font-size:0.82rem;margin-bottom:16px;">Export all device presets to JSON or restore from a backup file.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
          <button class="btn primary" onclick="backupAll()">⬇ Export All Backups</button>
          <button class="btn" onclick="document.getElementById('restore-input').click()">⬆ Restore from File</button>
          <input type="file" id="restore-input" accept=".json" style="display:none" onchange="restoreBackup(event)">
        </div>
        <div class="backup-list" id="backup-list"></div>
      </div>

      <!-- SETTINGS PANEL -->
      <div class="panel" id="panel-settings">
        <h2 style="margin-bottom:16px;font-size:1.1rem;">Settings</h2>
        <div class="settings-grid">
          <div class="settings-card">
            <h3>🎛 MIDI Behavior</h3>
            <div class="toggle-row">
              <span>MIDI Thru (echo input to output)</span>
              <div class="toggle" id="tog-thru" onclick="toggleSetting('thru')"></div>
            </div>
            <div class="toggle-row">
              <span>Highlight on incoming message</span>
              <div class="toggle on" id="tog-highlight" onclick="toggleSetting('highlight')"></div>
            </div>
          </div>
          <div class="settings-card">
            <h3>💾 Storage</h3>
            <div style="font-size:0.82rem;color:var(--text2);line-height:1.8;">
              All configs stored in <strong>localStorage</strong>.
            </div>
            <button class="btn danger sm" style="margin-top:12px;" onclick="clearAllData()">🗑 Clear All Data</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

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

<!-- MODAL -->
<div class="modal-overlay" id="modal-overlay" onclick="closeModalOutside(event)">
  <div class="modal" id="modal">
    <div id="modal-content"></div>
  </div>
</div>
<div id="toast-container"></div>
<script type="text/javascript" src="/assets/js/midicontrols.v4.js" defer></script>
<script type="text/javascript" src="/assets/js/mapper.js" defer></script>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('Rewritten index.html successfully.');
