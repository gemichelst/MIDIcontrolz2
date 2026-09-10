const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const \[activeNotes, setActiveNotes\] = useState<number\[\]>\(\[\]\);\n\s*const \[previewDevice, setPreviewDevice\] = useState<DeviceConfig \| null>\(null\);\n\s*const \[searchQuery, setSearchQuery\] = useState\(''\);\n\s*const \[categoryFilter, setCategoryFilter\] = useState\('All'\);\n\s*const \[activeNotes, setActiveNotes\] = useState<number\[\]>\(\[\]\);\n\s*const \[previewDevice, setPreviewDevice\] = useState<DeviceConfig \| null>\(null\);\n\s*const \[activeNotes, setActiveNotes\] = useState<number\[\]>\(\[\]\);\n\s*const \[previewDevice, setPreviewDevice\] = useState<DeviceConfig \| null>\(null\);/g;

code = code.replace(regex, `const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [previewDevice, setPreviewDevice] = useState<DeviceConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');`);

fs.writeFileSync('src/App.tsx', code);
