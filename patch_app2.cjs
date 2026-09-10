const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Imports
code = code.replace(/import \{ Settings, Save, Upload, Monitor, Edit3, Type, Layers, Send, Target, DownloadCloud, Menu, X, AlertOctagon \} from 'lucide-react';/, "import { Settings, Save, Upload, Monitor, Edit3, Type, Layers, Send, Target, DownloadCloud, Menu, X, AlertOctagon, Eye, Search, Filter } from 'lucide-react';");

// 2. VirtualKeyboard params
const vkTarget = `const VirtualKeyboard = ({ onPlayNote, onStopNote }: { onPlayNote: (n: number) => void, onStopNote: (n: number) => void }) => {
  const startNote = 48; // C3
  const keys = Array.from({length: 25}, (_, i) => {
    const note = startNote + i;
    const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
    return { note, isBlack };
  });

  return (
    <div className="flex relative h-32 mt-8 mb-4 border border-slate-700 bg-slate-900 rounded shadow-lg overflow-hidden w-max">
      {keys.map(k => (
        <div 
          key={k.note} 
          onMouseDown={() => onPlayNote(k.note)}
          onMouseUp={() => onStopNote(k.note)}
          onMouseLeave={() => onStopNote(k.note)}
          className={\`cursor-pointer \${k.isBlack ? 'bg-slate-900 hover:bg-slate-700 w-8 h-20 -mx-4 z-10 border border-slate-950' : 'bg-slate-100 hover:bg-slate-300 w-12 h-32 z-0 border-r border-slate-300'} rounded-b-md transition-colors\`}
        />
      ))}
    </div>
  );
};`;

const vkReplacement = `const VirtualKeyboard = ({ onPlayNote, onStopNote, activeNotes = [] }: { onPlayNote: (n: number) => void, onStopNote: (n: number) => void, activeNotes?: number[] }) => {
  const startNote = 48; // C3
  const keys = Array.from({length: 25}, (_, i) => {
    const note = startNote + i;
    const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
    const isActive = activeNotes.includes(note);
    return { note, isBlack, isActive };
  });

  return (
    <div className="flex relative h-32 mt-8 mb-4 border border-slate-700 bg-slate-900 rounded shadow-lg overflow-hidden w-max">
      {keys.map(k => (
        <div 
          key={k.note} 
          onMouseDown={() => onPlayNote(k.note)}
          onMouseUp={() => onStopNote(k.note)}
          onMouseLeave={() => onStopNote(k.note)}
          className={\`cursor-pointer \${k.isBlack ? \\\`w-8 h-20 -mx-4 z-10 border border-slate-950 \${k.isActive ? 'bg-red-500' : 'bg-slate-900 hover:bg-slate-700'}\\\` : \\\`w-12 h-32 z-0 border-r border-slate-300 \${k.isActive ? 'bg-red-400' : 'bg-slate-100 hover:bg-slate-300'}\\\`} rounded-b-md transition-colors\`}
        />
      ))}
    </div>
  );
};`;
code = code.replace(vkTarget, vkReplacement);

// 3. States
const stateTarget = `  const [customDevices, setCustomDevices] = useState<DeviceConfig[]>([]);`;
const stateReplacement = `  const [customDevices, setCustomDevices] = useState<DeviceConfig[]>([]);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [previewDevice, setPreviewDevice] = useState<DeviceConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');`;
code = code.replace(stateTarget, stateReplacement);

// 4. LocalStorage Effects
const effectsTarget = `  useEffect(() => {
    if (activeDevice) {
      setJsonDraft(JSON.stringify(activeDevice.controls, null, 2));
    }
  }, [activeDevice]);`;

const effectsReplacement = `  useEffect(() => {
    const savedDraft = localStorage.getItem('midiControlzDraft');
    if (savedDraft) {
      if (window.confirm('Found an unsaved Hardware Mapping draft. Do you want to restore it?')) {
        setJsonDraft(savedDraft);
      } else {
        localStorage.removeItem('midiControlzDraft');
      }
    }
  }, []);

  useEffect(() => {
    if (activeDevice && !jsonError) {
      const timer = setTimeout(() => {
        localStorage.setItem('midiControlzDraft', jsonDraft);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [jsonDraft, activeDevice, jsonError]);

  useEffect(() => {
    if (activeDevice) {
      setJsonDraft(JSON.stringify(activeDevice.controls, null, 2));
    }
  }, [activeDevice]);`;
