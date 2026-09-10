const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add CSS for tooltips
const tooltipCss = `
    [data-tooltip] { position: relative; cursor: help; }
    [data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
      background: var(--surface); color: var(--text); border: 1px solid var(--border);
      padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; white-space: nowrap;
      z-index: 1000; margin-bottom: 4px; pointer-events: none;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
`;
html = html.replace('</style>', tooltipCss + '\n  </style>');

// 2. Add Nav Tab
const navReplacement = `<button class="nav-tab" onclick="showPanel('settings')" id="tab-settings">
      ⚙️ Settings
    </button>
    <button class="nav-tab" onclick="showPanel('utilities')" id="tab-utilities">
      🛠 Utilities
    </button>`;
html = html.replace(/<button class="nav-tab" onclick="showPanel\('settings'\)" id="tab-settings">[\s\S]*?<\/button>/, navReplacement);

// 3. Add Quantizer to Virtual Keyboard
const quantizerHtml = `
            <div style="display:flex; align-items:center; gap:10px; font-size: 0.8rem; color:var(--text2);">
              <span data-tooltip="Forces played notes to snap to the selected scale">Scale Quantizer:</span>
              <select id="vk-scale-root" style="background:var(--surface3); border:1px solid var(--border); color:var(--text); border-radius:4px; padding:2px 4px;">
                <option value="0">C</option><option value="1">C#</option><option value="2">D</option><option value="3">D#</option>
                <option value="4">E</option><option value="5">F</option><option value="6">F#</option><option value="7">G</option>
                <option value="8">G#</option><option value="9">A</option><option value="10">A#</option><option value="11">B</option>
              </select>
              <select id="vk-scale-type" style="background:var(--surface3); border:1px solid var(--border); color:var(--text); border-radius:4px; padding:2px 4px;">
                <option value="none">Off (Chromatic)</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="dorian">Dorian</option>
                <option value="mixolydian">Mixolydian</option>
                <option value="pentatonic_maj">Maj Pentatonic</option>
                <option value="pentatonic_min">Min Pentatonic</option>
              </select>
            </div>
`;
html = html.replace(/<span id="vk-velocity-val">100<\/span>\s*<\/div>\s*<\/div>/, `<span id="vk-velocity-val">100</span>\n            </div>\n${quantizerHtml}\n          </div>`);

// 4. Add tooltips to existing buttons (Editor / SysEx)
// Editor buttons are generated dynamically in JS, so we'll patch JS for those. 
// SysEx buttons are in HTML:
html = html.replace(/<button class="btn primary" onclick="sendSysEx\(\)">\s*⚡ Send SysEx\s*<\/button>/, `<button class="btn primary" onclick="sendSysEx()" data-tooltip="Transmit the raw hexadecimal bytes above directly to the active MIDI Out port">⚡ Send SysEx</button>`);
html = html.replace(/<button class="btn" onclick="parseSysExInput\(\)">\s*🔍 Parse\s*<\/button>/, `<button class="btn" onclick="parseSysExInput()" data-tooltip="Validate and count the number of bytes in the hexadecimal input without sending">🔍 Parse</button>`);

