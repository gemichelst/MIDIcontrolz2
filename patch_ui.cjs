const fs = require('fs');

// 1. Add velocity slider to Editor panel
let html = fs.readFileSync('index.html', 'utf8');

const sliderHtml = `
          <span style="font-size:0.75rem;color:var(--text3);">Incoming Note-On events highlight keys</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; font-size: 0.8rem; color:var(--text2);">
          <span>Velocity:</span>
          <input type="range" id="vk-velocity" min="1" max="127" value="100" style="flex:1;" oninput="document.getElementById('vk-velocity-val').textContent=this.value">
          <span id="vk-velocity-val">100</span>
        </div>
        <div id="virtual-keyboard"`;

html = html.replace(/<span style="font-size:0\.75rem;color:var\(--text3\);">Incoming Note-On events highlight keys<\/span>\n\s*<\/div>\n\s*<div id="virtual-keyboard"/, sliderHtml);

// 2. Add pulsing CSS for MIDI learn
const pulseCss = `
    @keyframes pulse-learn {
      0% { opacity: 1; filter: drop-shadow(0 0 2px #ef4444); }
      50% { opacity: 0.5; filter: drop-shadow(0 0 10px #ef4444); stroke: #ef4444; stroke-width: 3px; }
      100% { opacity: 1; filter: drop-shadow(0 0 2px #ef4444); }
    }
    .svg-learning {
      animation: pulse-learn 1.5s infinite;
      stroke: #ef4444 !important;
    }
`;
html = html.replace('</style>', pulseCss + '\n  </style>');

fs.writeFileSync('index.html', html);
console.log('index.html patched');