code = code.replace(effectsTarget, effectsReplacement);

// 5. handleMidiMessage notes sync
const midiTarget = `    const handleMidiMessage = (e: any) => {
      const { msgType, data1 } = e.detail;
      
      // 1. MIDI Learn Logic`;
const midiReplacement = `    const handleMidiMessage = (e: any) => {
      const { msgType, data1 } = e.detail;
      
      if (msgType === 'noteon') {
        setActiveNotes(prev => [...prev, data1]);
      } else if (msgType === 'noteoff') {
        setActiveNotes(prev => prev.filter(n => n !== data1));
      }

      // 1. MIDI Learn Logic`;
code = code.replace(midiTarget, midiReplacement);

// 6. importPreset
const importPresetTarget = `  const importPreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string) as DeviceConfig;
          if (parsed && parsed.controls) {
            setActiveDevice(parsed);
            setCustomDevices(prev => {
              const updated = [...prev];
              if (!updated.find(d => d.id === parsed.id)) updated.push(parsed);
              return updated;
            });
            alert('Preset imported successfully!');
          } else {
            alert('Invalid preset format.');
          }
        } catch (err) {
          alert('Failed to parse JSON preset.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };`;
const importPresetReplacement = `  const importPreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string) as DeviceConfig;
          if (parsed && parsed.controls) {
            setPreviewDevice(parsed);
          } else {
            alert('Invalid preset format.');
          }
        } catch (err) {
          alert('Failed to parse JSON preset.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const confirmImport = () => {
    if (previewDevice) {
      setActiveDevice(previewDevice);
      setCustomDevices(prev => {
        const updated = [...prev];
        if (!updated.find(d => d.id === previewDevice.id)) updated.push(previewDevice);
        return updated;
      });
      setPreviewDevice(null);
    }
  };`;
code = code.replace(importPresetTarget, importPresetReplacement);

// 7. sidebar Target
const sidebarTarget = `<div className="mt-8">
            <h3 className="text-sm font-semibold mb-2 opacity-70 px-2">Library Devices</h3>
            {[...BUILT_IN_DEVICES, ...customDevices].map((d, i) => (
              <button 
                key={\`\${d.id}-\${i}\`}
                onClick={() => { setActiveDevice(d); setIsSidebarOpen(false); }}
                className={\`w-full text-left p-2 rounded text-sm mb-1 transition-all active:scale-95 \${activeDevice?.id === d.id ? 'bg-slate-700 text-white font-medium shadow-sm' : 'hover:bg-slate-700/30'} truncate\`}
              >
                <span className="mr-2">{d.icon}</span> {d.name}
              </button>
            ))}
          </div>`;
const sidebarReplacement = `<div className="mt-8">
            <h3 className="text-sm font-semibold mb-2 opacity-70 px-2">Library Devices</h3>
            
            <div className="px-2 mb-3 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-2 opacity-50" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className={\`w-full pl-7 pr-2 py-1.5 text-xs rounded border outline-none \${isDarkMode ? 'bg-slate-900 border-slate-700 focus:border-blue-500' : 'bg-white border-slate-300 focus:border-blue-500'}\`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter size={14} className="absolute left-2 top-2 opacity-50" />
                <select 
                  className={\`w-full pl-7 pr-2 py-1.5 text-xs rounded border outline-none appearance-none \${isDarkMode ? 'bg-slate-900 border-slate-700 focus:border-blue-500' : 'bg-white border-slate-300 focus:border-blue-500'}\`}
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Tags</option>
                  {Array.from(new Set([...BUILT_IN_DEVICES, ...customDevices].flatMap(d => d.tags || []))).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              {[...BUILT_IN_DEVICES, ...customDevices].filter(d => {
                const matchQ = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
                const matchT = categoryFilter === 'All' || (d.tags && d.tags.includes(categoryFilter));
                return matchQ && matchT;
              }).map((d, i) => (
                <div key={\`\${d.id}-\${i}\`} className="flex gap-1 w-full px-2">
                  <button 
                    onClick={() => { setActiveDevice(d); setIsSidebarOpen(false); }}
                    className={\`flex-1 text-left px-2 py-1.5 rounded text-sm transition-all active:scale-95 \${activeDevice?.id === d.id ? 'bg-blue-600 text-white font-medium shadow-sm' : 'hover:bg-slate-700/30'} truncate\`}
                  >
                    <span className="mr-2">{d.icon}</span> {d.name}
                  </button>
                  <button 
                    onClick={() => setPreviewDevice(d)}
                    className={\`p-1.5 rounded transition-all active:scale-95 \${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-200'} opacity-70 hover:opacity-100\`}
                    title="Preview Mappings"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>`;
