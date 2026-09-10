const fs = require('fs');
let code = fs.readFileSync('public/assets/js/mapper.js', 'utf8');

const newHeatmap = `if (heatmapMode) {
    const grid = document.getElementById('device-manager-grid');
    if (!grid) return;
    
    window.State.devices.forEach((dev) => {
      let changes = 0;
      ['pads', 'knobs', 'faders'].forEach(type => {
        if (dev.controls && dev.controls[type]) {
          dev.controls[type].forEach(c => {
            if (c.cc > 50 || c.note > 50) changes++;
          });
        }
      });
      
      const card = document.getElementById('dm-card-' + dev.id);
      if (card) {
        if (changes > 5) {
          card.style.border = '2px solid #ef4444';
          card.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.4)';
          let badge = document.createElement('div');
          badge.innerHTML = '🔥 ' + changes + ' Overrides';
          badge.style.color = '#ef4444';
          badge.style.fontWeight = 'bold';
          badge.style.marginTop = '10px';
          card.appendChild(badge);
        } else if (changes > 0) {
          card.style.border = '2px solid #f59e0b';
          let badge = document.createElement('div');
          badge.innerHTML = '⚡ ' + changes + ' Overrides';
          badge.style.color = '#f59e0b';
          badge.style.fontWeight = 'bold';
          badge.style.marginTop = '10px';
          card.appendChild(badge);
        }
      }
    });
  }`;

code = code.replace(/if \(heatmapMode\) \{[\s\S]*?\}\n    \}\);\n  \}/m, newHeatmap);
fs.writeFileSync('public/assets/js/mapper.js', code);
console.log('heatmap patched');
