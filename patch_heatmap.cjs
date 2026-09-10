const fs = require('fs');
let code = fs.readFileSync('public/assets/js/mapper.js', 'utf8');

code = code.replace(/const cards = grid\.querySelectorAll\('\.dm-card'\);[\s\S]*?const card = cards\[idx\];/m, 
`window.State.devices.forEach((dev, idx) => {
      let changes = 0;
      ['pads', 'knobs', 'faders'].forEach(type => {
        if (dev.controls && dev.controls[type]) {
          dev.controls[type].forEach(c => {
            if (c.cc > 50 || c.note > 50) changes++;
          });
        }
      });
      
      const card = document.getElementById('dm-card-' + dev.id);`);

// Since we replaced the top half of the loop but missed replacing the original `window.State.devices.forEach...`, I should use a more precise regex.
