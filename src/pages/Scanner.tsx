import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Radio, Square, Activity, AlertTriangle } from 'lucide-react';

interface ScanLog {
  slot: number;
  type: string;
  message: string;
  timestamp?: string;
}

export default function Scanner() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [currentSlot, setCurrentSlot] = useState(0);
  const [startSlot, setStartSlot] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [batchSize, setBatchSize] = useState(5);
  const scanningRef = useRef(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId) loadSession();
  }, [sessionId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadSession = async () => {
    const { data } = await supabase.from('scan_sessions').select('*').eq('id', sessionId!).single();
    if (data) {
      setSession(data);
      setCurrentSlot(data.current_block || 0);
    }

    // Load existing signals
    const { data: sigs } = await supabase.from('signals').select('*').eq('session_id', sessionId!).order('created_at', { ascending: false }).limit(100);
    setSignals(sigs || []);
  };

  const getStartSlot = async () => {
    if (!session) return 0;
    try {
      const res = await fetch(session.helius_rpc_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1, method: 'getSlot', params: [],
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(`RPC Error: ${data.error.message}`);
        return 0;
      }
      return data.result || 0;
    } catch (e: any) {
      setError(`RPC unreachable: ${e.message}`);
      return 0;
    }
  };

  const startScan = useCallback(async () => {
    if (!sessionId || !session) {
      setError('No session selected. Go to Settings to create one.');
      return;
    }

    setIsScanning(true);
    scanningRef.current = true;
    setError(null);

    // Get current slot as starting point for the scan
    let slot = currentSlot;
    if (slot === 0) {
      // Use a slot from the start date
      const startSlotNum = await getStartSlot();
      if (startSlotNum === 0) {
        setIsScanning(false);
        scanningRef.current = false;
        return;
      }
      // Go back ~3 days of slots (assuming ~2 slots/sec)
      slot = startSlotNum - 500000;
      setStartSlot(slot);
    }

    setLogs(prev => [...prev, { slot, type: 'info', message: `Starting scan from slot ${slot.toLocaleString()}`, timestamp: new Date().toISOString() }]);

    // Scan loop
    while (scanningRef.current) {
      try {
        const { data, error: fnErr } = await supabase.functions.invoke('scan-blocks', {
          body: {
            session_id: sessionId,
            helius_rpc_url: session.helius_rpc_url,
            start_slot: slot,
            batch_size: batchSize,
            min_profit_threshold: session.min_profit_threshold || 0.05,
          },
        });

        if (fnErr) {
          setLogs(prev => [...prev, { slot, type: 'error', message: `Edge function error: ${fnErr.message}`, timestamp: new Date().toISOString() }]);
          setError(`Scan error: ${fnErr.message}`);
          break;
        }

        if (data?.error) {
          setLogs(prev => [...prev, { slot, type: 'error', message: data.error, timestamp: new Date().toISOString() }]);
          setError(data.error);
          break;
        }

        // Add logs
        if (data?.logs) {
          setLogs(prev => [...prev, ...data.logs.map((l: any) => ({ ...l, timestamp: new Date().toISOString() }))]);
        }

        // Add new signals
        if (data?.signals_found > 0) {
          const { data: newSigs } = await supabase.from('signals').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }).limit(100);
          setSignals(newSigs || []);
        }

        slot = data?.next_slot || slot + batchSize;
        setCurrentSlot(slot);

        // Brief pause to avoid hammering
        await new Promise(r => setTimeout(r, 500));
      } catch (e: any) {
        setLogs(prev => [...prev, { slot, type: 'error', message: e.message, timestamp: new Date().toISOString() }]);
        setError(e.message);
        break;
      }
    }

    setIsScanning(false);
    scanningRef.current = false;
  }, [sessionId, session, currentSlot, batchSize]);

  const stopScan = () => {
    scanningRef.current = false;
    setIsScanning(false);
    setLogs(prev => [...prev, { slot: currentSlot, type: 'info', message: 'Scan stopped by user', timestamp: new Date().toISOString() }]);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-surface-2 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Radio className={`w-4 h-4 ${isScanning ? 'text-terminal-green animate-pulse' : 'text-muted-foreground'}`} />
          <span className="text-sm font-bold text-foreground">Live Scanner</span>
          {isScanning && <span className="text-[10px] text-terminal-green animate-pulse">● SCANNING</span>}
          <span className="text-[10px] text-muted-foreground">Slot: {currentSlot.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground">Batch:</label>
          <select value={batchSize} onChange={e => setBatchSize(parseInt(e.target.value))}
            className="px-1.5 py-0.5 bg-input border border-border rounded text-[10px] text-foreground">
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
          {!isScanning ? (
            <button onClick={startScan}
              className="flex items-center gap-1 px-3 py-1 text-[10px] text-terminal-green border border-terminal-green/30 rounded hover:bg-terminal-green/10 transition-colors">
              <Activity className="w-3 h-3" /> Start Scan
            </button>
          ) : (
            <button onClick={stopScan}
              className="flex items-center gap-1 px-3 py-1 text-[10px] text-terminal-red border border-terminal-red/30 rounded hover:bg-terminal-red/10 transition-colors">
              <Square className="w-3 h-3" /> Stop
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-2 flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-[10px] text-destructive">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Log Panel */}
        <div className="w-80 shrink-0 border-r border-border flex flex-col">
          <div className="px-3 py-1.5 bg-surface-2 border-b border-border text-[10px] font-bold uppercase tracking-widest text-terminal-cyan">
            Scan Log — {logs.length} entries
          </div>
          <div className="flex-1 overflow-y-auto terminal-scrollbar p-2 text-[10px] font-mono space-y-0.5">
            {logs.map((log, i) => (
              <div key={i} className={`${
                log.type === 'error' ? 'text-terminal-red' :
                log.type === 'signal' ? 'text-terminal-green' :
                log.type === 'whitelist-remove' ? 'text-terminal-amber' :
                'text-muted-foreground'
              }`}>
                <span className="text-muted-foreground/50">[{log.slot}]</span> {log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
            {logs.length === 0 && <div className="text-muted-foreground py-4 text-center">Start scanning to see logs</div>}
          </div>
        </div>

        {/* Signals Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-1.5 bg-surface-2 border-b border-border flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-terminal-cyan">Live Signals — All 21 KPIs</span>
            <span className="text-[10px] text-muted-foreground">{signals.length} found</span>
          </div>
          <div className="flex-1 overflow-auto terminal-scrollbar">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-surface-2 text-muted-foreground uppercase tracking-wider">
                  <th className="px-2 py-1 text-left">Slot</th>
                  <th className="px-2 py-1 text-left">Pair</th>
                  <th className="px-2 py-1 text-left">Route</th>
                  <th className="px-2 py-1 text-right">Net $</th>
                  <th className="px-2 py-1 text-right">Gross $</th>
                  <th className="px-2 py-1 text-right">Slip%</th>
                  <th className="px-2 py-1 text-right">PFee</th>
                  <th className="px-2 py-1 text-center">Jito</th>
                  <th className="px-2 py-1 text-left">MFi</th>
                  <th className="px-2 py-1 text-right">Comp</th>
                  <th className="px-2 py-1 text-right">Alpha</th>
                  <th className="px-2 py-1 text-center">SVM</th>
                  <th className="px-2 py-1 text-right">TVL</th>
                  <th className="px-2 py-1 text-right">Lat(ms)</th>
                  <th className="px-2 py-1 text-right">Real</th>
                  <th className="px-2 py-1 text-right">Gap(ms)</th>
                  <th className="px-2 py-1 text-center">Verified</th>
                  <th className="px-2 py-1 text-center">Details</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s, i) => (
                  <tr key={s.id} className={`border-b border-border/50 hover:bg-surface-3/50 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-surface-1' : 'bg-surface-2/30'}`}>
                    <td className="px-2 py-1">{s.slot?.toLocaleString()}</td>
                    <td className="px-2 py-1 font-semibold">{s.token_pair}</td>
                    <td className="px-2 py-1">{s.dex_route}</td>
                    <td className={`px-2 py-1 text-right font-semibold ${(s.net_profit || 0) > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>${s.net_profit?.toFixed(4)}</td>
                    <td className="px-2 py-1 text-right">${s.gross_profit?.toFixed(4)}</td>
                    <td className="px-2 py-1 text-right">{s.realized_slippage_pct?.toFixed(2)}%</td>
                    <td className="px-2 py-1 text-right">{s.priority_fee_99th}</td>
                    <td className={`px-2 py-1 text-center ${s.jito_tip_detected ? 'text-terminal-amber' : 'text-muted-foreground'}`}>{s.jito_tip_detected ? '✓' : '✗'}</td>
                    <td className={`px-2 py-1 ${s.margin_fi_liquidity_status === 'Available' ? 'text-terminal-green' : 'text-terminal-red'}`}>{s.margin_fi_liquidity_status}</td>
                    <td className="px-2 py-1 text-right">{s.competitor_overlap_count}</td>
                    <td className={`px-2 py-1 text-right ${(s.alpha_score || 0) >= 80 ? 'text-terminal-green' : (s.alpha_score || 0) >= 60 ? 'text-terminal-amber' : 'text-terminal-red'}`}>{s.alpha_score}</td>
                    <td className={`px-2 py-1 text-center ${s.atomic_success_lite_svm ? 'text-terminal-green' : 'text-terminal-red'}`}>{s.atomic_success_lite_svm ? '✓' : '✗'}</td>
                    <td className="px-2 py-1 text-right">${((s.total_tvl_usd || 0) / 1000).toFixed(0)}K</td>
                    <td className="px-2 py-1 text-right">{s.latency_buffer_ms}</td>
                    <td className="px-2 py-1 text-right">{s.realism_factor}</td>
                    <td className="px-2 py-1 text-right">{s.gap_duration_ms}ms</td>
                    <td className={`px-2 py-1 text-center ${s.verified ? 'text-terminal-green' : 'text-muted-foreground'}`}>{s.verified ? '✓' : '—'}</td>
                    <td className="px-2 py-1 text-center">
                      <Link to={`/trade/${s.id}`} className="text-terminal-cyan hover:underline">→</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {signals.length === 0 && (
              <div className="text-center text-muted-foreground py-10 text-xs">
                No signals yet. Start scanning to find arbitrage opportunities.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
