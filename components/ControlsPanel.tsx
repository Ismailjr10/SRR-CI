import React from 'react';
import { FingerPositions, Mode, MacroType } from '../types';
import { VerticalSlider } from './VerticalSlider';
import { Settings, Cpu, Zap, RotateCcw, Crosshair, Scan, Eraser, Droplet } from 'lucide-react';

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
      <div className={`flex bg-slate-900 p-1 rounded-md border border-slate-700 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
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
          <div className="h-full flex flex-col">
            <h3 className="text-cyber-pink font-tech text-center mb-4 uppercase tracking-widest text-sm opacity-80">
              Active Macro Sequences
            </h3>
            
            <div className={`grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-y-auto pr-2 ${disabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <MacroButton 
                    label="UNSCREW_PENTALOBE" 
                    subtext="SEQ: R-720 | TORQUE: 0.5Nm" 
                    icon={RotateCcw} 
                    color="text-cyber-pink" 
                    onClick={() => onMacro('UNSCREW_PENTALOBE')} 
                    disabled={disabled}
                />
                <MacroButton 
                    label="LIFT_BATTERY" 
                    subtext="SUCTION: ON | LIFT: +15mm" 
                    icon={Zap} 
                    color="text-cyber-pink" 
                    onClick={() => onMacro('LIFT_BATTERY')} 
                    disabled={disabled}
                />
                <MacroButton 
                    label="HOME_POSITION" 
                    subtext="RESET ALL AXES" 
                    icon={Crosshair} 
                    color="text-emerald-500" 
                    borderColor="hover:border-emerald-500"
                    iconBg="group-hover:border-emerald-500/50"
                    onClick={() => onMacro('HOME_POSITION')} 
                    disabled={disabled}
                />
                <MacroButton 
                    label="CALIBRATE_SENSORS" 
                    subtext="AUTO-LEVEL | ZEROING" 
                    icon={Scan} 
                    color="text-blue-400" 
                    borderColor="hover:border-blue-400"
                    iconBg="group-hover:border-blue-400/50"
                    onClick={() => onMacro('CALIBRATE_SENSORS')} 
                    disabled={disabled}
                />
                 <MacroButton 
                    label="CLEAN_CONNECTOR" 
                    subtext="BRUSH CYCLE: 3s" 
                    icon={Eraser} 
                    color="text-amber-400" 
                    borderColor="hover:border-amber-400"
                    iconBg="group-hover:border-amber-400/50"
                    onClick={() => onMacro('CLEAN_CONNECTOR')} 
                    disabled={disabled}
                />
                <MacroButton 
                    label="APPLY_ADHESIVE" 
                    subtext="PRESSURE: 20PSI" 
                    icon={Droplet} 
                    color="text-purple-400" 
                    borderColor="hover:border-purple-400"
                    iconBg="group-hover:border-purple-400/50"
                    onClick={() => onMacro('APPLY_ADHESIVE')} 
                    disabled={disabled}
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface MacroButtonProps {
    label: string;
    subtext: string;
    icon: React.ElementType;
    color: string;
    borderColor?: string;
    iconBg?: string;
    onClick: () => void;
    disabled: boolean;
}

const MacroButton: React.FC<MacroButtonProps> = ({ 
    label, subtext, icon: Icon, color, onClick, disabled, 
    borderColor = "hover:border-cyber-pink", 
    iconBg = "group-hover:border-cyber-pink/50" 
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`group relative overflow-hidden p-4 bg-slate-800 border border-slate-600 ${borderColor} transition-all text-left rounded-sm`}
    >
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
        <Icon className={`w-12 h-12 ${color}`} />
        </div>
        <div className="relative z-10 flex items-center gap-3">
        <div className={`p-2 bg-slate-900 rounded-full border border-slate-700 ${iconBg} transition-colors`}>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
            <span className={`block text-sm font-tech text-slate-200 ${color.replace('text-', 'group-hover:text-')} transition-colors`}>{label}</span>
            <span className="text-[10px] font-mono text-slate-500">{subtext}</span>
        </div>
        </div>
    </button>
);