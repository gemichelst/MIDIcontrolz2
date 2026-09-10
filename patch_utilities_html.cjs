const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newUtilsHtml = `
        <!-- MIDI MULTI-TRACK RECORDER -->
        <div style="background:var(--surface2); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <h3 style="font-size:1rem; margin-bottom:8px;">📼 MIDI Event Recorder</h3>
          <p style="font-size:0.75rem; color:var(--text3); margin-bottom:12px;">Capture incoming MIDI and loop or play it back to the active Output.</p>
          <div style="display:flex; gap:8px; margin-bottom:12px;">
            <button class="btn" id="btn-recorder-rec" onclick="toggleMidiRecord()">🔴 Record</button>
            <button class="btn" id="btn-recorder-play" onclick="toggleMidiPlayback()">▶ Play</button>
            <button class="btn sm" onclick="clearMidiRecord()">🗑 Clear</button>
          </div>
          <div style="font-size:0.8rem; color:var(--text2); display:flex; justify-content:space-between;">
            <span>Status: <strong id="recorder-status" style="color:var(--text);">Idle</strong></span>
            <span>Events: <strong id="recorder-count" style="color:var(--text);">0</strong></span>
          </div>
        </div>

        <!-- CHORD MEMORY -->
        <div style="background:var(--surface2); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <h3 style="font-size:1rem; margin-bottom:8px;">🧠 Chord Memory</h3>
          <p style="font-size:0.75rem; color:var(--text3); margin-bottom:12px;">Map a single physical incoming note to a custom chord voicing.</p>
          <div style="display:flex; gap:8px; margin-bottom:12px;">
            <button class="btn" id="btn-cm-trigger" onclick="learnCmTrigger()">🎯 Learn Trigger</button>
            <button class="btn" id="btn-cm-chord" onclick="learnCmChord()">🎹 Learn Chord</button>
            <button class="btn sm primary" onclick="toggleChordMemory()" id="btn-cm-active">Enable: OFF</button>
          </div>
          <div style="font-size:0.8rem; color:var(--text2);">
            <div style="margin-bottom:4px;">Trigger Note: <strong id="cm-trigger-note" style="color:var(--text);">None</strong></div>
            <div>Chord Notes: <strong id="cm-chord-notes" style="color:var(--text);">None</strong></div>
          </div>
        </div>
`;

html = html.replace('<!-- LFO GENERATOR -->', newUtilsHtml + '\n        <!-- LFO GENERATOR -->');
fs.writeFileSync('index.html', html);
console.log('patched utilities html');
