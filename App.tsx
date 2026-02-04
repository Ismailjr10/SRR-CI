import React, { useState, useRef, useCallback } from 'react';
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

  // --- Hardware Refs ---
  const portRef = useRef<any>(null); // Using any for SerialPort as it's experimental
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  const keepReadingRef = useRef<boolean>(false);

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

  // --- Serial Logic ---

  const sendSerialData = useCallback(async (data: string) => {
    if (!writerRef.current || isKilled) return;
    try {
      const encoder = new TextEncoder();
      await writerRef.current.write(encoder.encode(data));
    } catch (err) {
      console.error('Write error:', err);
      addLog('ERROR', 'Failed to send data to hardware');
    }
  }, [addLog, isKilled]);

  const connectHand = async () => {
    if (!('serial' in navigator)) {
      addLog('ERROR', 'CRITICAL: Web Serial API not supported in this browser.');
      return;
    }

    try {
      // 1. Request Port
      const port = await (navigator as any).serial.requestPort();
      portRef.current = port;
      
      // 2. Open Port (Standard Arduino baud rate)
      await port.open({ baudRate: 9600 });
      addLog('INFO', 'Serial port opened. Waiting for handshake...');

      // 3. Setup Writer
      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
      writerRef.current = textEncoder.writable.getWriter();

      // 4. Setup Reader (Handshake Listener)
      keepReadingRef.current = true;
      readLoop(port);

    } catch (err: any) {
      console.error(err);
      
      if (err.name === 'SecurityError') {
        addLog('ERROR', 'BLOCKED: Please open this app in a new tab. Popups are blocked in the preview window.');
      } else if (err.name === 'NotFoundError') {
        addLog('WARN', 'User cancelled port selection.');
      } else {
        addLog('ERROR', `Connection failed: ${err.name} - ${err.message}`);
      }
      
      setStatus('DISCONNECTED');
    }
  };

  const readLoop = async (port: any) => {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    readerRef.current = reader;

    try {
      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        if (value) {
            // Handshake Logic
            if (value.includes('READY')) {
                setStatus('CONNECTED');
                addLog('SUCCESS', 'Hardware Handshake Received: READY');
            }
            // Log other incoming data for debug
            // console.log('RX:', value); 
        }
      }
    } catch (error) {
      console.error(error);
      addLog('ERROR', 'Serial read error.');
      disconnectSerial();
    }
  };

  const disconnectSerial = async () => {
    keepReadingRef.current = false;
    
    if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
    }
    
    if (writerRef.current) {
        await writerRef.current.close();
        writerRef.current = null;
    }

    if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
    }

    setStatus('DISCONNECTED');
    addLog('WARN', 'Serial connection closed.');
  };

  // --- Handlers ---

  const handleFingerChange = (finger: keyof FingerPositions, val: number) => {
    if (isKilled) return;
    
    // Update UI immediately
    setFingers(prev => ({ ...prev, [finger]: val }));

    // Throttle Serial writes to 50ms to prevent flooding UART
    const now = Date.now();
    if (now - lastSentTimeRef.current > 50 && status === 'CONNECTED') {
        const fingerCode = finger.charAt(0).toUpperCase(); // T, I, M, R, P
        const command = `${fingerCode}:${val}\n`;
        sendSerialData(command);
        lastSentTimeRef.current = now;
    }
  };

  const handleMacro = async (macro: MacroType) => {
    if (isKilled) {
      addLog('ERROR', 'Cannot execute macro: Emergency Stop Active');
      return;
    }
    
    addLog('INFO', `Sending Macro: ${macro}...`);
    
    // Command Mapping
    let cmdString = '';
    switch (macro) {
        case 'UNSCREW_PENTALOBE': cmdString = 'CMD:UNSCREW\n'; break;
        case 'LIFT_BATTERY': cmdString = 'CMD:LIFT\n'; break;
        case 'HOME_POSITION': 
            cmdString = 'CMD:HOME\n'; 
            setFingers(INITIAL_FINGERS);
            break;
        case 'CALIBRATE_SENSORS': cmdString = 'CMD:CALIBRATE\n'; break;
        case 'CLEAN_CONNECTOR': cmdString = 'CMD:CLEAN\n'; break;
        case 'APPLY_ADHESIVE': cmdString = 'CMD:ADHESIVE\n'; break;
    }

    if (cmdString && status === 'CONNECTED') {
        sendSerialData(cmdString);
    } else {
        // Fallback logging for offline testing or disconnected state
        setTimeout(() => addLog('WARN', 'Command ignored: Not connected to hardware.'), 200);
    }
  };

  const toggleKillSwitch = () => {
    const newState = !isKilled;
    setIsKilled(newState);
    if (newState) {
      addLog('ERROR', '!!! EMERGENCY KILL SWITCH ACTIVATED !!!');
      addLog('WARN', 'Sending HALT command to hardware.');
      sendSerialData('CMD:HALT\n');
      setStatus('ERROR');
      // We don't disconnect serial here, so we can resume later, 
      // but we block all other outgoing commands.
    } else {
      addLog('INFO', 'Emergency stop released. Re-arming system.');
      sendSerialData('CMD:RESUME\n');
      if (portRef.current) setStatus('CONNECTED');
      else setStatus('DISCONNECTED');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-slate-200 font-sans selection:bg-cyber-cyan/30 flex flex-col">
      
      <Header status={status} onConnect={connectHand} />

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Vision */}
        <section className="h-full min-h-[500px]">
          <VisionPanel 
            active={!isKilled} 
            onLog={addLog}
          />
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