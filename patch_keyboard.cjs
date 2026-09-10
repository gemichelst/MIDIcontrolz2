const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const newKBLogic = `
window.vkIsDragging = false;
document.addEventListener('mouseup', () => { window.vkIsDragging = false; });

function vkSendNoteOn(note) {
  window.vkIsDragging = true;
  highlightKey(note, true);
  if (State.midiOut) {
    const ch = State.activePresetIndex !== undefined && getActiveDev()?.defaultPresets?.[State.activePresetIndex]?.channel || 0;
    sendMidiOut([0x90 + ch, note, 100]);
  }
}
function vkSendNoteOff(note) {
  highlightKey(note, false);
  if (State.midiOut) {
    const ch = State.activePresetIndex !== undefined && getActiveDev()?.defaultPresets?.[State.activePresetIndex]?.channel || 0;
    sendMidiOut([0x80 + ch, note, 0]);
  }
}
function vkMouseEnter(note) {
  if (window.vkIsDragging) {
    vkSendNoteOn(note);
  }
}

function renderVirtualKeyboard() {
  const vk = document.getElementById('virtual-keyboard');
  if(!vk) return;
  const startNote = 48; // C3
  let html = '';
  for(let i = 0; i < 25; i++) {
    const note = startNote + i;
    const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
    const active = activeKeys.has(note);
    if(isBlack) {
      html += \`<div id="vk-\${note}" 
        onmousedown="vkSendNoteOn(\${note})" onmouseup="vkSendNoteOff(\${note})" onmouseleave="vkSendNoteOff(\${note})" onmouseenter="vkMouseEnter(\${note})"
        ontouchstart="vkSendNoteOn(\${note})" ontouchend="vkSendNoteOff(\${note})"
        style="width:20px;height:50px;background:\${active ? '#ef4444' : '#1e293b'};margin:0 -10px;z-index:10;border:1px solid #0f172a;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer; transition: background 0.1s;"></div>\`;
    } else {
      html += \`<div id="vk-\${note}" 
        onmousedown="vkSendNoteOn(\${note})" onmouseup="vkSendNoteOff(\${note})" onmouseleave="vkSendNoteOff(\${note})" onmouseenter="vkMouseEnter(\${note})"
        ontouchstart="vkSendNoteOn(\${note})" ontouchend="vkSendNoteOff(\${note})"
        style="width:30px;height:80px;background:\${active ? '#f87171' : '#f1f5f9'};border-right:1px solid #cbd5e1;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer;z-index:0; transition: background 0.1s;"></div>\`;
    }
  }
  vk.innerHTML = html;
}
function highlightKey(note, state) {
  if(state) activeKeys.add(note);
  else activeKeys.delete(note);
  
  // Update DOM directly to prevent destroying dragging mouse events
  const el = document.getElementById('vk-' + note);
  if (el) {
    const isBlack = [1, 3, 6, 8, 10].includes((note - 48) % 12);
    if (state) {
      el.style.background = isBlack ? '#ef4444' : '#f87171';
    } else {
      el.style.background = isBlack ? '#1e293b' : '#f1f5f9';
    }
  }
}
`;

code = code.replace(/function vkSendNoteOn\(note\) \{[\s\S]*?function highlightKey\(note, state\) \{[\s\S]*?renderVirtualKeyboard\(\);\n\}/m, newKBLogic);
fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('keyboard patched');
