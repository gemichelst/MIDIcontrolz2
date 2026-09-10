const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const rechartsJs = `
// ============================================================
//  VELOCITY VISUALIZATION (RECHARTS)
// ============================================================
window.velocityData = [
  { name: '0-20', count: 0 },
  { name: '21-40', count: 0 },
  { name: '41-60', count: 0 },
  { name: '61-80', count: 0 },
  { name: '81-100', count: 0 },
  { name: '101-127', count: 0 }
];

window.renderVelocityChart = function() {
  const container = document.getElementById('velocity-chart-container');
  if (!container || !window.React || !window.Recharts) return;
  
  const e = React.createElement;
  const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = window.Recharts;
  
  const chart = e(ResponsiveContainer, { width: '100%', height: '100%' },
    e(BarChart, { data: window.velocityData },
      e(CartesianGrid, { strokeDasharray: '3 3', stroke: '#334155' }),
      e(XAxis, { dataKey: 'name', stroke: '#94a3b8', fontSize: 10 }),
      e(YAxis, { stroke: '#94a3b8', fontSize: 10, allowDecimals: false }),
      e(Tooltip, { 
        contentStyle: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', fontSize: '12px' },
        itemStyle: { color: '#3b82f6' }
      }),
      e(Bar, { dataKey: 'count', fill: '#3b82f6', radius: [4, 4, 0, 0] })
    )
  );
  
  if (!window.velocityChartRoot) {
    window.velocityChartRoot = ReactDOM.createRoot(container);
  }
  window.velocityChartRoot.render(chart);
};

// Hook into the original onMidiMessage to capture velocity data
const originalProcessForVelocity = window.onMidiMessage;
window.onMidiMessage = function(event) {
  const data = event.data;
  const type = data[0] >> 4;
  
  // Note On
  if (type === 0x9 && data[2] > 0) {
    const vel = data[2];
    if (vel <= 20) window.velocityData[0].count++;
    else if (vel <= 40) window.velocityData[1].count++;
    else if (vel <= 60) window.velocityData[2].count++;
    else if (vel <= 80) window.velocityData[3].count++;
    else if (vel <= 100) window.velocityData[4].count++;
    else window.velocityData[5].count++;
    
    // throttle chart updates slightly or update on every note?
    // Since it's local, update on every note is fine for now, but requestAnimationFrame is safer.
    if (!window.velocityChartPending) {
      window.velocityChartPending = true;
      requestAnimationFrame(() => {
        window.renderVelocityChart();
        window.velocityChartPending = false;
      });
    }
  }
  
  if (originalProcessForVelocity) originalProcessForVelocity(event);
};

// Call once on init to draw empty chart
setTimeout(() => {
  if (document.getElementById('velocity-chart-container')) {
    window.renderVelocityChart();
  }
}, 1000);
`;

code += '\n' + rechartsJs;
fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched recharts js');
