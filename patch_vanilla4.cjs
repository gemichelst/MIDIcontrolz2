const fs = require('fs');
let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// 1. Fix broken SysEx Template Receiver Hook
const brokenHookTarget = `const originalHandleMidiMessage = handleMidiMessage;
handleMidiMessage = function(portId, e) {
  const data = e.data;
  if(data[0] === 0xF0 && data.length > 50) {
    // Looks like a bulk dump
    receivedTemplates.push(data);
    renderReceivedTemplates();
    toast("SysEx Template Captured", "info");
  }
  originalHandleMidiMessage(portId, e);
};`;
const brokenHookReplacement = `const originalOnMidiMessage = onMidiMessage;
onMidiMessage = function(event) {
  const data = event.data;
  if(data[0] === 0xF0 && data.length > 50) {
    // Looks like a bulk dump
    receivedTemplates.push(data);
    if(typeof renderReceivedTemplates === 'function') renderReceivedTemplates();
    toast("SysEx Template Captured", "info");
  }
  originalOnMidiMessage(event);
};`;
if (js.includes('originalHandleMidiMessage')) {
  js = js.replace(brokenHookTarget, brokenHookReplacement);
}

// 2. MIDI Panic 
const panicTarget = `function midiPanic() {
  if (!State.midiOut) {
    toast("No MIDI Out selected", "error");
    return;
  }
  for (let ch = 0; ch < 16; ch++) {
    State.midiOut.send([0xB0 + ch, 120, 0]); // All Sound Off
    State.midiOut.send([0xB0 + ch, 123, 0]); // All Notes Off
    State.midiOut.send([0xB0 + ch, 64, 0]);  // Sustain off
  }
  toast("MIDI Panic: All Notes & Sound Off sent", "info");
}`;
const panicReplacement = `function midiPanic() {
  if (!State.midiOut) {
    toast("No MIDI Out selected", "error");
    return;
  }
  for (let ch = 0; ch < 16; ch++) {
    State.midiOut.send([0xB0 + ch, 0x7B, 0]); // All Notes Off (B0 7B 00)
    State.midiOut.send([0xB0 + ch, 120, 0]); // All Sound Off
    State.midiOut.send([0xB0 + ch, 64, 0]);  // Sustain off
  }
  toast("MIDI Panic: All Notes Off (B0 7B 00) sent", "info");
}`;
if (js.includes('All Notes & Sound Off sent')) {
  js = js.replace(panicTarget, panicReplacement);
}

// 3. MIDI Learn on Knobs
const knobLabelTarget = `<div class="knob-label">\${kd.label}</div>`;
const knobLabelReplacement = `<div class="knob-label" style="display:flex; justify-content:space-between; align-items:center; padding:0 4px;">
          <span>\${kd.label}</span>
          <button class="midi-learn-btn" onclick="startMidiLearn('knob','\${ki}',this)" style="font-size:0.5rem; padding:1px 4px; opacity:0.7;">LEARN</button>
        </div>`;
js = js.replace(knobLabelTarget, knobLabelReplacement);

// 4. JSON Editor Validation in Hardware Mapping Editor
const endOfRenderEditorTarget = `    });
    html += \`</div>\`;
  }
  container.innerHTML = html;
}`;
const endOfRenderEditorReplacement = `    });
    html += \`</div>\`;
  }
  
  // JSON EDITOR SECTION
  html += sectionHeader('JSON Config Draft');
  html += \`
    <div style="display:flex; flex-direction:column; gap:8px;">
      <textarea id="json-editor-textarea" style="width:100%; height:200px; font-family:monospace; font-size:0.8rem; padding:8px; background:var(--surface2); color:var(--text); border:1px solid var(--border); border-radius:4px; outline:none; resize:vertical;" oninput="validateJsonEditor()"></textarea>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span id="json-editor-error" style="color:var(--accent); font-size:0.85rem; font-weight:600;"></span>
        <button id="json-editor-save-btn" class="btn primary sm" onclick="saveJsonEditor()">Save JSON Preset</button>
      </div>
    </div>
  \`;

  container.innerHTML = html;

  // Populate JSON Editor
  setTimeout(() => {
    const ta = document.getElementById('json-editor-textarea');
    if (ta) ta.value = JSON.stringify(dev, null, 2);
    validateJsonEditor();
  }, 0);
}

function validateJsonEditor() {
  const ta = document.getElementById('json-editor-textarea');
  const err = document.getElementById('json-editor-error');
  const btn = document.getElementById('json-editor-save-btn');
  if(!ta || !err || !btn) return;
  try {
    JSON.parse(ta.value);
    ta.style.borderColor = 'var(--border)';
    ta.style.backgroundColor = 'var(--surface2)';
    err.textContent = '';
    btn.disabled = false;
    btn.style.opacity = '1';
  } catch(e) {
    ta.style.borderColor = 'var(--accent)';
    ta.style.backgroundColor = 'rgba(255, 60, 60, 0.05)';
    err.textContent = 'Syntax Error: ' + e.message;
    btn.disabled = true;
    btn.style.opacity = '0.5';
  }
}

function saveJsonEditor() {
  const ta = document.getElementById('json-editor-textarea');
  try {
    const parsed = JSON.parse(ta.value);
    const activeId = State.activeDeviceId;
    const idx = State.devices.findIndex(d => d.id === activeId);
    if (idx !== -1) {
      State.devices[idx] = parsed;
      save();
      renderDeviceEditor();
      toast('JSON Configuration Saved ✓', 'success');
    }
  } catch(e) {
    toast('Cannot save invalid JSON', 'error');
  }
}`;
js = js.replace(endOfRenderEditorTarget, endOfRenderEditorReplacement);

