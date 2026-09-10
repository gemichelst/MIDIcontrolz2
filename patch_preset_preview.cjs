const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const previewLogic = `
window.showPresetPreview = function(event, presetIndex) {
  const dev = getActiveDev();
  if (!dev || !dev.defaultPresets || !dev.defaultPresets[presetIndex]) return;
  const p = dev.defaultPresets[presetIndex];
  
  let tooltip = document.getElementById('preset-preview-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'preset-preview-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'var(--surface2)';
    tooltip.style.border = '1px solid var(--border)';
    tooltip.style.borderRadius = '6px';
    tooltip.style.padding = '8px 12px';
    tooltip.style.color = 'var(--text)';
    tooltip.style.zIndex = '9999';
    tooltip.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.fontSize = '0.75rem';
    document.body.appendChild(tooltip);
  }
  
  const pads = (p.pads || []).length || (dev.controls?.pads || []).length;
  const knobs = (p.knobs || []).length || (dev.controls?.knobs || []).length;
  const faders = (p.faders || []).length || (dev.controls?.faders || []).length;
  
  tooltip.innerHTML = \`
    <strong style="display:block;margin-bottom:4px;font-size:0.85rem;color:var(--accent);">\${p.name || 'Preset ' + (presetIndex+1)} Preview</strong>
    <div style="display:grid;grid-template-columns:auto auto;gap:4px 12px;color:var(--text2);">
      <span>Pads Mapped:</span> <strong>\${pads}</strong>
      <span>Knobs Mapped:</span> <strong>\${knobs}</strong>
      <span>Faders Mapped:</span> <strong>\${faders}</strong>
      <span>MIDI Channel:</span> <strong>\${(p.channel ?? 0) + 1}</strong>
    </div>
  \`;
  
  tooltip.style.display = 'block';
  tooltip.style.left = (event.pageX + 15) + 'px';
  tooltip.style.top = (event.pageY + 15) + 'px';
};

window.hidePresetPreview = function() {
  const tooltip = document.getElementById('preset-preview-tooltip');
  if (tooltip) tooltip.style.display = 'none';
};
`;

code = code.replace(/<button class="preset-tab \$\{i === State\.activePresetIndex \? 'active' : ''\}"/g, 
  `<button class="preset-tab \${i === State.activePresetIndex ? 'active' : ''}" onmouseenter="showPresetPreview(event, \${i})" onmouseleave="hidePresetPreview()" onmousemove="showPresetPreview(event, \${i})" `);

code += '\n' + previewLogic;
fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched preset preview');
