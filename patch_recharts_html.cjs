const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Inject scripts
const scriptsHtml = `
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/recharts/umd/Recharts.js" crossorigin></script>
`;
html = html.replace('</head>', scriptsHtml + '\n</head>');

// Inject chart container into monitor panel
const chartHtml = `
      <div style="background:var(--surface2); padding:12px; border-radius:8px; border:1px solid var(--border); margin-bottom:16px;">
        <h3 style="font-size:1rem; margin-bottom:8px;">Velocity Distribution</h3>
        <p style="font-size:0.75rem; color:var(--text3); margin-bottom:8px;">Real-time analysis of incoming Note On velocities.</p>
        <div id="velocity-chart-container" style="width: 100%; height: 200px;"></div>
      </div>
`;
// Put it above the monitor controls
html = html.replace(/<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">/, chartHtml + '\n      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">');

fs.writeFileSync('index.html', html);
console.log('patched recharts html');
