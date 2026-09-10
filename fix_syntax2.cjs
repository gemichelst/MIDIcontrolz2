const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

code = code.replace(/html \+= \\`<div/g, 'html += `<div');
code = code.replace(/\\`\;/g, '`;');
code = code.replace(/\\\$\\\{note\\\}/g, '${note}');
code = code.replace(/\\\$\\\{active \?/g, '${active ?');

// actually, let's just write the whole block to be safe.
const sIdx = code.indexOf('if(isBlack) {');
const eIdx = code.indexOf('vk.innerHTML = html;');
if (sIdx !== -1 && eIdx !== -1) {
  const goodCode = `if(isBlack) {
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
  `;
  code = code.substring(0, sIdx) + goodCode + code.substring(eIdx);
}

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
