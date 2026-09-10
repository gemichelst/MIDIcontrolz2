const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const newFormHtml = `    <div class="form-group">
      <label>Name</label>
      <input type="text" id="new-dev-name" placeholder="My Controller">
    </div>
    <div class="form-group">
      <label>Tags (comma-separated)</label>
      <input type="text" id="new-dev-tags" placeholder="synth, live, studio">
    </div>`;

code = code.replace(/<div class="form-group">\s*<label>Name<\/label>\s*<input type="text" id="new-dev-name" placeholder="My Controller">\s*<\/div>/, newFormHtml);

const newCreateLogic = `  const tagsInput = document.getElementById('new-dev-tags')?.value || '';
  const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);

  const dev = {
    id,
    name,
    tags,`;

code = code.replace(/const dev = \{\s*id,\s*name,/, newCreateLogic);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('add device patched');
