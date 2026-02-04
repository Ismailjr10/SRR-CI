import React from 'react';
import { FingerPositions, Mode, MacroType } from '../types';
import { VerticalSlider } from './VerticalSlider';
import { Settings, Cpu, Zap, RotateCcw, Crosshair } from 'lucide-react';

interface ControlsPanelProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  fingers: FingerPositions;
  onFingerChange: (finger: keyof FingerPositions, val: number) => void;
  onMacro: (macro: MacroType) => void;
  disabled: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ 
  mode, 
  setMode, 
  fingers, 
  onFingerChange,
  onMacro,
  disabled
}) => {
  return (
    <div className="h-full flex flex-col gap-4 bg-cyber-dark/50 p-4 border border-slate-700/50 rounded-sm">
      
      {/* Mode Switcher */}
      <div className="flex bg-slate-900 p-1 rounded-md border border-slate-700">
        <button
          onClick={() => setMode('MANUAL')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm transition-all font-tech tracking-wider text-sm ${
            mode === 'MANUAL' 
              ? 'bg-cyber-cyan/20 text-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
          disabled={disabled}
        >
          <Settings className="w-4 h-4" />
          MANUAL_OVERRIDE
        </button>
        <button
          onClick={() => setMode('AUTO')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm transition-all font-tech tracking-wider text-sm ${
            mode === 'AUTO' 
              ? 'bg-cyber-pink/20 text-cyber-pink shadow-[0_0_10px_rgba(217,70,239,0.1)]' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
          disabled={disabled}
        >
          <Cpu className="w-4 h-4" />
          AUTONOMOUS
        </button>
      </div>

      {/* Control Area */}
      <div className="flex-1 relative bg-slate-900/50 border border-slate-800 rounded-sm p-6 overflow-hidden">
        {/* Background Details */}
        <div className="absolute top-0 right-0 p-2 opacity-10">
            <Cpu className="w-32 h-32" />
        </div>

        {mode === 'MANUAL' ? (
          <div className="h-full flex justify-between items-center gap-2">
            {(Object.keys(fingers) as Array<keyof FingerPositions>).map((finger) => (
              <VerticalSlider
                key={finger}
                label={finger}
                value={fingers[finger]}
                onChange={(val) => onFingerChange(finger, val)}
                disabled={disabled}
              />
            ))}
          </div>
        ) : (
          <div className="h-full grid grid-cols-1 gap-4 content-center">
            <h3 className="text-cyber-pink font-tech text-center mb-2 uppercase tracking-widest text-sm opacity-80">
              Macro Sequences
            </h3>
            
            <button
              onClick={() => onMacro('UNSCREW_PENTALOBE')}
              disabled={disabled}
              className="group relative overflow-hidden p-6 bg-slate-800 border border-slate-600 hover:border-cyber-pink transition-all text-left"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <RotateCcw className="w-12 h-12 text-cyber-pink" />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 bg-slate-900 rounded-full border border-slate-700 group-hover:border-cyber-pink/50">
                    <RotateCcw className="w-6 h-6 text-cyber-pink" />
                </div>
                <div>
                    <span className="block text-lg font-tech text-slate-200 group-hover:text-cyber-pink transition-colors">UNSCREW_PENTALOBE</span>
                    <span className="text-xs font-mono text-slate-500">SEQ: R-720 | TORQUE: 0.5Nm</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => onMacro('LIFT_BATTERY')}
              disabled={disabled}
              className="group relative overflow-hidden p-6 bg-slate-800 border border-slate-600 hover:border-cyber-pink transition-all text-left"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <Zap className="w-12 h-12 text-cyber-pink" />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 bg-slate-900 rounded-full border border-slate-700 group-hover:border-cyber-pink/50">
                    <Zap className="w-6 h-6 text-cyber-pink" />
                </div>
                <div>
                    <span className="block text-lg font-tech text-slate-200 group-hover:text-cyber-pink transition-colors">LIFT_BATTERY</span>
                    <span className="text-xs font-mono text-slate-500">SUCTION: ON | LIFT: +15mm</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => onMacro('HOME_POSITION')}
              disabled={disabled}
              className="group relative overflow-hidden p-6 bg-slate-800 border border-slate-600 hover:border-emerald-500 transition-all text-left"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <Crosshair className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                 <div className="p-3 bg-slate-900 rounded-full border border-slate-700 group-hover:border-emerald-500/50">
                    <Crosshair className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <span className="block text-lg font-tech text-slate-200 group-hover:text-emerald-500 transition-colors">HOME_POSITION</span>
                    <span className="text-xs font-mono text-slate-500">RESET ALL AXES</span>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};