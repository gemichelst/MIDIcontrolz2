const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const jsCode = `
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
  
  const display = document.getElementById('vk-octave-display');
  if(display) {
    display.textContent = noteName(startNote) + ' - ' + noteName(startNote + 24);
  }
}
`;

// Replace renderVirtualKeyboard definition up to highlightKey
code = code.replace(/function renderVirtualKeyboard\(\) \{[\s\S]*?function highlightKey/, jsCode + '\nfunction highlightKey');

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched vk js');
