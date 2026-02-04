import React from 'react';

interface VerticalSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const VerticalSlider: React.FC<VerticalSliderProps> = ({ label, value, onChange, disabled }) => {
  return (
    <div className="flex flex-col items-center h-full gap-2 group">
      <div className="relative flex-1 w-12 bg-slate-900/50 rounded-full border border-slate-700 group-hover:border-cyber-cyan/50 transition-colors flex justify-center py-4">
        {/* Track Line */}
        <div className="absolute top-4 bottom-4 w-1 bg-slate-800 rounded-full pointer-events-none"></div>
        {/* Fill Line */}
        <div 
            className="absolute bottom-4 w-1 bg-cyber-cyan rounded-full pointer-events-none transition-all duration-150"
            style={{ height: `calc(${(value / 180) * 100}% - 32px)` }}
        ></div>

        <input
          type="range"
          min="0"
          max="180"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="range-vertical absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[40px] opacity-0 cursor-pointer"
        />
        
        {/* Visual Thumb Indicator (Optional visual enhancement) */}
        <div 
            className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-full pointer-events-none transition-all duration-75"
            style={{ bottom: `calc(${(value / 180) * 80}% + 10px)` }} // Approximate positioning
        ></div>
      </div>
      
      <div className="text-center space-y-1">
        <span className="block font-mono text-xs font-bold text-slate-400 group-hover:text-cyber-cyan uppercase">{label}</span>
        <div className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
            <span className="font-tech text-cyber-cyan text-sm">{value}°</span>
        </div>
      </div>
    </div>
  );
};