// 5. Add Utilities Panel
const utilitiesPanel = `
    <!-- UTILITIES PANEL -->
    <div class="panel" id="panel-utilities">
      <h2 style="margin-bottom:8px;font-size:1.1rem;">🛠 MIDI Utilities</h2>
      <p style="color:var(--text3);font-size:0.82rem;margin-bottom:20px;">A collection of specialized tools for performance, routing, and diagnostics.</p>
      
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:16px;">
        
        <!-- CHORD CREATOR -->
        <div style="background:var(--surface2); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <h3 style="font-size:1rem; margin-bottom:8px; display:flex; justify-content:space-between;">
            🎹 Chord Progression Player
            <button class="btn sm" onclick="stopAllChords()">Stop</button>
          </h3>
          <p style="font-size:0.75rem; color:var(--text3); margin-bottom:12px;">Trigger full chords instantly to test synthesizers.</p>
          <div style="display:flex; gap:8px; margin-bottom:12px;">
            <select id="chord-root" style="background:var(--surface3); border:1px solid var(--border); color:var(--text); border-radius:4px; padding:4px 8px;">
              <option value="48">C3</option><option value="49">C#3</option><option value="50">D3</option><option value="51">D#3</option>
              <option value="52">E3</option><option value="53">F3</option><option value="54">F#3</option><option value="55">G3</option>
              <option value="56">G#3</option><option value="57">A3</option><option value="58">A#3</option><option value="59">B3</option>
            </select>
            <select id="chord-type" style="background:var(--surface3); border:1px solid var(--border); color:var(--text); border-radius:4px; padding:4px 8px;">
              <option value="maj">Major</option>
              <option value="min">Minor</option>
              <option value="maj7">Major 7th</option>
              <option value="min7">Minor 7th</option>
              <option value="dim">Diminished</option>
            </select>
            <button class="btn primary" onmousedown="playUtilityChord()" onmouseup="stopUtilityChord()">Play Chord</button>
          </div>
          <div id="chord-pads" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px;">
            <button class="btn" style="height:40px;" onmousedown="playUtilityChordQuick(48, 'maj')" onmouseup="stopAllChords()">C Maj</button>
            <button class="btn" style="height:40px;" onmousedown="playUtilityChordQuick(55, 'maj')" onmouseup="stopAllChords()">G Maj</button>
            <button class="btn" style="height:40px;" onmousedown="playUtilityChordQuick(57, 'min')" onmouseup="stopAllChords()">A Min</button>
            <button class="btn" style="height:40px;" onmousedown="playUtilityChordQuick(53, 'maj')" onmouseup="stopAllChords()">F Maj</button>
          </div>
        </div>

        <!-- MIDI CLOCK -->
        <div style="background:var(--surface2); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <h3 style="font-size:1rem; margin-bottom:8px;">⏱ MIDI Clock (Sync)</h3>
          <p style="font-size:0.75rem; color:var(--text3); margin-bottom:12px;">Send an internal MIDI clock (Timing Clock 0xF8) to the active Output.</p>
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:0.8rem;">BPM (Tempo): <span id="clock-bpm-val">120</span></label>
              <input type="range" id="clock-bpm" min="40" max="240" value="120" oninput="updateInternalClockBPM(this.value)">
            </div>
            <button class="btn primary" id="btn-clock-toggle" onclick="toggleInternalClock()">Start Clock</button>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn sm" onclick="sendMidiOut([0xFA])" data-tooltip="Send MIDI Start (0xFA)">Start (FA)</button>
            <button class="btn sm" onclick="sendMidiOut([0xFB])" data-tooltip="Send MIDI Continue (0xFB)">Continue (FB)</button>
            <button class="btn sm" onclick="sendMidiOut([0xFC])" data-tooltip="Send MIDI Stop (0xFC)">Stop (FC)</button>
          </div>
        </div>
        
        <!-- LFO GENERATOR -->
        <div style="background:var(--surface2); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <h3 style="font-size:1rem; margin-bottom:8px;">🌊 CC LFO Generator</h3>
          <p style="font-size:0.75rem; color:var(--text3); margin-bottom:12px;">Continuously send a sine wave CC sweep to modulate external parameters.</p>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px; font-size:0.8rem;">
            <div>
              <label>Target CC</label>
              <input type="number" id="lfo-cc" min="0" max="127" value="74" style="width:100%; background:var(--surface3); border:1px solid var(--border); color:var(--text); border-radius:4px; padding:4px;">
            </div>
            <div>
              <label>Speed (Hz)</label>
              <input type="number" id="lfo-speed" min="0.1" max="20" step="0.1" value="1.0" style="width:100%; background:var(--surface3); border:1px solid var(--border); color:var(--text); border-radius:4px; padding:4px;">
            </div>
          </div>
          <button class="btn primary" id="btn-lfo-toggle" onclick="toggleLFO()" style="width:100%;">Start LFO</button>
          <div style="margin-top:8px; height:4px; background:var(--surface3); border-radius:2px; overflow:hidden;">
            <div id="lfo-visualizer" style="height:100%; width:0%; background:var(--accent);"></div>
          </div>
        </div>
        
        <!-- LATENCY CHECKER -->
        <div style="background:var(--surface2); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <h3 style="font-size:1rem; margin-bottom:8px;">🏓 Latency & Connection Tester</h3>
          <p style="font-size:0.75rem; color:var(--text3); margin-bottom:12px;">Perform a robust loopback test. Connect a cable from your device's MIDI Out back into its MIDI In to measure exact interface latency.</p>
          <button class="btn primary" onclick="runLatencyTest()" style="margin-bottom:8px;">Run Loopback Test</button>
          <div id="latency-results" style="font-size:0.8rem; color:var(--accent); min-height:40px;"></div>
        </div>

      </div>
    </div>
`;
html = html.replace('<!-- BACKUP PANEL -->', utilitiesPanel + '\n\n    <!-- BACKUP PANEL -->');

fs.writeFileSync('index.html', html);
console.log('patched index.html utilities');
