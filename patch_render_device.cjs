const fs = require('fs');
let code = fs.readFileSync('public/assets/js/midicontrols.v4.js', 'utf8');

const startIdx = code.indexOf('function renderDeviceManager() {');
const endIdx = code.indexOf('function removeDevice(id) {');

const newRenderCode = `function renderDeviceManager() {
  const grid = document.getElementById('device-manager-grid');
  if (!grid) return;
  const searchInput = document.getElementById('dm-search');
  const term = searchInput ? searchInput.value.toLowerCase() : '';
  
  const categorySelect = document.getElementById('dm-category');
  const selectedTag = categorySelect ? categorySelect.value : 'All';

  // Extract tags
  const allTags = new Set();
  State.devices.forEach(d => {
    if (d.tags && Array.isArray(d.tags)) d.tags.forEach(t => allTags.add(t));
  });
  
  if (categorySelect) {
    let opts = '<option value="All">All Tags</option>';
    Array.from(allTags).sort().forEach(tag => {
      opts += \`<option value="\${tag}">\${tag}</option>\`;
    });
    if (categorySelect.innerHTML !== opts) {
      categorySelect.innerHTML = opts;
      categorySelect.value = selectedTag;
    }
  }

  // Filter
  const filtered = State.devices.filter(dev => {
    const matchTerm = (dev.name || '').toLowerCase().includes(term) ||
                      (dev.manufacturer || '').toLowerCase().includes(term) ||
                      (dev.description || '').toLowerCase().includes(term);
    const matchTag = selectedTag === 'All' || (dev.tags && dev.tags.includes(selectedTag));
    return matchTerm && matchTag;
  });

  grid.innerHTML = filtered.map(dev => {
    const tagsHtml = (dev.tags || []).map(t => \`<span style="background:var(--surface3);padding:2px 6px;border-radius:4px;font-size:0.65rem;margin-right:4px;">\${t}</span>\`).join('');
    
    return \`
    <div class="dm-card">
      <div class="dm-card-header">
        <div class="icon">\${dev.icon || '🎹'}</div>
        <div>
          <div class="name">\${dev.name}</div>
          <div class="mfr">\${dev.manufacturer || ''}</div>
        </div>
      </div>
      <div style="font-size:0.75rem;color:var(--text3);">\${dev.description || ''}</div>
      <div style="margin-top:6px;">\${tagsHtml}</div>
      <div style="font-size:0.72rem;color:var(--text3);margin-top:6px;">
        \${(dev.controls?.pads?.length||0)} pads ·
        \${(dev.controls?.knobs?.length||0)} knobs ·
        \${(dev.controls?.faders?.length||0)} faders ·
        \${(dev.controls?.buttons?.length||0)} btns ·
        \${dev.presets||1} preset(s)
      </div>
      <div class="dm-card-actions">
        <button class="btn sm primary" onclick="selectDevice('\${dev.id}');showPanel('editor')">Edit Map</button>
        \${!DEVICE_MANIFEST.includes(dev.id)
          ? \`<button class="btn sm" onclick="openEditDeviceModal('\${dev.id}')">⚙️ Config</button>\`
          : ''
        }
        <button class="btn sm" onclick="exportDeviceJSON('\${dev.id}')">📤 .json</button>
        \${!DEVICE_MANIFEST.includes(dev.id)
          ? \`<button class="btn sm danger" onclick="removeDevice('\${dev.id}')">🗑</button>\`
          : '<span style="font-size:0.7rem;color:var(--text3);">built-in</span>'
        }
      </div>
    </div>\`;
  }).join('');
}

`;

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newRenderCode + code.substring(endIdx);
  fs.writeFileSync('public/assets/js/midicontrols.v4.js', code);
  console.log('Patched renderDeviceManager successfully.');
} else {
  console.log('Failed to find indices');
}
