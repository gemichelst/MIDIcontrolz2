const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const curveJs = `
window.vkCurveType = 'linear';

function updateVkCurve() {
  const select = document.getElementById('vk-curve-type');
  if (select) window.vkCurveType = select.value;
  drawVkCurve();
}

function drawVkCurve() {
  const canvas = document.getElementById('vk-curve-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  
  ctx.clearRect(0, 0, w, h);
  
  // Draw grid
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
  ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
  ctx.stroke();
  
  // Draw curve
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= w; x++) {
    const normX = x / w; // 0 to 1
    let normY = normX;
    if (window.vkCurveType === 'exp') normY = Math.pow(normX, 2);
    else if (window.vkCurveType === 'log') normY = Math.sqrt(normX);
    
    const y = h - (normY * h);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function applyVelocityCurve(vel) {
  const normX = vel / 127;
  let normY = normX;
  if (window.vkCurveType === 'exp') normY = Math.pow(normX, 2);
  else if (window.vkCurveType === 'log') normY = Math.sqrt(normX);
  return Math.round(normY * 127);
}
`;

code += '\n' + curveJs;

// Add drawVkCurve to renderVirtualKeyboard
code = code.replace(/const display = document.getElementById\('vk-octave-display'\);/, 'drawVkCurve();\n  const display = document.getElementById(\'vk-octave-display\');');

// Update onMidiMessage to apply curve to incoming notes if we want to customize velocity sensitivity for INCOMING notes.
// Wait, prompt says: "customize velocity sensitivity for incoming MIDI notes, providing a graphical representation of the input-to-output mapping."
// So when we receive a note_on, we should modify its velocity before processing it further, or update the live display?
// "customize velocity sensitivity for incoming MIDI notes... input-to-output mapping" 
// Let's modify the velocity in onMidiMessage for note_on!
const velocityProcess = `
  if (type === 0x9 && data[2] > 0) {
    data[2] = typeof applyVelocityCurve === 'function' ? applyVelocityCurve(data[2]) : data[2];
`;
code = code.replace(/if \(type === 0x9 && data\[2\] > 0\) \{/, velocityProcess);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched curve js');
