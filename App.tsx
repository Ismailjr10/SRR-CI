import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { VisionPanel } from './components/VisionPanel';
import { ControlsPanel } from './components/ControlsPanel';
import { Footer } from './components/Footer';
import { ConnectionStatus, FingerPositions, LogEntry, Mode, MacroType } from './types';
import { INITIAL_FINGERS, MAX_LOGS } from './constants';

const App: React.FC = () => {
  // --- State ---
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [mode, setMode] = useState<Mode>('MANUAL');
  const [fingers, setFingers] = useState<FingerPositions>(INITIAL_FINGERS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isKilled, setIsKilled] = useState(false);

  // --- Helpers ---
  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    setLogs(prev => {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 } as any),
        level,
        message
      };
      const newLogs = [...prev, newLog];
      if (newLogs.length > MAX_LOGS) return newLogs.slice(newLogs.length - MAX_LOGS);
      return newLogs;
    });
  }, []);

  // --- Effects ---
  
  // Simulate Startup Sequence
  useEffect(() => {
    addLog('INFO', 'Initializing SRR-CI v4.0.2...');
    
    const timers: ReturnType<typeof setTimeout>[] = [];
    
    timers.push(setTimeout(() => addLog('INFO', 'Checking vision sensors...'), 500));
    timers.push(setTimeout(() => addLog('INFO', 'Calibrating servos...'), 1200));
    timers.push(setTimeout(() => {
      setStatus('CONNECTED');
      addLog('SUCCESS', 'Connection established with SRR-ARM-01');
    }, 2000));

    return () => timers.forEach(clearTimeout);
  }, [addLog]);

  // --- Handlers ---
  const handleFingerChange = (finger: keyof FingerPositions, val: number) => {
    if (isKilled) return;
    setFingers(prev => ({ ...prev, [finger]: val }));
    // Debounce logging could be added here, but for now we skip spamming logs on drag
  };

  const handleMacro = async (macro: MacroType) => {
    if (isKilled) {
      addLog('ERROR', 'Cannot execute macro: Emergency Stop Active');
      return;
    }

    addLog('INFO', `Executing Macro: ${macro}...`);
    
    // Simulate macro execution
    if (macro === 'HOME_POSITION') {
        setFingers(INITIAL_FINGERS);
        setTimeout(() => addLog('SUCCESS', 'Macro HOME_POSITION completed.'), 800);
    } else if (macro === 'UNSCREW_PENTALOBE') {
        // Simulation of values changing
        setFingers({ thumb: 45, index: 45, middle: 90, ring: 90, pinky: 90 });
        setTimeout(() => addLog('SUCCESS', 'Pentalobe screws removed.'), 1500);
    } else if (macro === 'LIFT_BATTERY') {
        setFingers({ thumb: 120, index: 120, middle: 0, ring: 0, pinky: 0 });
        setTimeout(() => addLog('SUCCESS', 'Battery lifted successfully.'), 1500);
    } else if (macro === 'CALIBRATE_SENSORS') {
        setTimeout(() => addLog('SUCCESS', 'Sensor array calibrated (Delta: 0.02ms).'), 1200);
    } else if (macro === 'CLEAN_CONNECTOR') {
        setTimeout(() => addLog('SUCCESS', 'Connector brush cycle complete.'), 2000);
    } else if (macro === 'APPLY_ADHESIVE') {
        setTimeout(() => addLog('SUCCESS', 'Adhesive strip applied to chassis.'), 1800);
    }
  };

  const toggleKillSwitch = () => {
    const newState = !isKilled;
    setIsKilled(newState);
    if (newState) {
      addLog('ERROR', '!!! EMERGENCY KILL SWITCH ACTIVATED !!!');
      addLog('WARN', 'All actuators halted immediately.');
      setStatus('ERROR');
    } else {
      addLog('INFO', 'Emergency stop released. System reset required.');
      setStatus('CONNECTED');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-slate-200 font-sans selection:bg-cyber-cyan/30 flex flex-col">
      
      <Header status={status} />

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Vision */}
        <section className="h-full min-h-[500px]">
          <VisionPanel active={status === 'CONNECTED' && !isKilled} />
        </section>

        {/* Right Panel: Controls */}
        <section className="h-full min-h-[500px]">
          <ControlsPanel
            mode={mode}
            setMode={(m) => {
                if(!isKilled) {
                    setMode(m);
                    addLog('INFO', `Switched to ${m} mode`);
                }
            }}
            fingers={fingers}
            onFingerChange={handleFingerChange}
            onMacro={handleMacro}
            disabled={status !== 'CONNECTED' || isKilled}
          />
        </section>
      </main>

      <div className="p-6 pt-0">
        <Footer 
            logs={logs} 
            onKillSwitch={toggleKillSwitch}
            isKilled={isKilled}
        />
      </div>

    </div>
  );
};

export default App;