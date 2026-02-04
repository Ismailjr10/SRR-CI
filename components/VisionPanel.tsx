import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Crosshair, Scan, ZoomIn, ZoomOut, Search, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { LogEntry } from '../types';

interface VisionPanelProps {
  active: boolean;
  onLog: (level: LogEntry['level'], message: string) => void;
}

interface BoundingBox {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const VisionPanel: React.FC<VisionPanelProps> = ({ active, onLog }) => {
  const [zoom, setZoom] = useState(1);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Manage Camera Stream based on Privacy Shutter
  useEffect(() => {
    async function toggleStream() {
      if (isCameraOn && active) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                  width: { ideal: 1920 }, 
                  height: { ideal: 1080 },
                  facingMode: "environment"
              } 
          });
          streamRef.current = mediaStream;
          setStream(mediaStream);
          setCameraError(false);
          onLog('INFO', 'Optical sensor activated.');
        } catch (err) {
          console.error("Camera access denied:", err);
          setCameraError(true);
          onLog('ERROR', 'Camera access denied or unavailable.');
        }
      } else {
        // Privacy Mode / Shutdown
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setStream(null);
        if (!isCameraOn) onLog('INFO', 'Optical sensor in standby (Privacy Mode).');
      }
    }

    toggleStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn, active]);

  // Sync stream to video element
  useEffect(() => {
      if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
      }
  }, [stream]);

  const handleScan = async () => {
      if (!stream || !videoRef.current) {
          onLog('WARN', 'Cannot scan: Optical sensor is offline.');
          return;
      }
      
      if (!process.env.API_KEY) {
          onLog('ERROR', 'API Key missing. Cannot contact Gemini Robotics.');
          return;
      }

      setAnalyzing(true);
      onLog('INFO', 'ANALYZING W/ GEMINI ROBOTICS...');
      setBoundingBoxes([]);

      try {
          // 1. Capture Frame
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) throw new Error("Canvas context initialization failed");
          
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]; // Remove header

          // 2. Call Gemini
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-robotics-er-1.5-preview',
            contents: {
              parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                { text: 'Analyze this smartphone repair workspace. Identify key components (screws, battery, screen). Return a JSON array of bounding boxes with coordinates scaled 0-100.' }
              ],
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    ymin: { type: Type.NUMBER },
                    xmin: { type: Type.NUMBER },
                    ymax: { type: Type.NUMBER },
                    xmax: { type: Type.NUMBER },
                  },
                  required: ['label', 'ymin', 'xmin', 'ymax', 'xmax'],
                },
              },
            },
          });

          // 3. Process Response
          const results = JSON.parse(response.text || "[]");
          const boxes = results.map((b: any) => ({
              id: Math.random().toString(36),
              label: b.label.toUpperCase().replace(/\s+/g, '_'),
              x: b.xmin,
              y: b.ymin,
              width: b.xmax - b.xmin,
              height: b.ymax - b.ymin
          }));

          setBoundingBoxes(boxes);
          onLog('SUCCESS', `Analysis complete. Identification count: ${boxes.length}`);

      } catch (e: any) {
          console.error("Analysis failed", e);
          onLog('ERROR', `Gemini Analysis Failed: ${e.message || 'Unknown Error'}`);
      } finally {
          setAnalyzing(false);
      }
  };

  const isFeedVisible = isCameraOn && !cameraError && !!stream;

  return (
    <div className="relative h-full w-full flex flex-col bg-cyber-dark border border-slate-700/50 rounded-sm overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-2 text-cyber-cyan">
          <Eye className="w-4 h-4" />
          <span className="font-tech tracking-wider text-sm">VISION_DASHBOARD_V2.1</span>
        </div>
        
        {/* Privacy Shutter Toggle */}
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsCameraOn(!isCameraOn)}
                disabled={!active}
                className={`flex items-center gap-2 px-2 py-0.5 rounded border transition-all text-[10px] font-bold font-mono ${
                    isCameraOn 
                    ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20' 
                    : 'border-slate-600 text-slate-500 hover:text-slate-300'
                }`}
            >
                {isCameraOn ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                OPTICAL SENSOR: {isCameraOn ? 'ON' : 'OFF'}
            </button>
            
            <div className="flex gap-1">
                <div className={`w-2 h-2 rounded-full ${active && isFeedVisible ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className={`text-xs font-mono ${active && isFeedVisible ? 'text-red-500' : 'text-slate-600'}`}>
                    {active && isFeedVisible ? 'LIVE' : 'OFFLINE'}
                </span>
            </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden p-1">
        
        {/* Video Layer - Zoomable */}
        <div className="absolute inset-0 overflow-hidden">
             <div 
                className="w-full h-full transition-transform duration-200 ease-out origin-center will-change-transform"
                style={{ transform: `scale(${zoom})` }}
             >
                {/* Video Element */}
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isFeedVisible ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Bounding Boxes Layer */}
                {boundingBoxes.map(box => (
                    <div 
                        key={box.id}
                        className="absolute border-2 border-cyber-pink shadow-[0_0_10px_rgba(217,70,239,0.5)] bg-cyber-pink/5 animate-pulse"
                        style={{ 
                            left: `${box.x}%`, 
                            top: `${box.y}%`, 
                            width: `${box.width}%`, 
                            height: `${box.height}%` 
                        }}
                    >
                         <div className="absolute -top-6 left-0 text-[10px] bg-cyber-pink text-slate-900 px-1 font-bold font-mono whitespace-nowrap">
                            {box.label}
                         </div>
                         {/* Tech Corners */}
                         <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyber-pink"></div>
                         <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyber-pink"></div>
                         <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyber-pink"></div>
                         <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyber-pink"></div>
                    </div>
                ))}
             </div>
        </div>
        
        {/* Overlays (Grid, Scanline, HUD) */}
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-20 pointer-events-none"></div>
        {isFeedVisible && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-cyan/5 to-transparent h-[20%] w-full animate-scanline pointer-events-none"></div>
        )}

        {/* HUD Elements */}
        <div className="absolute top-4 left-4 text-xs font-mono text-cyber-cyan/70 space-y-1 pointer-events-none">
          <p>ISO: {isFeedVisible ? '800' : '---'}</p>
          <p>SRC: LOCAL_CAM_01</p>
        </div>

        <div className="absolute top-4 right-4 text-xs font-mono text-emerald-500/70 text-right space-y-1 pointer-events-none">
          <p>OBJ_DETECT: {analyzing ? 'SCANNING' : boundingBoxes.length > 0 ? 'LOCKED' : 'IDLE'}</p>
        </div>

        {/* Zoom Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-slate-900/90 border border-slate-700 py-3 px-1.5 rounded-full backdrop-blur-sm z-30 shadow-xl">
            <button 
                onClick={() => setZoom(z => Math.min(z + 0.5, 4))}
                className="text-slate-400 hover:text-cyber-cyan transition-colors p-1 active:scale-95"
                disabled={zoom >= 4}
            >
                <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-32 w-1.5 bg-slate-800 rounded-full relative group/slider">
                <div 
                    className="absolute bottom-0 w-full bg-cyber-cyan rounded-full transition-all duration-100"
                    style={{ height: `${((zoom - 1) / 3) * 100}%` }}
                ></div>
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
                disabled={zoom <= 1}
            >
                <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-full text-center border-t border-slate-700 pt-1 mt-1">
                <span className="font-mono text-[10px] text-cyber-cyan font-bold block">{zoom.toFixed(1)}x</span>
            </div>
        </div>

        {/* Center Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-60">
           <Crosshair className={`w-24 h-24 text-cyber-cyan stroke-[0.5] ${analyzing ? 'animate-spin' : ''}`} />
        </div>

        {/* Scan Button - Bottom Center Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-64">
            <button
                onClick={handleScan}
                disabled={analyzing || !isFeedVisible || !active}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-sm font-tech font-bold tracking-widest border transition-all ${
                    analyzing 
                    ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan cursor-wait'
                    : 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:border-slate-700 disabled:text-slate-500`}
            >
                {analyzing ? <Scan className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {analyzing ? 'ANALYZING...' : 'SCAN FOR COMPONENTS'}
            </button>
        </div>

        {/* Offline / Error Overlay */}
        {(!isFeedVisible) && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center backdrop-blur-sm z-40">
                <div className="text-center space-y-4">
                    {cameraError ? (
                        <>
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
                            <p className="font-tech text-xl text-red-500">CAMERA ERROR</p>
                            <p className="font-mono text-xs text-slate-400">ACCESS DENIED OR DEVICE NOT FOUND</p>
                        </>
                    ) : !isCameraOn ? (
                        <>
                            <ShieldCheck className="w-16 h-16 text-slate-700 mx-auto" />
                            <p className="font-tech text-xl text-slate-500">PRIVACY MODE ACTIVE</p>
                            <p className="font-mono text-xs text-slate-600">OPTICAL SENSOR DISABLED</p>
                        </>
                    ) : (
                        <>
                            <Scan className="w-16 h-16 text-slate-600 mx-auto" />
                            <p className="font-tech text-xl text-slate-500">VISION FEED OFFLINE</p>
                            <p className="font-mono text-xs text-slate-600">SYSTEM DISCONNECTED</p>
                        </>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Footer Data */}
      <div className="px-3 py-1 bg-slate-900 border-t border-slate-700 flex justify-between font-mono text-[10px] text-slate-400">
        <span>RES: {isFeedVisible ? '1080p' : 'N/A'}</span>
        <span>LATENCY: {isFeedVisible ? '1ms' : '---'}</span>
      </div>
    </div>
  );
};