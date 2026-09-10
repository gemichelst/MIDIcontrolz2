const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const topNavTarget = `<nav id="topnav">
  <!-- Logo -->
  <div class="logo">Midi<span>Controls</span></div>`;
const topNavReplacement = `<nav id="topnav">
  <button class="btn sm" id="mobile-menu-btn" onclick="document.getElementById('sidebar').classList.toggle('open')" style="margin-right:8px;font-size:1.2rem;padding:2px 8px;background:transparent;border:none;color:var(--text);cursor:pointer;display:none;">☰</button>
  <!-- Logo -->
  <div class="logo">Midi<span>Controls</span></div>`;
html = html.replace(topNavTarget, topNavReplacement);

const outputsTarget = `<select id="midi-out" onchange="onMidiOutChange(this.value)">
            <option value="">(None)</option>
          </select>
        </div>`;
const outputsReplacement = `<select id="midi-out" onchange="onMidiOutChange(this.value)">
            <option value="">(None)</option>
          </select>
        </div>
        <button class="btn sm danger" onclick="midiPanic()" style="margin-left:8px;" title="Send All Notes Off / All Sound Off">🛑 Panic</button>`;
html = html.replace(outputsTarget, outputsReplacement);

fs.writeFileSync('index.html', html);
console.log('Done');
