const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const newRenderDM = `function renderDeviceManager() {
  const grid = document.getElementById('device-manager-grid');
  if (!grid) return;
  
  // Populate category dropdown
  const categorySelect = document.getElementById('dm-category');
  if (categorySelect) {
    const currentVal = categorySelect.value;
    const allTags = new Set();
    State.devices.forEach(d => {
      if (d.tags && Array.isArray(d.tags)) {
        d.tags.forEach(t => allTags.add(t));
      }
    });
    
    let html = '<option value="All">All Tags</option>';
    Array.from(allTags).sort().forEach(t => {
      html += \`<option value="\${t}">\${t}</option>\`;
    });
    categorySelect.innerHTML = html;
    if (categorySelect.querySelector(\`option[value="\${currentVal}"]\`)) {
      categorySelect.value = currentVal;
    } else {
      categorySelect.value = "All";
    }
  }

  const searchInput = document.getElementById('dm-search');
  const term = searchInput ? searchInput.value.toLowerCase() : '';
  const selectedCat = categorySelect ? categorySelect.value : 'All';

  const filtered = State.devices.filter(dev => {
    const matchesSearch = (dev.name || '').toLowerCase().includes(term) ||
      (dev.manufacturer || '').toLowerCase().includes(term) ||
      (dev.description || '').toLowerCase().includes(term);
    const matchesCat = selectedCat === 'All' || (dev.tags && dev.tags.includes(selectedCat));
    return matchesSearch && matchesCat;
  });

  grid.innerHTML = filtered.map(dev => \`
    <div class="dm-card" id="dm-card-\${dev.id}">
      <div class="dm-card-header">
        <div class="icon">\${dev.icon || '🎹'}</div>
        <div>
          <div class="name">\${dev.name}</div>
          <div class="mfr">\${dev.manufacturer || ''}</div>
        </div>
      </div>
      <div style="font-size:0.75rem;color:var(--text3);margin-bottom:4px;">
        \${(dev.tags || []).map(t => \`<span style="background:var(--surface3);padding:2px 6px;border-radius:4px;margin-right:4px;font-size:0.65rem;">\${t}</span>\`).join('')}
      </div>
      <div style="font-size:0.75rem;color:var(--text3);">\${dev.description || ''}</div>
      <div style="font-size:0.72rem;color:var(--text3);">
        \${(dev.controls?.pads?.length||0)} pads ·
        \${(dev.controls?.knobs?.length||0)} knobs ·
        \${(dev.controls?.faders?.length||0)} faders ·
        \${(dev.controls?.buttons?.length||0)} btns ·
        \${dev.presets||1} preset(s)
      </div>
      <div class="dm-card-actions">
        <button class="btn sm primary" onclick="selectDevice('\${dev.id}');showPanel('editor')">Edit</button>
        <button class="btn sm" onclick="previewPresetFromManager('\${dev.id}')">👁 Preview</button>
        <button class="btn sm" onclick="exportDeviceJSON('\${dev.id}')">📤 .json</button>
        <button class="btn sm" onclick="exportDeviceSyx('\${dev.id}')">📤 .syx</button>
        \${!DEVICE_MANIFEST.includes(dev.id)
          ? \`<button class="btn sm danger" onclick="removeDevice('\${dev.id}')">🗑 Remove</button>\`
          : '<span style="font-size:0.7rem;color:var(--text3);">built-in</span>'
        }
      </div>
    </div>
  \`).join('');
}`;

// Replace function
code = code.replace(/function renderDeviceManager\(\) \{[\s\S]*?<\span style="font-size:0\.7rem;color:var\(--text3\);">built-in<\/span>'[\s\S]*?\n\s*\}\n\s*<\/div>\n\s*`\)\.join\(''\);\n\}/, newRenderDM);

fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
console.log('patched');
