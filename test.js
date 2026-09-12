const html = require('fs').readFileSync('index.html', 'utf8');
console.log(html.includes('ondragleave="this.classList.remove(\'container-glow\')"'));
