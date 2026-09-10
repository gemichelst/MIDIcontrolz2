const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Factory Reset button
const cmdsHtml = `
      <div class="sysex-area" id="device-sysex-cmds">
        <h3>Device Quick Commands</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          <button class="btn sm" style="background:#dc2626;color:white;border:none;" onclick="sendFactoryReset()">⚠️ Factory Reset</button>
        </div>
        <div id="device-quick-cmds-list" style="display:flex;gap:8px;flex-wrap:wrap;">
`;
html = html.replace(/<div class="sysex-area" id="device-sysex-cmds">\n\s*<h3>Device Quick Commands<\/h3>\n\s*<div id="device-quick-cmds-list"/, cmdsHtml);


// 2. Add Progress Bar for SysEx Queue
const sysexQueueHtml = `
          <div style="display:flex; gap:8px;">
            <input type="file" id="sysex-file-input" accept=".syx,.bin" multiple onchange="handleSysexQueueFiles(event)">
            <button class="btn sm primary" onclick="sendSysexQueue()">Transmit All</button>
            <button class="btn sm" onclick="sysexQueue=[];renderSysexQueue()">Clear</button>
          </div>
          <div id="sysex-progress-container" style="display:none;margin-top:10px;width:100%;background:var(--surface3);height:12px;border-radius:6px;overflow:hidden;">
            <div id="sysex-progress-bar" style="width:0%;height:100%;background:#22c55e;transition:width 0.2s;"></div>
          </div>
          <div id="sysex-queue-list" style="margin-top:10px; display:flex; flex-direction:column; gap:6px;">
`;
html = html.replace(/<div style="display:flex; gap:8px;">\n\s*<input type="file" id="sysex-file-input"[\s\S]*?<div id="sysex-queue-list"/, sysexQueueHtml);

// 3. Add Recent CC list to Monitor
const monitorHtml = `
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:10px;">
        <h2 style="font-size:1.1rem;margin:0;">MIDI Event Monitor</h2>
        <button class="btn sm" onclick="clearMonitor()">Clear</button>
      </div>
      <div id="recent-cc-monitor" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px; min-height:28px;">
        <!-- Recent CCs will populate here -->
      </div>
      <div id="monitor-log"
`;
html = html.replace(/<div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:10px;">\n\s*<h2[\s\S]*?<div id="monitor-log"/, monitorHtml);

fs.writeFileSync('index.html', html);
console.log('patched index.html');
