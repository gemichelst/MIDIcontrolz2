const fs = require('fs');
let js = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');

// Hook highlightKey into onMidiMessage
const noteOnTarget = `msg = { type:'note_on', ch, note:data[1], vel:data[2], timestamp:ts };
    State.liveValues[\`note_\${ch}_\${data[1]}\`] = data[2];
    if (State.settings.highlight) highlightPad(ch, data[1], true);`;
const noteOnReplacement = `msg = { type:'note_on', ch, note:data[1], vel:data[2], timestamp:ts };
    State.liveValues[\`note_\${ch}_\${data[1]}\`] = data[2];
    if (State.settings.highlight) highlightPad(ch, data[1], true);
    if (typeof highlightKey === 'function') highlightKey(data[1], true);`;
js = js.replace(noteOnTarget, noteOnReplacement);

const noteOffTarget = `msg = { type:'note_off', ch, note:data[1], vel:0, timestamp:ts };
    State.liveValues[\`note_\${ch}_\${data[1]}\`] = 0;
    if (State.settings.highlight) highlightPad(ch, data[1], false);`;
const noteOffReplacement = `msg = { type:'note_off', ch, note:data[1], vel:0, timestamp:ts };
    State.liveValues[\`note_\${ch}_\${data[1]}\`] = 0;
    if (State.settings.highlight) highlightPad(ch, data[1], false);
    if (typeof highlightKey === 'function') highlightKey(data[1], false);`;
js = js.replace(noteOffTarget, noteOffReplacement);

// Make Virtual Keyboard actually render properly and handle clicks
const vkLogicTarget = `let activeKeys = new Set();
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
      html += \`<div id="vk-\${note}" style="width:20px;height:50px;background:\${active ? '#ef4444' : '#1e293b'};margin:0 -10px;z-index:10;border:1px solid #0f172a;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer;"></div>\`;
    } else {
      html += \`<div id="vk-\${note}" style="width:30px;height:80px;background:\${active ? '#f87171' : '#f1f5f9'};border-right:1px solid #cbd5e1;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer;z-index:0;"></div>\`;
    }
  }
  vk.innerHTML = html;
}
function highlightKey(note, state) {
  if(state) activeKeys.add(note);
  else activeKeys.delete(note);
  renderVirtualKeyboard();
}`;
const vkLogicReplacement = `let activeKeys = new Set();
function vkSendNoteOn(note) {
  highlightKey(note, true);
  if (State.midiOut) {
    const ch = State.activePresetIndex !== undefined && getActiveDev()?.defaultPresets?.[State.activePresetIndex]?.channel || 0;
    State.midiOut.send([0x90 + ch, note, 100]);
  }
}
function vkSendNoteOff(note) {
  highlightKey(note, false);
  if (State.midiOut) {
    const ch = State.activePresetIndex !== undefined && getActiveDev()?.defaultPresets?.[State.activePresetIndex]?.channel || 0;
    State.midiOut.send([0x80 + ch, note, 0]);
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
        onmousedown="vkSendNoteOn(\${note})" onmouseup="vkSendNoteOff(\${note})" onmouseleave="vkSendNoteOff(\${note})" ontouchstart="vkSendNoteOn(\${note})" ontouchend="vkSendNoteOff(\${note})"
        style="width:20px;height:50px;background:\${active ? '#ef4444' : '#1e293b'};margin:0 -10px;z-index:10;border:1px solid #0f172a;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer; transition: background 0.1s;"></div>\`;
    } else {
      html += \`<div id="vk-\${note}" 
        onmousedown="vkSendNoteOn(\${note})" onmouseup="vkSendNoteOff(\${note})" onmouseleave="vkSendNoteOff(\${note})" ontouchstart="vkSendNoteOn(\${note})" ontouchend="vkSendNoteOff(\${note})"
        style="width:30px;height:80px;background:\${active ? '#f87171' : '#f1f5f9'};border-right:1px solid #cbd5e1;border-bottom-left-radius:3px;border-bottom-right-radius:3px;cursor:pointer;z-index:0; transition: background 0.1s;"></div>\`;
    }
  }
  vk.innerHTML = html;
}
function highlightKey(note, state) {
  if(state) activeKeys.add(note);
  else activeKeys.delete(note);
  renderVirtualKeyboard();
}`;
js = js.replace(vkLogicTarget, vkLogicReplacement);

// Make sure virtual keyboard is displayed in the HTML properly and isn't hidden.
// Wait, the user said it wasn't rendered. Let's see if renderDeviceEditor hides it.
// The welcome screen logic in renderDeviceEditor:
const editorHtmlTarget = `welcome.style.display = 'none';
  container.style.display = '';`;

const editorHtmlReplacement = `welcome.style.display = 'none';
  container.style.display = '';
  renderVirtualKeyboard();`;
js = js.replace(editorHtmlTarget, editorHtmlReplacement);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', js);
console.log("Virtual Keyboard fixed");
