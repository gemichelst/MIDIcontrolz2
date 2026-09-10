const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

// Insert ping logic inside handleSysExIn
const pingLogic = `  if (data[0] === 0xF0 && data[1] === 0x7E && data[3] === 0x06 && data[4] === 0x02) {
    if (window.pingStartTime) {
      const ms = Math.round(performance.now() - window.pingStartTime);
      const span = document.getElementById('ping-result');
      if (span) span.innerHTML = \`Latency: <strong>\${ms}ms</strong>\`;
      window.pingStartTime = 0;
    }
  }\n\n`;

code = code.replace(/function handleSysExIn\(data\) \{/, 'function handleSysExIn(data) {\n' + pingLogic);

// Add pingDevice function
const pingFunc = `window.pingDevice = function() {
  const span = document.getElementById('ping-result');
  if (!State.midiOut || !State.midiIn) {
    if (span) span.innerHTML = '<span style="color:#ef4444;">Err: Connect In & Out</span>';
    return;
  }
  if (span) span.innerHTML = 'Pinging...';
  window.pingStartTime = performance.now();
  sendMidiOut([0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]);
  setTimeout(() => {
    if (window.pingStartTime !== 0 && span && span.innerHTML === 'Pinging...') {
      span.innerHTML = '<span style="color:#ef4444;">Timeout (No Reply)</span>';
      window.pingStartTime = 0;
    }
  }, 2000);
};
`;

code += '\n' + pingFunc;
fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('ping patched');
