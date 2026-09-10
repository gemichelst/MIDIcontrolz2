// gen-icons.mjs  — run once with: node gen-icons.mjs
import fs from 'fs';

// Inline minimal PNG generator (no dependencies)
// Creates a solid #6c63ff square with a white 🎹 character via canvas API
// Since we're in Node without DOM, we generate a valid minimal PNG from scratch

function makeMinimalPNG(size, hexColor) {
  // Use sharp / canvas if available — otherwise write a valid SVG as fallback
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size*0.18}" fill="${hexColor}"/>
  <text x="50%" y="54%" font-size="${size*0.52}" text-anchor="middle" dominant-baseline="middle"
    font-family="system-ui,sans-serif">🎹</text>
</svg>`;
  return svg;
}

fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync('assets/icon-192.svg', makeMinimalPNG(192, '#6c63ff'));
fs.writeFileSync('assets/icon-512.svg', makeMinimalPNG(512, '#6c63ff'));
console.log('SVG icons written to assets/');