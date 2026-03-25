import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Key, Calendar, Settings as SettingsIcon, AlertTriangle, Loader2, Sliders } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const [heliusUrl, setHeliusUrl] = useState('');
  const [birdeyeKey, setBirdeyeKey] = useState('');
  const [startDate, setStartDate] = useState('2024-06-15');
  const [startTime, setStartTime] = useState('00:00');
  const [minProfit, setMinProfit] = useState('0.05');
  const [maxCU, setMaxCU] = useState('1400000');
  const [maxCoins, setMaxCoins] = useState('250');
  const [maxPaths, setMaxPaths] = useState('1000');
  const [minLiquidity, setMinLiquidity] = useState('20000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const canLaunch = heliusUrl.length > 0 && birdeyeKey.length > 0 && startDate.length > 0 && !isLoading;

  const handleLaunch = async () => {
    if (!canLaunch) return;
    setIsLoading(true);
    setError(null);
    setStatus('Creating scan session...');

    try {
      const dt = new Date(`${startDate}T${startTime}:00Z`);

      // 1. Create session
      const { data: session, error: sessErr } = await supabase
        .from('scan_sessions')
        .insert({
          helius_rpc_url: heliusUrl,
          birdeye_api_key: birdeyeKey,
          start_date: dt.toISOString(),
          min_profit_threshold: parseFloat(minProfit),
          max_compute_units: parseInt(maxCU),
          status: 'building-whitelist',
        })
        .select()
        .single();

      if (sessErr || !session) {
        throw new Error(sessErr?.message || 'Failed to create session');
      }

      setStatus('Building whitelist (validating APIs & fetching tokens)...');

      // 2. Call build-whitelist edge function
      const { data: wlResult, error: wlErr } = await supabase.functions.invoke('build-whitelist', {
        body: {
          session_id: session.id,
          birdeye_api_key: birdeyeKey,
          helius_rpc_url: heliusUrl,
        },
      });

      if (wlErr) {
        throw new Error(`Whitelist build failed: ${wlErr.message}`);
      }

      if (wlResult?.error) {
        throw new Error(wlResult.error);
      }

      setStatus(`Whitelist built: ${wlResult.tokens_found} tokens, ${wlResult.whitelist_entries} paths`);

      // Navigate to scanner with session ID
      setTimeout(() => {
        navigate(`/scanner?session=${session.id}`);
      }, 1500);
    } catch (e: any) {
      setError(e.message);
      setIsLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto terminal-scrollbar p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-6 h-6 text-terminal-cyan" />
          <h1 className="text-xl font-bold text-foreground">
            <span className="text-terminal-green glow-text-green">STREAM</span>
            <span className="text-muted-foreground">-TEST</span>
            <span className="text-terminal-cyan text-xs ml-2">v7.0</span>
          </h1>
        </div>

        {/* API Credentials */}
        <div className="bg-surface-1 border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-terminal-cyan uppercase tracking-widest">
            <Key className="w-3.5 h-3.5" /> API Credentials
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Helius RPC URL</label>
            <input
              type="text"
              value={heliusUrl}
              onChange={e => setHeliusUrl(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
              placeholder="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">BirdEye API Key</label>
            <input
              type="text"
              value={birdeyeKey}
              onChange={e => setBirdeyeKey(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
              placeholder="Your BirdEye API key"
            />
          </div>
        </div>

        {/* Temporal Settings */}
        <div className="bg-surface-1 border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-terminal-cyan uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5" /> Backtest Period
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Start Time (UTC)</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
        </div>

        {/* Risk & Engine Parameters */}
        <div className="bg-surface-1 border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-terminal-cyan uppercase tracking-widest">
            <Sliders className="w-3.5 h-3.5" /> Engine Parameters
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Min Profit ($)</label>
              <input type="number" step="0.01" value={minProfit} onChange={e => setMinProfit(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Compute Units</label>
              <input type="number" value={maxCU} onChange={e => setMaxCU(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Coins (Whitelist)</label>
              <input type="number" value={maxCoins} onChange={e => setMaxCoins(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Paths</label>
              <input type="number" value={maxPaths} onChange={e => setMaxPaths(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Min Liquidity ($)</label>
              <input type="number" value={minLiquidity} onChange={e => setMinLiquidity(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Status */}
        {status && (
          <div className="p-3 bg-surface-2 border border-border rounded text-xs text-terminal-cyan">
            {status}
          </div>
        )}

        {/* Launch */}
        <button
          onClick={handleLaunch}
          disabled={!canLaunch}
          className="w-full py-3 bg-primary text-primary-foreground font-bold text-sm rounded hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Building Whitelist & Validating APIs...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Build Whitelist & Start Scan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
