import { useEffect, useState, useCallback } from 'react';
import { MidiMessage } from './types';

export function useWebMidi() {
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [inputs, setInputs] = useState<WebMidi.MIDIInput[]>([]);
  const [outputs, setOutputs] = useState<WebMidi.MIDIOutput[]>([]);
  const [selectedInput, setSelectedInput] = useState<string>('');
  const [selectedOutput, setSelectedOutput] = useState<string>('');
  const [messages, setMessages] = useState<MidiMessage[]>([]);

  const initMidi = useCallback(async () => {
    try {
      const access = await navigator.requestMIDIAccess({ sysex: true });
      setMidiAccess(access);
      
      const updatePorts = () => {
        setInputs(Array.from(access.inputs.values()));
        setOutputs(Array.from(access.outputs.values()));
      };
      
      updatePorts();
      access.onstatechange = updatePorts;
    } catch (err) {
      console.error('MIDI Access failed', err);
    }
  }, []);

  useEffect(() => {
    initMidi();
  }, [initMidi]);

  useEffect(() => {
    if (!midiAccess) return;
    const input = selectedInput ? midiAccess.inputs.get(selectedInput) : null;
    if (!input) return;

    const onMidiMessage = (e: WebMidi.MIDIMessageEvent) => {
      const data = e.data;
      const status = data[0];
      const channel = status & 0x0F;
      const type = status >> 4;
      
      let msgType: MidiMessage['type'] = 'other';
      if (type === 0x9 && data[2] > 0) msgType = 'noteon';
      else if (type === 0x8 || (type === 0x9 && data[2] === 0)) msgType = 'noteoff';
      else if (type === 0xB) msgType = 'cc';
      else if (type === 0xC) msgType = 'pc';
      else if (status === 0xF0) msgType = 'sysex';

      // Check for Identity Reply
      // F0 7E <device ID> 06 02 <mfg> <family(2)> <model(2)> <version(4)> F7
      if (msgType === 'sysex' && data.length >= 15 && data[1] === 0x7E && data[3] === 0x06 && data[4] === 0x02) {
        window.dispatchEvent(new CustomEvent('midi-identity-reply', { detail: { data } }));
      }

      const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      
      setMessages(prev => [{
        id: Math.random().toString(),
        timestamp: Date.now(),
        type: msgType,
        channel: msgType !== 'sysex' ? channel : undefined,
        data1: data[1],
        data2: data[2],
        hex,
        raw: data
      }, ...prev].slice(0, 500));
    };

    input.onmidimessage = onMidiMessage;
    return () => { input.onmidimessage = null; };
  }, [midiAccess, selectedInput]);

  const sendMidi = useCallback((data: number[]) => {
    if (!midiAccess || !selectedOutput) return;
    const output = midiAccess.outputs.get(selectedOutput);
    if (output) {
      try {
        output.send(data);
      } catch (err) {
        console.error('Failed to send MIDI', err);
      }
    }
  }, [midiAccess, selectedOutput]);

  return {
    inputs,
    outputs,
    selectedInput,
    selectedOutput,
    setSelectedInput,
    setSelectedOutput,
    messages,
    setMessages,
    sendMidi
  };
}
