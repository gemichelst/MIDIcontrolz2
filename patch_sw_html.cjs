const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Insert cache-busting script right at the top of <head>
const cacheBuster = `
  <script>
    // CACHE BUSTER FOR DEVELOPMENT
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
    }
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names)
          caches.delete(name);
      });
    }
  </script>
`;

if (!html.includes('CACHE BUSTER FOR DEVELOPMENT')) {
  html = html.replace('<head>', '<head>\\n' + cacheBuster);
  fs.writeFileSync('index.html', html);
  console.log('patched index.html with cache buster');
}