code = code.replace(sidebarTarget, sidebarReplacement);

// 8. VirtualKeyboard invoke
const vkInvokeTarget = `<VirtualKeyboard onPlayNote={playNote} onStopNote={stopNote} />`;
const vkInvokeReplacement = `<VirtualKeyboard onPlayNote={playNote} onStopNote={stopNote} activeNotes={activeNotes} />`;
code = code.replace(vkInvokeTarget, vkInvokeReplacement);

// 9. Hardware Mapping Tags block
const jsonDraftFooterTarget = `<p className="text-xs opacity-60 mt-3">Direct modifications here immediately reflect in the active device template.</p>
                </div>`;
const jsonDraftFooterReplacement = `<p className="text-xs opacity-60 mt-3 mb-2">Direct modifications here immediately reflect in the active device template.</p>
                  
                  {activeDevice && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <h4 className="text-xs font-bold mb-2">Preset Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeDevice.tags?.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-1 bg-slate-700 rounded-full text-white">{tag}</span>
                        ))}
                        {!activeDevice.tags?.length && <span className="text-xs opacity-50">No tags. Edit JSON to add tags: ["synth", "live"]</span>}
                      </div>
                    </div>
                  )}
                </div>`;
code = code.replace(jsonDraftFooterTarget, jsonDraftFooterReplacement);

// 10. PREVIEW MODAL AT END
// The file currently ends with:
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
const endTarget = `          )}
        </div>
      </div>
    </div>
  );
}`;
const endReplacement = `          )}
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={\`w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] \${isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}\`}>
            <div className="p-4 border-b flex justify-between items-center shrink-0 border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">{previewDevice.icon}</span> 
                {previewDevice.name} Preview
              </h2>
              <button onClick={() => setPreviewDevice(null)} className="p-1 hover:bg-slate-700/50 rounded transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <p className="opacity-80 mb-4">{previewDevice.description}</p>
              
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2 opacity-70">Tags</h3>
                <div className="flex gap-2">
                  {previewDevice.tags?.map(t => <span key={t} className="px-2 py-1 bg-slate-700/50 rounded-full text-[10px] uppercase font-bold">{t}</span>)}
                  {!previewDevice.tags?.length && <span className="opacity-50 text-xs">No tags</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-sm border-b border-slate-700 pb-2 mb-2">Knobs ({previewDevice.controls.knobs?.length || 0})</h3>
                  <ul className="text-xs space-y-1">
                    {previewDevice.controls.knobs?.slice(0, 10).map(k => (
                      <li key={k.id} className="flex justify-between p-1 rounded hover:bg-slate-700/30">
                        <span className="truncate">{k.label}</span>
                        <span className="opacity-60 font-mono">CC {k.cc}</span>
                      </li>
                    ))}
                    {(previewDevice.controls.knobs?.length || 0) > 10 && <li className="opacity-50 italic mt-1">...and {(previewDevice.controls.knobs?.length || 0) - 10} more</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-sm border-b border-slate-700 pb-2 mb-2">Pads ({previewDevice.controls.pads?.length || 0})</h3>
                  <ul className="text-xs space-y-1">
                    {previewDevice.controls.pads?.slice(0, 10).map(p => (
                      <li key={p.id} className="flex justify-between p-1 rounded hover:bg-slate-700/30">
                        <span className="truncate">{p.label}</span>
                        <span className="opacity-60 font-mono">Note {p.note}</span>
                      </li>
                    ))}
                    {(previewDevice.controls.pads?.length || 0) > 10 && <li className="opacity-50 italic mt-1">...and {(previewDevice.controls.pads?.length || 0) - 10} more</li>}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-700 flex justify-end gap-3 shrink-0">
              <button onClick={() => setPreviewDevice(null)} className="px-4 py-2 rounded font-medium hover:bg-slate-700/50 transition-colors">Cancel</button>
              <button onClick={confirmImport} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-all active:scale-95 shadow-lg">Load Preset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
code = code.replace(endTarget, endReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log('App patched successfully!');
