import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Power, Terminal } from 'lucide-react';

interface FooterProps {
  logs: LogEntry[];
  onKillSwitch: () => void;
  isKilled: boolean;
}

export const Footer: React.FC<FooterProps> = ({ logs, onKillSwitch, isKilled }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <footer className="h-48 grid grid-cols-[300px_1fr] gap-4">
      {/* Kill Switch Area */}
      <div className="flex flex-col items-center justify-center bg-slate-900/80 border border-red-900/30 p-4 rounded-sm relative overflow-hidden">
        {isKilled && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>}
        
        <button
          onClick={onKillSwitch}
          className={`relative group w-full h-full border-4 transition-all duration-200 flex flex-col items-center justify-center gap-2 rounded shadow-2xl ${
            isKilled 
              ? 'bg-red-950 border-red-700 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
              : 'bg-slate-800 border-red-900 hover:bg-red-950 hover:border-red-600'
          }`}
        >
          <Power className={`w-12 h-12 ${isKilled ? 'text-red-500 animate-pulse' : 'text-red-700 group-hover:text-red-500'}`} />
          <span className={`text-xl font-black font-tech tracking-[0.2em] ${isKilled ? 'text-red-500' : 'text-red-800 group-hover:text-red-500'}`}>
            {isKilled ? 'SYSTEM HALTED' : 'EMERGENCY STOP'}
          </span>
          <div className="absolute top-2 left-2 w-2 h-2 bg-slate-900 rounded-full border border-slate-700"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-slate-900 rounded-full border border-slate-700"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-slate-900 rounded-full border border-slate-700"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-slate-900 rounded-full border border-slate-700"></div>
        </button>
      </div>

      {/* Console Log Area */}
      <div className="bg-black border border-slate-800 rounded-sm p-2 flex flex-col font-mono text-xs overflow-hidden relative shadow-inner">
        <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-1 mb-1 px-2">
            <Terminal className="w-3 h-3" />
            <span>SYS_LOG_OUTPUT</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 hover:bg-slate-900/50 px-1 rounded transition-colors">
              <span className="text-slate-600 whitespace-nowrap">[{log.timestamp}]</span>
              <span className={`font-bold whitespace-nowrap ${
                log.level === 'ERROR' ? 'text-red-500' :
                log.level === 'WARN' ? 'text-yellow-500' :
                log.level === 'SUCCESS' ? 'text-emerald-500' :
                'text-cyber-cyan'
              }`}>
                {log.level}
              </span>
              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </footer>
  );
};