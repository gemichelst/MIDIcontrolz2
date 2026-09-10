import React, { useState, useEffect } from 'react';
import { useWebMidi } from './useWebMidi';
import { BUILT_IN_DEVICES } from './devices';
import { Settings, Save, Upload, Monitor, Edit3, Type, Layers, Send, Target, DownloadCloud, Menu, X, AlertOctagon, Eye } from 'lucide-react';
import { DeviceConfig } from './types';

const VirtualKeyboard = ({ onPlayNote, onStopNote, activeNotes = [] }: { onPlayNote: (n: number) => void, onStopNote: (n: number) => void, activeNotes?: number[] }) => {
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
          className={`cursor-pointer ${k.isBlack ? `w-8 h-20 -mx-4 z-10 border border-slate-950 ${k.isActive ? 'bg-red-500' : 'bg-slate-900 hover:bg-slate-700'}` : `w-12 h-32 z-0 border-r border-slate-300 ${k.isActive ? 'bg-red-400' : 'bg-slate-100 hover:bg-slate-300'}`} rounded-b-md transition-colors`}
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customDevices, setCustomDevices] = useState<DeviceConfig[]>([]);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [previewDevice, setPreviewDevice] = useState<DeviceConfig | null>(null);
  
  // Hardware Mapping State
  const [jsonDraft, setJsonDraft] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [midiLearnMode, setMidiLearnMode] = useState<boolean>(false);
  const [midiLearnTarget, setMidiLearnTarget] = useState<{type: 'knobs' | 'pads', id: string} | null>(null);
  
  // Active UI Feedback State
  const [activeControl, setActiveControl] = useState<string | null>(null);

  // SysEx & Template Receive State
  const [sysexQueue, setSysexQueue] = useState<File[]>([]);
  const [isSendingQueue, setIsSendingQueue] = useState(false);
  const [receivedTemplates, setReceivedTemplates] = useState<{id: string, timestamp: number, size: number, hex: string, data: number[]}[]>([]);

  useEffect(() => {
    const savedDraft = localStorage.getItem('midiControlzDraft');
    if (savedDraft) {
      if (window.confirm('Found an unsaved draft. Do you want to restore it?')) {
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
  }, [activeDevice]);

  // JSON Validation Layer
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonDraft);
      if (!parsed.knobs || !parsed.pads) {
        setJsonError('Missing required keys: "knobs" and "pads" arrays are required.');
      } else if (!Array.isArray(parsed.knobs) || !Array.isArray(parsed.pads)) {
        setJsonError('"knobs" and "pads" must be arrays.');
      } else {
        setJsonError(null);
      }
    } catch (e: any) {
      setJsonError('Invalid JSON syntax: ' + e.message);
    }
  }, [jsonDraft]);

  // Global MIDI Handlers
  useEffect(() => {
    const handleIdentity = (e: any) => {
      const data = e.detail.data;
      if (data[5] === 0x00 && data[6] === 0x20 && data[7] === 0x29) {
        const dev = BUILT_IN_DEVICES.find(d => d.manufacturer === 'Novation' && d.id.includes('remote_zero'));
        if (dev) setActiveDevice(dev);
      } else if (data[5] === 0x47) {
        const dev = BUILT_IN_DEVICES.find(d => d.manufacturer === 'Akai Professional');
        if (dev) setActiveDevice(dev);
      }
    };

    const handleNovationDump = (e: any) => {
      const data = e.detail.data;
      setReceivedTemplates(prev => [...prev, {
        id: Math.random().toString(),
        timestamp: Date.now(),
        data: Array.from(data),
        hex: Array.from(data as Uint8Array).map((b: number) => b.toString(16).padStart(2, '0').toUpperCase()).join(' '),
        size: data.length
      }]);
    };

    const handleMidiMessage = (e: any) => {
      const { msgType, data1 } = e.detail;
      
      if (msgType === 'noteon') {
        setActiveNotes(prev => [...prev, data1]);
      } else if (msgType === 'noteoff') {
        setActiveNotes(prev => prev.filter(n => n !== data1));
      }

      // 1. MIDI Learn Logic
      if (midiLearnMode && midiLearnTarget) {
        if (msgType === 'cc' || msgType === 'noteon') {
          try {
            const parsed = JSON.parse(jsonDraft);
            const list = parsed[midiLearnTarget.type];
            const idx = list.findIndex((c: any) => c.id === midiLearnTarget.id);
            if (idx > -1) {
              if (msgType === 'cc') {
                list[idx].cc = data1;
                delete list[idx].note;
              } else {
                list[idx].note = data1;
                delete list[idx].cc;
              }
              setJsonDraft(JSON.stringify(parsed, null, 2));
            }
          } catch (err) {}
          setMidiLearnTarget(null); // Clear target after learning
        }
      }

      // 2. UI Animation Feedback
      if (activeDevice) {
        let targetId = null;
        if (msgType === 'cc') {
          const match = activeDevice.controls.knobs.find(k => k.cc === data1);
          if (match) targetId = match.id;
        } else if (msgType === 'noteon') {
          const match = activeDevice.controls.pads.find(p => p.note === data1);
          if (match) targetId = match.id;
        }
        
        if (targetId) {
          setActiveControl(targetId);
          setTimeout(() => setActiveControl(null), 250); // Clear animation
        }
      }
    };

    window.addEventListener('midi-identity-reply', handleIdentity);
    window.addEventListener('novation-sysex-dump', handleNovationDump);
    window.addEventListener('midi-message-received', handleMidiMessage);
    
    return () => {
      window.removeEventListener('midi-identity-reply', handleIdentity);
      window.removeEventListener('novation-sysex-dump', handleNovationDump);
      window.removeEventListener('midi-message-received', handleMidiMessage);
    };
  }, [activeDevice, midiLearnMode, midiLearnTarget, jsonDraft]);

  // Send Identity Request when output is selected
  useEffect(() => {
    if (selectedOutput) {
      sendMidi([0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]);
    }
  }, [selectedOutput, sendMidi]);

  const sendPanic = () => {
    for (let ch = 0; ch < 16; ch++) {
      sendMidi([0xB0 + ch, 0x7B, 0]); // All Notes Off
      sendMidi([0xB0 + ch, 0x78, 0]); // All Sound Off
    }
  };

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
    if (!activeDevice || jsonError) return;
    const deviceToSave = {
      ...activeDevice,
      controls: JSON.parse(jsonDraft)
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
  };

  const exportSyx = () => {
    if (!activeDevice || jsonError) return;
    const text = jsonDraft;
    const bytes = [0xF0, 0x7D]; // 7D is non-commercial/educational SysEx ID
    for (let i = 0; i < text.length; i++) {
      let c = text.charCodeAt(i);
      if (c > 127) c = 63; // clamp to 7-bit ASCII (?)
      bytes.push(c);
    }
    bytes.push(0xF7);
    
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDevice.name.replace(/\s+/g, '_')}_mapping.syx`;
    a.click();
    URL.revokeObjectURL(url);
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
      await new Promise(r => setTimeout(r, 200)); 
    }
    setIsSendingQueue(false);
    alert('SysEx Queue transmission complete!');
    setSysexQueue([]);
  };

  const downloadTemplate = (tmpl: any) => {
    const blob = new Blob([new Uint8Array(tmpl.data)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_dump_${tmpl.timestamp}.syx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex h-screen w-full flex-col ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* TOPBAR */}
      <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm'} shrink-0 z-20 relative`}>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            className="md:hidden p-2 rounded hover:bg-slate-700/50 transition-all active:scale-95"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">MIDIcontrolz2</h1>
          
          <select 
            className={`p-2 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} outline-none border-none text-sm md:text-base cursor-pointer hover:opacity-90 transition-opacity`}
            value={selectedInput} 
            onChange={(e) => setSelectedInput(e.target.value)}
          >
            <option value="">MIDI In...</option>
            {inputs.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          
          <select 
            className={`p-2 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} outline-none border-none text-sm md:text-base cursor-pointer hover:opacity-90 transition-opacity`}
            value={selectedOutput} 
            onChange={(e) => setSelectedOutput(e.target.value)}
          >
            <option value="">MIDI Out...</option>
            {outputs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={sendPanic} className="flex items-center gap-1 px-3 py-2 bg-red-600/90 text-white rounded hover:bg-red-500 text-sm font-bold transition-all active:scale-95 shadow-sm">
            <AlertOctagon size={16} /> <span className="hidden sm:inline">Panic</span>
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="px-3 py-2 bg-blue-600/90 text-white rounded hover:bg-blue-500 text-sm font-medium transition-all active:scale-95 shadow-sm">
            <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'} Mode</span>
            <span className="sm:hidden">{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* MOBILE BACKDROP */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <div className={`absolute md:static inset-y-0 left-0 z-40 w-64 p-4 border-r ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'} overflow-y-auto shrink-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex flex-col gap-2">
            <button onClick={() => { setActiveTab('editor'); setIsSidebarOpen(false); }} className={`flex items-center gap-2 p-2 rounded transition-all active:scale-95 ${activeTab === 'editor' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-700/50'}`}>
              <Edit3 size={18} /> Editor
            </button>
            <button onClick={() => { setActiveTab('monitor'); setIsSidebarOpen(false); }} className={`flex items-center gap-2 p-2 rounded transition-all active:scale-95 ${activeTab === 'monitor' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-700/50'}`}>
              <Monitor size={18} /> Monitor
            </button>
            <button onClick={() => { setActiveTab('devices'); setIsSidebarOpen(false); }} className={`flex items-center gap-2 p-2 rounded transition-all active:scale-95 ${activeTab === 'devices' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-700/50'}`}>
              <Type size={18} /> Hardware Mapping
            </button>
            <button onClick={() => { setActiveTab('sysex'); setIsSidebarOpen(false); }} className={`flex items-center gap-2 p-2 rounded transition-all active:scale-95 ${activeTab === 'sysex' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-700/50'}`}>
              <Layers size={18} /> SysEx Bulk
            </button>
            <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`flex items-center gap-2 p-2 rounded transition-all active:scale-95 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-700/50'}`}>
              <Settings size={18} /> Settings
            </button>
          </div>
          
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-2 opacity-70 px-2">Library Devices</h3>
            {[...BUILT_IN_DEVICES, ...customDevices].map((d, i) => (
              <div key={`${d.id}-${i}`} className="flex gap-1 w-full mb-1">
                <button 
                  onClick={() => { setActiveDevice(d); setIsSidebarOpen(false); }}
                  className={`flex-1 text-left p-2 rounded text-sm transition-all active:scale-95 ${activeDevice?.id === d.id ? 'bg-slate-700 text-white font-medium shadow-sm' : 'hover:bg-slate-700/30'} truncate`}
                >
                  <span className="mr-2">{d.icon}</span> {d.name}
                </button>
                <button 
                  onClick={() => setPreviewDevice(d)}
                  className="p-2 rounded hover:bg-slate-700/30 transition-all active:scale-95"
                  title="Preview Mappings"
                >
                  <Eye size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          
          {/* EDITOR TAB */}
          {activeTab === 'editor' && activeDevice && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{activeDevice.name} Editor</h2>
              </div>
              
              <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
                {activeDevice.quickSysEx.map((sysex, i) => (
                  <button 
                    key={i} 
                    onClick={() => sendSysEx(sysex.bytes)}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow-sm text-sm font-medium transition-all active:scale-95"
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
                      <div key={knob.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 ${activeControl === knob.id ? 'midi-active' : ''} ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white shadow-sm'}`}>
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
                      <div key={pad.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center aspect-square transition-all duration-200 cursor-pointer hover:bg-slate-700/50 ${activeControl === pad.id ? 'midi-active' : ''} ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white shadow-sm'}`}>
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
              <VirtualKeyboard onPlayNote={playNote} onStopNote={stopNote} activeNotes={activeNotes} />

            </div>
          )}

          {/* MONITOR TAB */}
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
                    <span className="flex-1 opacity-90 break-all">{m.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HARDWARE MAPPING TAB */}
          {activeTab === 'devices' && (
            <div className="max-w-6xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold">Custom Hardware Mapping Editor</h2>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                  <button onClick={savePreset} disabled={!!jsonError} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"><Save size={16}/> Save</button>
                  <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 text-white text-sm font-medium rounded hover:bg-slate-600 cursor-pointer transition-all active:scale-95">
                    <Upload size={16}/> Import
                    <input type="file" accept=".json" className="hidden" onChange={importPreset} />
                  </label>
                  <button onClick={exportSyx} disabled={!!jsonError} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"><DownloadCloud size={16}/> Export .syx</button>
                </div>
              </div>
              <p className="mb-6 opacity-80 leading-relaxed">
                You can create custom templates, modify existing ones, and save them locally. Enable MIDI Learn and click a control to automatically bind it to incoming hardware messages.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Visual Editor (MIDI Learn) */}
                <div className={`p-6 border rounded-xl shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Interactive UI</h3>
                    <label className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-colors ${midiLearnMode ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-slate-700 text-slate-300'}`}>
                      <input type="checkbox" className="hidden" checked={midiLearnMode} onChange={e => { setMidiLearnMode(e.target.checked); setMidiLearnTarget(null); }} />
                      <Target size={16} className={midiLearnMode ? 'animate-pulse' : ''} />
                      MIDI Learn {midiLearnMode ? 'ON' : 'OFF'}
                    </label>
                  </div>
                  
                  {midiLearnMode && <p className="mb-4 text-sm text-red-400 font-medium">Click any control below to start listening for MIDI CC/Note...</p>}

                  {/* Render Mock Knobs for selection */}
                  {activeDevice?.controls.knobs && activeDevice.controls.knobs.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-2 opacity-70">Knobs</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeDevice.controls.knobs.map(knob => {
                          const isTarget = midiLearnTarget?.id === knob.id;
                          return (
                            <div 
                              key={knob.id} 
                              onClick={() => midiLearnMode && setMidiLearnTarget({type: 'knobs', id: knob.id})}
                              className={`p-2 w-16 h-16 rounded border flex flex-col items-center justify-center cursor-pointer transition-colors ${isTarget ? 'bg-red-500/20 border-red-500 animate-pulse' : (isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-300')}`}
                            >
                              <span className="text-xs font-bold truncate w-full text-center">{knob.label}</span>
                              <span className="text-[10px] opacity-60">CC {knob.cc}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Render Mock Pads for selection */}
                  {activeDevice?.controls.pads && activeDevice.controls.pads.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 opacity-70">Pads</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeDevice.controls.pads.map(pad => {
                          const isTarget = midiLearnTarget?.id === pad.id;
                          return (
                            <div 
                              key={pad.id} 
                              onClick={() => midiLearnMode && setMidiLearnTarget({type: 'pads', id: pad.id})}
                              className={`p-2 w-16 h-16 rounded border flex flex-col items-center justify-center cursor-pointer transition-colors ${isTarget ? 'bg-red-500/20 border-red-500 animate-pulse' : (isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-300')}`}
                            >
                              <span className="text-xs font-bold truncate w-full text-center">{pad.label}</span>
                              <span className="text-[10px] opacity-60">N: {pad.note}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* JSON Code Editor */}
                <div className={`p-6 border rounded-xl shadow-sm flex flex-col ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">JSON Configuration</h3>
                  </div>
                  
                  {jsonError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium flex items-start gap-2">
                      <span className="mt-0.5">⚠️</span> 
                      <span>{jsonError}</span>
                    </div>
                  )}

                  <textarea 
                    className={`flex-1 w-full p-4 rounded-lg border font-mono text-sm leading-relaxed whitespace-pre overflow-auto min-h-[400px] ${isDarkMode ? 'bg-[#0A0C10] border-slate-700 text-blue-300 focus:border-blue-500 outline-none' : 'bg-slate-50 border-slate-300'} ${jsonError ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
                    value={jsonDraft}
                    onChange={(e) => setJsonDraft(e.target.value)}
                  />
                  <p className="text-xs opacity-60 mt-3 mb-2">Direct modifications here immediately reflect in the active device template.</p>
                  
                  {activeDevice && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <h4 className="text-xs font-bold mb-2">Preset Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeDevice.tags?.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-1 bg-slate-700 rounded-full">{tag}</span>
                        ))}
                        {!activeDevice.tags?.length && <span className="text-xs opacity-50">No tags. Edit JSON to add tags: ["synth", "live"]</span>}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* SYSEX BULK & TEMPLATE RECEIVE TAB */}
          {activeTab === 'sysex' && (
            <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SysEx Queue */}
              <div className={`p-6 rounded-xl border flex flex-col ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <h2 className="text-xl font-bold mb-2">SysEx Bulk Transmission</h2>
                <p className="opacity-80 mb-6 text-sm">Queue multiple SysEx (.syx) files and send them sequentially.</p>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm">Queue Files</h3>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-500 cursor-pointer transition-all active:scale-95">
                    <Upload size={16}/> Select Files
                    <input type="file" multiple accept=".syx,.sys" className="hidden" onChange={handleSysexFiles} />
                  </label>
                </div>

                <div className={`flex-1 min-h-[200px] p-4 rounded-lg border overflow-y-auto mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  {sysexQueue.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm opacity-50">No files queued.</div>
                  ) : (
                    <ul className="space-y-2">
                      {sysexQueue.map((f, i) => (
                        <li key={i} className="flex justify-between items-center text-sm p-3 rounded bg-slate-700/30">
                          <span className="font-medium truncate">{f.name}</span>
                          <span className="opacity-60 text-xs bg-slate-800 px-2 py-1 rounded ml-2 shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button 
                  onClick={sendSysexQueue} 
                  disabled={sysexQueue.length === 0 || isSendingQueue}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <Send size={16}/> {isSendingQueue ? 'Sending...' : 'Send Queue Sequential'}
                </button>
              </div>

              {/* Template Receive Manager */}
              <div className={`p-6 rounded-xl border flex flex-col ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <h2 className="text-xl font-bold mb-2">Template Receive Manager</h2>
                <p className="opacity-80 mb-6 text-sm">Automatically captures incoming Template Dumps from Novation & compatible devices.</p>

                <div className={`flex-1 p-4 rounded-lg border overflow-y-auto ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  {receivedTemplates.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-sm opacity-50 text-center px-4">
                      <Layers size={32} className="mb-2 opacity-40"/>
                      No templates received yet. Initiate a SysEx dump from your hardware.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {receivedTemplates.map((tmpl, i) => (
                        <li key={tmpl.id} className="p-3 rounded-lg border border-slate-700 bg-slate-800 shadow-sm flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-blue-400">Captured Template {i+1}</span>
                            <span className="text-xs opacity-60 bg-slate-900 px-2 py-1 rounded">{tmpl.size} bytes</span>
                          </div>
                          <div className="text-[10px] font-mono opacity-50 truncate">
                            {tmpl.hex.substring(0, 45)}...
                          </div>
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => sendMidi(tmpl.data)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium text-white transition-all active:scale-95">
                              <Send size={12}/> Send Back
                            </button>
                            <button onClick={() => downloadTemplate(tmpl)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium text-white transition-all active:scale-95">
                              <DownloadCloud size={12}/> Save .syx
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* SETTINGS TAB */}
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

      {/* PREVIEW MODAL */}
      {previewDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}`}>
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
}
