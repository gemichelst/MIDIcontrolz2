const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const missingCode = `
window.vkOctaveShift = 0;

function changeVkOctave(dir) {
  window.vkOctaveShift += dir;
  if (window.vkOctaveShift < -2) window.vkOctaveShift = -2;
  if (window.vkOctaveShift > 2)  window.vkOctaveShift = 2;
  renderVirtualKeyboard();
}

function renderVirtualKeyboard() {
  const vk = document.getElementById('virtual-keyboard');
  if(!vk) return;
  const startNote = 48 + (window.vkOctaveShift * 12); 
  let html = '';
  for(let i = 0; i < 25; i++) {
    const note = startNote + i;
    const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
    const active = activeKeys.has(note);
    if(isBlack) {
      html += \\\`<div id="vk-\\\${note}" 
        onmousedown="vkSendNoteOn(\\\${note})" onmouseup="vkSendNoteOff(\\\${note})" onmouseleave="vkSendNoteOff(\\\${note})" onmouseenter="vkMouseEnter(\\\${note})"
        ontouchstart="vkSendNoteOn(\\\${note})" ontouchend="vkSendNoteOff(\\\${note})"
        style="width:20px;height:50px;background:\\\${active ? '#ef4444' : '#1e293b'};margin:0 -10px;z-index:10;border:1px solid #0f172a;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer; transition: background 0.1s;"></div>\\\`;
    } else {
      html += \\\`<div id="vk-\\\${note}" 
        onmousedown="vkSendNoteOn(\\\${note})" onmouseup="vkSendNoteOff(\\\${note})" onmouseleave="vkSendNoteOff(\\\${note})" onmouseenter="vkMouseEnter(\\\${note})"
        ontouchstart="vkSendNoteOn(\\\${note})" ontouchend="vkSendNoteOff(\\\${note})"
        style="width:30px;height:80px;background:\\\${active ? '#f87171' : '#f1f5f9'};border-right:1px solid #cbd5e1;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer;z-index:0; transition: background 0.1s;"></div>\\\`;
    }
  }
  vk.innerHTML = html;
  
  if (typeof drawVkCurve === 'function') drawVkCurve();
  const display = document.getElementById('vk-octave-display');
  if(display) {
    display.textContent = noteName(startNote) + ' - ' + noteName(startNote + 24);
  }
}

function highlightKey(note, state) {
  if(state) activeKeys.add(note);
  else activeKeys.delete(note);
  const el = document.getElementById('vk-' + note);
  if(!el) return;
  const isBlack = el.style.width === '20px';
  if(state) el.style.background = isBlack ? '#ef4444' : '#f87171';
  else      el.style.background = isBlack ? '#1e293b' : '#f1f5f9';
}
`;

// Insert it right before init()
const initIdx = code.indexOf('async function init() {');
if (initIdx !== -1) {
  code = code.substring(0, initIdx) + missingCode + '\n' + code.substring(initIdx);
}

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('injected missing virtual keyboard code');
