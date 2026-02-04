import React from 'react';

interface VerticalSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const VerticalSlider: React.FC<VerticalSliderProps> = ({ label, value, onChange, disabled }) => {
  return (
    <div className={`flex flex-col items-center h-full gap-2 group ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
      <div className={`relative flex-1 w-12 bg-slate-900/50 rounded-full border border-slate-700 transition-colors flex justify-center py-4 ${disabled ? 'border-slate-800' : 'group-hover:border-cyber-cyan/50'}`}>
        {/* Track Line */}
        <div className="absolute top-4 bottom-4 w-1 bg-slate-800 rounded-full pointer-events-none"></div>
        {/* Fill Line */}
        <div 
            className={`absolute bottom-4 w-1 rounded-full pointer-events-none transition-all duration-150 ${disabled ? 'bg-slate-600' : 'bg-cyber-cyan'}`}
            style={{ height: `calc(${(value / 180) * 100}% - 32px)` }}
        ></div>

        <input
          type="range"
          min="0"
          max="180"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          // The width here determines the 'height' of the click area when rotated. 
          // 400px should cover most of the track in the 500px min-height panel.
          className="range-vertical absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[40px] opacity-0 cursor-pointer"
        />
        
        {/* Visual Thumb Indicator */}
        <div 
            className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full pointer-events-none transition-all duration-75 ${
                disabled 
                ? 'bg-slate-500' 
                : 'bg-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.8)]'
            }`}
            style={{ bottom: `calc(${(value / 180) * 80}% + 10px)` }} 
        ></div>
      </div>
      
      <div className="text-center space-y-1">
        <span className="block font-mono text-xs font-bold text-slate-400 group-hover:text-cyber-cyan uppercase">{label}</span>
        <div className={`px-2 py-0.5 bg-slate-950 rounded border ${disabled ? 'border-slate-800 text-slate-600' : 'border-slate-800 text-cyber-cyan'}`}>
            <span className="font-tech text-sm">{value}°</span>
        </div>
      </div>
    </div>
  );
};