export type ControlMode = 'Momentary' | 'Toggle';

export interface PadControl {
  id: string;
  label: string;
  note?: number;
  cc?: number;
  pc?: number;
  mode?: ControlMode;
}

export interface KnobControl {
  id: string;
  label: string;
  cc: number;
  lo?: number;
  hi?: number;
}

export interface FaderControl {
  id: string;
  label: string;
  cc: number;
}

export interface ButtonControl {
  id: string;
  label: string;
  note?: number;
  cc?: number;
  color?: 'red' | 'green' | 'amber';
}

export interface Preset {
  name: string;
  channel: number;
  pads?: Partial<PadControl>[];
  knobs?: Partial<KnobControl>[];
}

export interface QuickSysEx {
  label: string;
  bytes: string;
}

export interface DeviceConfig {
  id: string;
  name: string;
  manufacturer: string;
  icon: string;
  color: string;
  midiName: string[];
  sysex: boolean;
  presets: number;
  description: string;
  controls: {
    pads: PadControl[];
    knobs: KnobControl[];
    faders: FaderControl[];
    buttons: ButtonControl[];
  };
  defaultPresets: Preset[];
  quickSysEx: QuickSysEx[];
  tags?: string[];
}

export interface MidiMessage {
  id: string;
  timestamp: number;
  type: 'noteon' | 'noteoff' | 'cc' | 'pc' | 'sysex' | 'other';
  channel?: number;
  data1?: number;
  data2?: number;
  hex: string;
  raw: Uint8Array;
}
