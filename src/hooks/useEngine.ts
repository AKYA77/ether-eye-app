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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const blockRef = useRef(0);

  const validateConfig = useCallback(async (config: AppConfig) => {
    setStatus('finding-block');
    setError(null);

    try {
      // Validate Helius RPC
      const rpcRes = await fetch(config.heliusRpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSlot', params: [] }),
      });
      if (!rpcRes.ok) throw new Error('Invalid Helius RPC URL or connection failed');
      const rpcData = await rpcRes.json();
      if (rpcData.error) throw new Error(`RPC Error: ${rpcData.error.message}`);

      // Validate BirdEye
      const beRes = await fetch('https://public-api.birdeye.so/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=1', {
        headers: { 'X-API-KEY': config.birdeyeApiKey, 'x-chain': 'solana' },
      });
      if (!beRes.ok) throw new Error('Invalid BirdEye API key');

      return true;
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
      return false;
    }
  }, []);

  const launch = useCallback(async (config: AppConfig) => {
    const valid = await validateConfig(config);
    if (!valid) return;

    setStatus('running');
    blockRef.current = 0;

    // Simulate engine running with mock data
    intervalRef.current = setInterval(() => {
      blockRef.current += Math.floor(Math.random() * 50 + 10);
      if (blockRef.current >= TOTAL_BLOCKS) {
        blockRef.current = TOTAL_BLOCKS;
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus('completed');
      }

      setProgress(blockRef.current / TOTAL_BLOCKS);

      // Generate log entries
      const newLogs = Array.from({ length: Math.floor(Math.random() * 3 + 1) }, () => generateLogEntry());
      setLogs(prev => [...newLogs, ...prev].slice(0, 500));

      // Occasionally generate signals
      if (Math.random() > 0.6) {
        const signal = generateSignal(blockRef.current + 200000000);
        setSignals(prev => [signal, ...prev]);
      }

      // Update metrics
      setMetrics(generateMetrics(blockRef.current, TOTAL_BLOCKS));
    }, 200);
  }, [validateConfig]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus('completed');
  }, []);

  return { status, logs, signals, metrics, error, progress, launch, stop, setStatus };
}
