const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const updateFunc = `
function updateSignalFlow() {
  const sfInd = document.getElementById('signal-flow-indicator');
  const sfIn = document.getElementById('sf-in');
  const sfOut = document.getElementById('sf-out');
  if (!sfInd) return;
  
  if (State.settings.thru && State.midiIn && State.midiOut) {
    sfInd.style.display = 'flex';
    sfIn.textContent = State.midiIn.name || 'Unknown';
    sfOut.textContent = State.midiOut.name || 'Unknown';
  } else {
    sfInd.style.display = 'none';
  }
}
`;

// Insert the new function
code += updateFunc;

// Call it in connectMidiPorts
code = code.replace(/function connectMidiPorts\(\) \{([\s\S]*?)State.settings.lastOut = outId;/, `function connectMidiPorts() {$1State.settings.lastOut = outId; updateSignalFlow();`);

// Call it in renderSettings
code = code.replace(/function renderSettings\(\) \{([\s\S]*?)document.getElementById\('tog-thru'\).className = State.settings.thru \? 'toggle on' : 'toggle';/, `function renderSettings() {$1document.getElementById('tog-thru').className = State.settings.thru ? 'toggle on' : 'toggle'; updateSignalFlow();`);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched midicontrols for signal flow');
