import React from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface HeaderProps {
  status: ConnectionStatus;
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-cyber-dark border-b border-cyber-cyanDim backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-cyber-cyan animate-pulse-fast" />
        <div>
          <h1 className="text-3xl font-tech font-bold text-cyber-cyan tracking-widest drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            SRR-CI
          </h1>
          <p className="text-xs text-slate-500 font-mono tracking-wider">SMARTPHONE REPAIR ROBOTIC INTERFACE</p>
        </div>
      </div>

      <div className={`flex items-center gap-2 px-4 py-2 rounded-sm border ${
        status === 'CONNECTED' 
          ? 'border-cyber-green bg-green-950/30 text-cyber-green' 
          : status === 'DISCONNECTED'
          ? 'border-cyber-slate bg-slate-900 text-slate-400'
          : 'border-cyber-red bg-red-950/30 text-cyber-red'
      }`}>
        {status === 'CONNECTED' ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
        <span className="font-mono font-bold tracking-wider">{status}</span>
      </div>
    </header>
  );
};