import { useState, useRef, useCallback, useEffect } from 'react';
import { AppConfig, LogEntry, SignalKPI, SystemMetrics, EngineStatus, WsStatus } from '@/types/solana';
import { generateLogEntry, generateSignal, generateMetrics } from '@/lib/mock-data';

const TOTAL_BLOCKS = 432000;
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 5000;

export function useEngine() {
  const [status, setStatus] = useState<EngineStatus>('idle');
  const [wsStatus, setWsStatus] = useState<WsStatus>('disconnected');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [signals, setSignals] = useState<SignalKPI[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectCountRef = useRef(0);
  const configRef = useRef<AppConfig | null>(null);
  const blockRef = useRef(0);
  let logIdCounter = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  const connectWebSocket = useCallback((config: AppConfig) => {
    setWsStatus('connecting');
    setError(null);

    const wsUrl = config.backendUrl.replace(/^http/, 'ws');
    const fullUrl = wsUrl.endsWith('/ws') ? wsUrl : `${wsUrl}/ws`;

    try {
      const ws = new WebSocket(fullUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        reconnectCountRef.current = 0;

        // Send config payload
        ws.send(JSON.stringify({
          type: 'config',
          heliusRpcUrl: config.heliusRpcUrl,
          birdeyeApiKey: config.birdeyeApiKey,
          startTimestamp: config.startDate.toISOString(),
          minProfitThreshold: config.minProfitThreshold,
          maxComputeUnits: config.maxComputeUnits,
        }));

        // Start heartbeat ping/pong every 5s
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, HEARTBEAT_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'config-accepted':
              setStatus('running');
              break;

            case 'config-error':
              setError(msg.message || 'Backend rejected configuration');
              setStatus('error');
              break;

            case 'log':
              setLogs(prev => [{
                id: `log-${++logIdCounter.current}`,
                timestamp: msg.timestamp,
                mint: msg.mint,
                decision: msg.decision,
                reason: msg.reason,
              }, ...prev].slice(0, 500));
              break;

            case 'signal':
              setSignals(prev => [{
                id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                slot: msg.slot,
                timestamp: msg.timestamp,
                tokenPair: msg.tokenPair,
                dexRoute: msg.dexRoute,
                optimalInput: msg.optimalInput,
                grossProfit: msg.grossProfit,
                netProfit: msg.netProfit,
                realizedSlippagePct: msg.realizedSlippagePct,
                priorityFee99th: msg.priorityFee99th,
                jitoTipDetected: msg.jitoTipDetected,
                marginFiLiquidityStatus: msg.marginFiLiquidityStatus,
                competitorOverlapCount: msg.competitorOverlapCount,
                winnerSignature: msg.winnerSignature,
                latencyBufferMs: msg.latencyBufferMs,
                realismFactor: msg.realismFactor,
                historicalAgePoolAMonths: msg.historicalAgePoolAMonths,
                historicalAgePoolBMonths: msg.historicalAgePoolBMonths,
                totalTvlUsd: msg.totalTvlUsd,
                instructionIndex: msg.instructionIndex,
                atomicSuccessLiteSVM: msg.atomicSuccessLiteSVM,
                alphaScore: msg.alphaScore,
              }, ...prev]);
              break;

            case 'metrics':
              setMetrics({
                rpcLatencyMs: msg.rpcLatencyMs,
                cpuLoadPct: msg.cpuLoadPct,
                ramUsageMb: msg.ramUsageMb,
                totalSignals: msg.totalSignals,
                netProfitSum: msg.netProfitSum,
                successRatePct: msg.successRatePct,
                activePoolsTracked: msg.activePoolsTracked,
                uniqueMintsTracked: msg.uniqueMintsTracked,
                currentBlock: msg.currentBlock,
                totalBlocks: msg.totalBlocks,
              });
              setProgress(msg.currentBlock / msg.totalBlocks);
              break;

            case 'completed':
              setStatus('completed');
              break;

            case 'error':
              setError(msg.message);
              setStatus('error');
              break;

            case 'pong':
              break;

            default:
              console.warn('Unknown WS message type:', msg.type);
          }
        } catch (e) {
          console.warn('Failed to parse WS message:', e);
        }
      };

      ws.onerror = () => {
        setWsStatus('error');
      };

      ws.onclose = (event) => {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);

        if (status === 'running' && reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
          setWsStatus('reconnecting');
          reconnectCountRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 16000);
          setTimeout(() => {
            if (configRef.current) connectWebSocket(configRef.current);
          }, delay);
        } else if (reconnectCountRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setWsStatus('error');
          setError(`WebSocket disconnected after ${MAX_RECONNECT_ATTEMPTS} reconnect attempts (code: ${event.code})`);
          setStatus('error');
        } else {
          setWsStatus('disconnected');
        }
      };
    } catch (e: any) {
      setWsStatus('error');
      setError(`Failed to connect: ${e.message}`);
      setStatus('error');
    }
  }, [status]);

  // Demo mode with mock data
  const launchDemo = useCallback(async (config: AppConfig) => {
    setStatus('finding-block');
    setError(null);
    setWsStatus('disconnected');

    // Brief validation attempt
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
  }, []);

  // Live mode with real WebSocket
  const launchLive = useCallback((config: AppConfig) => {
    setStatus('finding-block');
    setError(null);
    configRef.current = config;
    connectWebSocket(config);
  }, [connectWebSocket]);

  const launch = useCallback(async (config: AppConfig) => {
    // Reset state
    setLogs([]);
    setSignals([]);
    setMetrics(null);
    setProgress(0);

    if (config.mode === 'live') {
      launchLive(config);
    } else {
      await launchDemo(config);
    }
  }, [launchLive, launchDemo]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    setStatus('completed');
    setWsStatus('disconnected');
  }, []);

  return { status, wsStatus, logs, signals, metrics, error, progress, launch, stop, setStatus };
}