// 5. Preview Modal in Device Manager
const dmExportJsonTarget = `<button class="btn sm" onclick="exportDeviceJSON('\${dev.id}')">📤 .json</button>`;
const dmExportJsonReplacement = `<button class="btn sm" onclick="previewPresetFromManager('\${dev.id}')">👁 Preview</button>
        <button class="btn sm" onclick="exportDeviceJSON('\${dev.id}')">📤 .json</button>`;
js = js.replace(dmExportJsonTarget, dmExportJsonReplacement);

const previewModalLogic = `
function previewPresetFromManager(id) {
  const dev = State.devices.find(d => d.id === id);
  if (!dev) return;
  
  const preset = dev.defaultPresets?.[0] || {};
  const tags = dev.tags && dev.tags.length > 0 ? dev.tags.join(', ') : 'None';
  
  let knobsHtml = (preset.knobs || dev.controls?.knobs || []).map(k => \`<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--surface3);padding:2px 0;"><span>\${k.label || 'Knob'}</span><span>CC \${k.cc}</span></div>\`).join('');
  let padsHtml = (preset.pads || dev.controls?.pads || []).map(p => \`<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--surface3);padding:2px 0;"><span>\${p.label || 'Pad'}</span><span>Note \${p.note}</span></div>\`).join('');
  
  const html = \`
    <h3 style="margin-top:0;font-size:1.2rem;border-bottom:1px solid var(--border);padding-bottom:8px;">Preview: \${dev.name}</h3>
    <p style="font-size:0.85rem;color:var(--text2);margin-bottom:12px;">\${dev.description||'No description provided.'}</p>
    <div style="font-size:0.85rem;margin-bottom:12px;background:var(--surface2);padding:6px;border-radius:4px;"><strong>Tags:</strong> \${tags}</div>
    <div style="display:flex;gap:16px;flex-wrap:wrap;">
      <div style="flex:1;min-width:200px;">
        <h4 style="border-bottom:1px solid var(--border);padding-bottom:4px;margin-bottom:8px;font-size:1rem;">Mapped Knobs</h4>
        <div style="font-size:0.8rem;height:140px;overflow-y:auto;background:var(--surface2);padding:8px;border-radius:6px;border:1px solid var(--border);">
          \${knobsHtml || '<span style="color:var(--text3);">No knobs mapped</span>'}
        </div>
      </div>
      <div style="flex:1;min-width:200px;">
        <h4 style="border-bottom:1px solid var(--border);padding-bottom:4px;margin-bottom:8px;font-size:1rem;">Mapped Pads</h4>
        <div style="font-size:0.8rem;height:140px;overflow-y:auto;background:var(--surface2);padding:8px;border-radius:6px;border:1px solid var(--border);">
          \${padsHtml || '<span style="color:var(--text3);">No pads mapped</span>'}
        </div>
      </div>
    </div>
    <div style="margin-top:20px;display:flex;gap:12px;justify-content:flex-end;">
      <button class="btn" onclick="closeModal()">Close Preview</button>
      <button class="btn primary" onclick="closeModal(); selectDevice('\${dev.id}'); showPanel('editor');">Load in Editor</button>
    </div>
  \`;
  openModal(html);
}
`;
js = js + previewModalLogic;


// 6. Export as .syx in Hardware Mapping Editor
const editorActionsTarget = `<button class="btn" onclick="exportPresetJSON()">📤 Export JSON</button>`;
const editorActionsReplacement = `<button class="btn" onclick="exportPresetJSON()">📤 Export JSON</button>
        <button class="btn" onclick="exportDeviceSyx('\${dev.id}')">📤 Export .syx</button>`;
js = js.replace(editorActionsTarget, editorActionsReplacement);


fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log('Patch complete!');
