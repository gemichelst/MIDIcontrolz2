const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Replace vkSendNoteOn and vkSendNoteOff manually
const replaceVkFunctions = `
window.vkIsDragging = false;
document.addEventListener('mouseup', () => { window.vkIsDragging = false; });

window.vkSendNoteOnRaw = function(note) {
  window.vkIsDragging = true;
  const qNote = typeof quantizeNote === 'function' ? quantizeNote(note) : note;
  if (State.midiOut) {
    const ch = State.activePresetIndex !== undefined && getActiveDev()?.defaultPresets?.[State.activePresetIndex]?.channel || 0;
    const velRaw = parseInt(document.getElementById('vk-velocity')?.value || 100);
    const vel = typeof applyVelocityCurve === 'function' ? applyVelocityCurve(velRaw) : velRaw;
    sendMidiOut([0x90 + ch, qNote, vel]);
  }
  highlightKey(note, true);
};

window.vkSendNoteOffRaw = function(note) {
  const qNote = typeof quantizeNote === 'function' ? quantizeNote(note) : note;
  if (State.midiOut && activeKeys.has(note)) {
    const ch = State.activePresetIndex !== undefined && getActiveDev()?.defaultPresets?.[State.activePresetIndex]?.channel || 0;
    sendMidiOut([0x80 + ch, qNote, 0]);
  }
  highlightKey(note, false);
};

window.vkMouseEnterRaw = function(note) {
  if (window.vkIsDragging && !activeKeys.has(note)) {
    window.vkSendNoteOnRaw(note);
  }
};
`;

// Now strip the old functions
code = code.replace(/window\.vkIsDragging = false;[\s\S]*?function vkMouseEnter\(note\) \{[\s\S]*?\}\s*\}/, replaceVkFunctions);

// To avoid issues with HTML calling \`vkSendNoteOn\`, we map the old names to the new ones at the global scope.
const globalBindings = `
function vkSendNoteOn(note) { window.vkSendNoteOnRaw(note); }
function vkSendNoteOff(note) { window.vkSendNoteOffRaw(note); }
function vkMouseEnter(note) { window.vkMouseEnterRaw(note); }
`;
code += '\n' + globalBindings;

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('fixed vk quantizer logic');
