import { useState, useRef, useCallback } from 'react';
import { AppConfig, LogEntry, SignalKPI, SystemMetrics, EngineStatus } from '@/types/solana';
import { generateLogEntry, generateSignal, generateMetrics } from '@/lib/mock-data';

const TOTAL_BLOCKS = 432000;

export function useEngine() {
  const [status, setStatus] = useState<EngineStatus>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [signals, setSignals] = useState<SignalKPI[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blockRef = useRef(0);

  const validateConfig = useCallback(async (config: AppConfig) => {
    setStatus('finding-block');
    setError(null);

    try {
      const rpcRes = await fetch(config.heliusRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSlot', params: [] }),
      });
      if (rpcRes.ok) {
        const rpcData = await rpcRes.json();
        if (rpcData.error) console.warn('RPC warning:', rpcData.error.message);
      }
    } catch (e: any) {
      console.warn('API validation skipped:', e.message);
    }
    return true;
  }, []);

  const launch = useCallback(async (config: AppConfig) => {
    const valid = await validateConfig(config);
    if (!valid) return;

    setStatus('running');
    blockRef.current = 0;

    intervalRef.current = setInterval(() => {
      blockRef.current += Math.floor(Math.random() * 50 + 10);
      if (blockRef.current >= TOTAL_BLOCKS) {
        blockRef.current = TOTAL_BLOCKS;
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus('completed');
      }

      setProgress(blockRef.current / TOTAL_BLOCKS);

      const newLogs = Array.from({ length: Math.floor(Math.random() * 3 + 1) }, () => generateLogEntry());
      setLogs(prev => [...newLogs, ...prev].slice(0, 500));

      if (Math.random() > 0.6) {
        const signal = generateSignal(blockRef.current + 200000000);
        setSignals(prev => [signal, ...prev]);
      }

      setMetrics(generateMetrics(blockRef.current, TOTAL_BLOCKS));
    }, 200);
  }, [validateConfig]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus('completed');
  }, []);

  return { status, logs, signals, metrics, error, progress, launch, stop, setStatus };
}
