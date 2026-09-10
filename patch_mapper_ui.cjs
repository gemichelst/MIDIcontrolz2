const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newHeader = `
      <!-- MIDI MAPPER & SVG ENGINE -->
      <div id="midi-mapper-section" style="display:none; margin-top:20px; background:var(--surface2); padding:12px; border-radius:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h2 style="font-size:1.1rem;margin:0;">Visual MIDI Mapper (Drag & Drop)</h2>
          <div style="display:flex; gap:8px;">
            <button class="btn sm" id="btn-mapper-learn" onclick="toggleMapperLearn()">🎛 Learn: OFF</button>
            <button class="btn sm primary" onclick="exportSvgMapping()">💾 Export Mapping</button>
          </div>
        </div>
        <p style="font-size:0.85rem;color:var(--text3);margin-bottom:10px;">Drag CC numbers onto the SVG controls to map them instantly. Click a control to edit.</p>
`;
html = html.replace(/<!-- MIDI MAPPER & SVG ENGINE -->\n\s*<div id="midi-mapper-section"[\s\S]*?<p.*?Drag CC numbers.*?<\/p>/, newHeader);

const cssToAdd = `
    .svg-drop-target {
      stroke: #22c55e !important;
      stroke-width: 3px !important;
      filter: drop-shadow(0 0 6px #22c55e);
    }
    .svg-selected-learn {
      stroke: #eab308 !important;
      stroke-width: 3px !important;
      animation: pulse-learn 1.5s infinite;
    }
`;
html = html.replace('</style>', cssToAdd + '\n  </style>');

fs.writeFileSync('index.html', html);
console.log('patched index.html for mapper UI');
