import React, { useState, useEffect } from 'react';
import { useWebMidi } from './useWebMidi';
import { BUILT_IN_DEVICES } from './devices';
import { Settings, Save, Download, Upload, Monitor, Edit3, Type, Layers, Send } from 'lucide-react';
import { DeviceConfig } from './types';

const VirtualKeyboard = ({ onPlayNote, onStopNote }: { onPlayNote: (n: number) => void, onStopNote: (n: number) => void }) => {
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
          className={`cursor-pointer ${k.isBlack ? 'bg-slate-900 hover:bg-slate-700 w-8 h-20 -mx-4 z-10 border border-slate-950' : 'bg-slate-100 hover:bg-slate-300 w-12 h-32 z-0 border-r border-slate-300'} rounded-b-md transition-colors`}
        />
      ))}
    </div>
  );
};

export default function App() {
  const { inputs, outputs, selectedInput, selectedOutput, setSelectedInput, setSelectedOutput, messages, setMessages, sendMidi } = useWebMidi();
  const [activeTab, setActiveTab] = useState<'editor' | 'monitor' | 'sysex' | 'settings' | 'devices'>('editor');
  const [activeDevice, setActiveDevice] = useState<DeviceConfig | null>(BUILT_IN_DEVICES[0]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [customDevices, setCustomDevices] = useState<DeviceConfig[]>([]);
  const [sysexQueue, setSysexQueue] = useState<File[]>([]);
  const [isSendingQueue, setIsSendingQueue] = useState(false);
  const [jsonDraft, setJsonDraft] = useState<string>('');

  useEffect(() => {
    if (activeDevice) {
      setJsonDraft(JSON.stringify(activeDevice.controls, null, 2));
    }
  }, [activeDevice]);

  // Identity Request Listener
  useEffect(() => {
    const handleIdentity = (e: any) => {
      const data = e.detail.data;
      if (data[5] === 0x00 && data[6] === 0x20 && data[7] === 0x29) {
        // Novation
        const dev = BUILT_IN_DEVICES.find(d => d.manufacturer === 'Novation' && d.id.includes('remote_zero'));
        if (dev) setActiveDevice(dev);
      } else if (data[5] === 0x47) {
        // Akai
        const dev = BUILT_IN_DEVICES.find(d => d.manufacturer === 'Akai Professional');
        if (dev) setActiveDevice(dev);
      }
    };
    window.addEventListener('midi-identity-reply', handleIdentity);
    return () => window.removeEventListener('midi-identity-reply', handleIdentity);
  }, []);

  // Send Identity Request when output is selected
  useEffect(() => {
    if (selectedOutput) {
      sendMidi([0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]);
    }
  }, [selectedOutput, sendMidi]);

  const sendSysEx = (hexString: string) => {
    const bytes = hexString.split(' ').map(x => parseInt(x, 16));
    sendMidi(bytes);
  };

  const playNote = (note: number) => {
    sendMidi([0x90, note, 100]); // Note On, Velocity 100
  };

  const stopNote = (note: number) => {
    sendMidi([0x80, note, 0]); // Note Off
  };

  const savePreset = () => {
    if (!activeDevice) return;
    const deviceToSave = {
      ...activeDevice,
      controls: JSON.parse(jsonDraft) // Include any custom edits
    };
    const data = JSON.stringify(deviceToSave, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDevice.name.replace(/\s+/g, '_')}_preset.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string) as DeviceConfig;
          if (parsed && parsed.controls) {
            setActiveDevice(parsed);
            setCustomDevices(prev => {
              // Ensure uniqueness or just append
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
    e.target.value = ''; // Reset
  };

  const handleSysexFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSysexQueue(Array.from(e.target.files));
    }
  };

  const sendSysexQueue = async () => {
    if (sysexQueue.length === 0) return;
    setIsSendingQueue(true);
    for (const file of sysexQueue) {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      sendMidi(Array.from(bytes));
      // small delay to avoid buffer overflows on the device
      await new Promise(r => setTimeout(r, 200)); 
    }
    setIsSendingQueue(false);
    alert('SysEx Queue transmission complete!');
    setSysexQueue([]);
  };

  return (
    <div className={`flex h-screen w-full flex-col ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* TOPBAR */}
      <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight">MIDIcontrolz2</h1>
          
          <select 
            className={`p-2 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} outline-none border-none`}
            value={selectedInput} 
            onChange={(e) => setSelectedInput(e.target.value)}
          >
            <option value="">Select MIDI In...</option>
            {inputs.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          
          <select 
            className={`p-2 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} outline-none border-none`}
            value={selectedOutput} 
            onChange={(e) => setSelectedOutput(e.target.value)}
          >
            <option value="">Select MIDI Out...</option>
            {outputs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm font-medium transition-colors">
            Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className={`w-64 p-4 border-r ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-100/50'} overflow-y-auto`}>
          <div className="flex flex-col gap-2">
            <button onClick={() => setActiveTab('editor')} className={`flex items-center gap-2 p-2 rounded ${activeTab === 'editor' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700/50'}`}>
              <Edit3 size={18} /> Editor
            </button>
            <button onClick={() => setActiveTab('monitor')} className={`flex items-center gap-2 p-2 rounded ${activeTab === 'monitor' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700/50'}`}>
              <Monitor size={18} /> Monitor
            </button>
            <button onClick={() => setActiveTab('devices')} className={`flex items-center gap-2 p-2 rounded ${activeTab === 'devices' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700/50'}`}>
              <Type size={18} /> Hardware Mapping
            </button>
            <button onClick={() => setActiveTab('sysex')} className={`flex items-center gap-2 p-2 rounded ${activeTab === 'sysex' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700/50'}`}>
              <Layers size={18} /> SysEx Bulk
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 p-2 rounded ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700/50'}`}>
              <Settings size={18} /> Settings
            </button>
          </div>
          
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2 opacity-70 px-2">Library Devices</h3>
            {[...BUILT_IN_DEVICES, ...customDevices].map((d, i) => (
              <button 
                key={`${d.id}-${i}`}
                onClick={() => setActiveDevice(d)}
                className={`w-full text-left p-2 rounded text-sm mb-1 ${activeDevice?.id === d.id ? 'bg-slate-700 text-white font-medium' : 'hover:bg-slate-700/30'}`}
              >
                <span className="mr-2">{d.icon}</span> {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'editor' && activeDevice && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{activeDevice.name} Editor</h2>
              </div>
              
              <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {activeDevice.quickSysEx.map((sysex, i) => (
                  <button 
                    key={i} 
                    onClick={() => sendSysEx(sysex.bytes)}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow-sm text-sm font-medium transition-colors"
                  >
                    {sysex.label}
                  </button>
                ))}
              </div>

              {activeDevice.controls.knobs.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-3">Knobs / Encoders</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
                    {activeDevice.controls.knobs.map(knob => (
                      <div key={knob.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white shadow-sm'}`}>
                        <div className="w-12 h-12 rounded-full border-4 border-slate-500 mb-3 relative flex items-center justify-center bg-slate-700/20">
                           <div className="w-1 h-3 bg-slate-400 absolute top-0 rounded-full" style={{transform: 'rotate(-45deg)', transformOrigin: '50% 24px'}}></div>
                        </div>
                        <span className="text-sm font-bold">{knob.label}</span>
                        <span className="text-xs opacity-60 mt-1">CC {knob.cc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeDevice.controls.pads.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-3">Pads</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
                    {activeDevice.controls.pads.map(pad => (
                      <div key={pad.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center aspect-square transition-colors cursor-pointer hover:bg-slate-700/50 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white shadow-sm'}`}>
                        <span className="text-sm font-bold">{pad.label}</span>
                        <span className="text-xs opacity-60 mt-2">Note {pad.note}</span>
                        {pad.cc !== undefined && <span className="text-[10px] opacity-40">CC {pad.cc}</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h3 className="text-lg font-semibold mt-12 mb-2">Virtual Keyboard</h3>
              <p className="text-sm opacity-70">Click on the keys to test Note On / Note Off messages via the selected MIDI output.</p>
              <VirtualKeyboard onPlayNote={playNote} onStopNote={stopNote} />

            </div>
          )}

          {activeTab === 'monitor' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">MIDI Monitor</h2>
                <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white" onClick={() => setMessages([])}>Clear</button>
              </div>
              <div className={`flex-1 p-4 rounded-xl border ${isDarkMode ? 'bg-[#0A0C10] border-slate-800 text-green-400' : 'bg-slate-100 border-slate-200 text-slate-800'} font-mono text-sm overflow-y-auto`}>
                {messages.length === 0 && <span className="opacity-50">Waiting for MIDI messages... Ensure device is connected and selected.</span>}
                {messages.map(m => (
                  <div key={m.id} className="mb-1 py-1 border-b border-slate-800/30 flex gap-4 hover:bg-white/5 px-2 rounded">
                    <span className="text-slate-500 w-24">{new Date(m.timestamp).toISOString().split('T')[1].slice(0, 11)}</span>
                    <span className="w-20 text-purple-400 font-semibold">{m.type}</span>
                    <span className="w-12 text-blue-400">{m.channel !== undefined ? `Ch ${m.channel + 1}` : ''}</span>
                    <span className="flex-1 opacity-90">{m.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold mb-4">Custom Hardware Mapping Editor</h2>
              <p className="mb-6 opacity-80 leading-relaxed">
                You can create custom templates, modify existing ones, and save them locally to your browser. Use the JSON editor to modify control mappings directly.
              </p>
              
              <div className={`p-6 border rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Edit Current Template ({activeDevice?.name})</h3>
                  <div className="flex gap-2">
                    <button onClick={savePreset} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-500 transition-colors"><Save size={16}/> Save Preset</button>
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white text-sm font-medium rounded hover:bg-slate-600 cursor-pointer transition-colors">
                      <Upload size={16}/> Import Preset
                      <input type="file" accept=".json" className="hidden" onChange={importPreset} />
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 opacity-80">Device Name</label>
                    <input type="text" value={activeDevice?.name || ''} onChange={e => setActiveDevice(prev => prev ? {...prev, name: e.target.value} : null)} className={`w-full p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700 focus:border-blue-500 outline-none' : 'bg-slate-50 border-slate-300'}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 opacity-80">Manufacturer</label>
                    <input type="text" value={activeDevice?.manufacturer || ''} onChange={e => setActiveDevice(prev => prev ? {...prev, manufacturer: e.target.value} : null)} className={`w-full p-2.5 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700 focus:border-blue-500 outline-none' : 'bg-slate-50 border-slate-300'}`} />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold mb-2 opacity-80">Hardware Control Layout (JSON)</label>
                  <textarea 
                    className={`w-full h-96 p-4 rounded-lg border font-mono text-sm leading-relaxed ${isDarkMode ? 'bg-[#0A0C10] border-slate-700 text-blue-300 focus:border-blue-500 outline-none' : 'bg-slate-50 border-slate-300'}`}
                    value={jsonDraft}
                    onChange={(e) => setJsonDraft(e.target.value)}
                  />
                  <p className="text-xs opacity-60 mt-2">Modify the controls above to remap CC numbers, Note numbers, and labels.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sysex' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">SysEx Bulk Transmission</h2>
              <p className="opacity-80 mb-6 leading-relaxed">Queue multiple SysEx (.syx) files from your local storage and send them sequentially to the selected output device.</p>

              <div className={`p-6 rounded-xl border mb-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold">Queue Files</h3>
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-500 cursor-pointer transition-colors">
                    <Upload size={16}/> Select SysEx Files
                    <input type="file" multiple accept=".syx,.sys" className="hidden" onChange={handleSysexFiles} />
                  </label>
                </div>

                <div className={`min-h-[150px] p-4 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  {sysexQueue.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm opacity-50 pt-10 pb-10">No files queued.</div>
                  ) : (
                    <ul className="space-y-2">
                      {sysexQueue.map((f, i) => (
                        <li key={i} className="flex justify-between items-center text-sm p-3 rounded bg-slate-700/30">
                          <span className="font-medium">{f.name}</span>
                          <span className="opacity-60 text-xs bg-slate-800 px-2 py-1 rounded">{(f.size / 1024).toFixed(1)} KB</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={sendSysexQueue} 
                    disabled={sysexQueue.length === 0 || isSendingQueue}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16}/> {isSendingQueue ? 'Sending...' : 'Send Queue Sequential'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">Settings & Maintenance</h2>
              
              <div className={`p-6 rounded-xl border mb-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Settings size={18}/> Preferences</h3>
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-600 focus:ring-2" />
                  <span>MIDI Thru (Echo Input to Output)</span>
                </label>
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-600 focus:ring-2" />
                  <span>Highlight on incoming message</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-600 focus:ring-2" />
                  <span>Show note names (C4, D#3...) in Monitor</span>
                </label>
              </div>

              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <h3 className="font-bold mb-4">Offline Caching</h3>
                <div className="p-4 border border-blue-500/30 bg-blue-500/10 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-1">PWA Ready</h4>
                  <p className="text-sm opacity-90 leading-relaxed">This application automatically caches assets for offline use via Service Workers. You can install it as a standalone app to edit MIDI controllers without an internet connection.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
