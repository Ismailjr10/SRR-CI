import React, { useState } from 'react';
import { Eye, Crosshair, Scan, ZoomIn, ZoomOut } from 'lucide-react';

interface VisionPanelProps {
  active: boolean;
}

export const VisionPanel: React.FC<VisionPanelProps> = ({ active }) => {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative h-full w-full flex flex-col bg-cyber-dark border border-slate-700/50 rounded-sm overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-2 text-cyber-cyan">
          <Eye className="w-4 h-4" />
          <span className="font-tech tracking-wider text-sm">VISION_DASHBOARD_V2.1</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs font-mono text-red-500">LIVE</span>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden p-1">
        
        {/* Placeholder Feed Graphics - Zoomable Layer */}
        <div className="absolute inset-0 overflow-hidden">
             <div 
                className="w-full h-full bg-[url('https://picsum.photos/1200/800?grayscale')] bg-cover bg-center opacity-40 mix-blend-luminosity transition-transform duration-200 ease-out origin-center will-change-transform"
                style={{ transform: `scale(${zoom})` }}
             ></div>
        </div>
        
        {/* World Objects Layer - Scales with Zoom */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div 
                className="w-full h-full transition-transform duration-200 ease-out origin-center will-change-transform"
                style={{ transform: `scale(${zoom})` }}
             >
                {/* Bounding Box Simulation */}
                <div className="absolute top-1/3 left-1/3 w-32 h-48 border border-cyber-pink/50 rounded-sm">
                    <div className="absolute -top-4 left-0 text-[10px] bg-cyber-pink/20 text-cyber-pink px-1 font-mono">BATTERY_CELL</div>
                    {/* Corner accents for tech feel */}
                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-cyber-pink"></div>
                    <div className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t border-r border-cyber-pink"></div>
                    <div className="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b border-l border-cyber-pink"></div>
                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-cyber-pink"></div>
                </div>
             </div>
        </div>
        
        {/* Grid Overlay - Static HUD Element */}
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-20 pointer-events-none"></div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-cyan/10 to-transparent h-[20%] w-full animate-scanline pointer-events-none"></div>

        {/* HUD Elements */}
        <div className="absolute top-4 left-4 text-xs font-mono text-cyber-cyan/70 space-y-1 pointer-events-none">
          <p>ISO: 800</p>
          <p>EXP: 1/60</p>
          <p>IRIS: f/2.8</p>
          <p>SRC: CAM_01_ARM_L</p>
        </div>

        <div className="absolute top-4 right-4 text-xs font-mono text-emerald-500/70 text-right space-y-1 pointer-events-none">
          <p>OBJ_DETECT: ENABLED</p>
          <p>CONFIDENCE: 98.4%</p>
          <p>DEPTH_MAP: ACTIVE</p>
        </div>

        {/* Zoom Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-slate-900/90 border border-slate-700 py-3 px-1.5 rounded-full backdrop-blur-sm z-30 shadow-xl">
            <button 
                onClick={() => setZoom(z => Math.min(z + 0.5, 4))}
                className="text-slate-400 hover:text-cyber-cyan transition-colors p-1 active:scale-95"
                aria-label="Zoom In"
                disabled={zoom >= 4}
            >
                <ZoomIn className="w-4 h-4" />
            </button>
            
            <div className="h-32 w-1.5 bg-slate-800 rounded-full relative group/slider">
                {/* Visual Indicator */}
                <div 
                    className="absolute bottom-0 w-full bg-cyber-cyan rounded-full transition-all duration-100"
                    style={{ height: `${((zoom - 1) / 3) * 100}%` }}
                ></div>
                
                {/* Invisible Range Input */}
                <input 
                    type="range"
                    min="1"
                    max="4"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-8 opacity-0 cursor-pointer -rotate-90 origin-center"
                />
            </div>

            <button 
                onClick={() => setZoom(z => Math.max(z - 0.5, 1))}
                className="text-slate-400 hover:text-cyber-cyan transition-colors p-1 active:scale-95"
                aria-label="Zoom Out"
                disabled={zoom <= 1}
            >
                <ZoomOut className="w-4 h-4" />
            </button>
            
            <div className="w-full text-center border-t border-slate-700 pt-1 mt-1">
                <span className="font-mono text-[10px] text-cyber-cyan font-bold block">{zoom.toFixed(1)}x</span>
            </div>
        </div>

        {/* Center Reticle - Static HUD Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-60">
           <Crosshair className="w-24 h-24 text-cyber-cyan stroke-[0.5]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-cyber-pink rounded-full"></div>
        </div>

        {/* Status Overlay */}
        {!active && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-40">
                <div className="text-center space-y-4">
                    <Scan className="w-16 h-16 text-slate-600 mx-auto" />
                    <p className="font-tech text-xl text-slate-500">VISION FEED OFFLINE</p>
                    <p className="font-mono text-xs text-slate-600">CHECK CONNECTION CABLES</p>
                </div>
            </div>
        )}
      </div>

      {/* Footer Data */}
      <div className="px-3 py-1 bg-slate-900 border-t border-slate-700 flex justify-between font-mono text-[10px] text-slate-400">
        <span>RES: 1920x1080 @ 60fps</span>
        <span>LATENCY: 12ms</span>
      </div>
    </div>
  );
};