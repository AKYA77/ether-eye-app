import { useState } from 'react';
import { AppConfig } from '@/types/solana';
import { Zap, Key, Calendar, Settings, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  onLaunch: (config: AppConfig) => void;
  error: string | null;
  isLoading: boolean;
}

export function ConfigOverlay({ onLaunch, error, isLoading }: Props) {
  const [heliusUrl, setHeliusUrl] = useState('https://mainnet.helius-rpc.com/?api-key=e2ec7ef1-90e4-4999-9ec3-6ea3bb43c29e');
  const [birdeyeKey, setBirdeyeKey] = useState('e49c3151c6344a6ab8f226c88477fffc');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [minProfit, setMinProfit] = useState('0.05');
  const [maxCU, setMaxCU] = useState('1400000');

  const handleLaunch = () => {
    if (!heliusUrl || !birdeyeKey || !startDate) return;
    const dt = new Date(`${startDate}T${startTime}:00Z`);
    onLaunch({
      heliusRpcUrl: heliusUrl,
      birdeyeApiKey: birdeyeKey,
      startDate: dt,
      minProfitThreshold: parseFloat(minProfit),
      maxComputeUnits: parseInt(maxCU),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="absolute inset-0 scanline opacity-30" />
      <div className="relative w-full max-w-lg mx-4 bg-surface-1 border border-border rounded-lg overflow-hidden glow-green">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-surface-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-terminal-green" />
            <h1 className="text-lg font-bold">
              <span className="text-terminal-green glow-text-green">STREAM</span>
              <span className="text-muted-foreground">-TEST</span>
              <span className="text-terminal-cyan text-xs ml-2">v6.0</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-xs mt-1">Solana Direct-Pair Arbitrage Backtester</p>
        </div>

        <div className="p-6 space-y-5">
          {/* API Credentials */}
          <fieldset className="space-y-3">
            <legend className="flex items-center gap-1.5 text-xs font-semibold text-terminal-cyan uppercase tracking-widest mb-2">
              <Key className="w-3.5 h-3.5" /> API Credentials
            </legend>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Helius RPC URL</label>
              <input
                type="text"
                value={heliusUrl}
                onChange={e => setHeliusUrl(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                placeholder="https://mainnet.helius-rpc.com/?api-key=..."
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
          </fieldset>

          {/* Temporal Settings */}
          <fieldset className="space-y-3">
            <legend className="flex items-center gap-1.5 text-xs font-semibold text-terminal-cyan uppercase tracking-widest mb-2">
              <Calendar className="w-3.5 h-3.5" /> Temporal Settings
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Start Time (UTC)</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </fieldset>

          {/* Risk Parameters */}
          <fieldset className="space-y-3">
            <legend className="flex items-center gap-1.5 text-xs font-semibold text-terminal-cyan uppercase tracking-widest mb-2">
              <Settings className="w-3.5 h-3.5" /> Risk Parameters
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Min Profit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={minProfit}
                  onChange={e => setMinProfit(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Compute Units</label>
                <input
                  type="number"
                  value={maxCU}
                  onChange={e => setMaxCU(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-input border border-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </fieldset>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-terminal-red/10 border border-terminal-red/30 rounded text-xs text-terminal-red">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Launch */}
          <button
            onClick={handleLaunch}
            disabled={isLoading || !heliusUrl || !birdeyeKey || !startDate}
            className="w-full py-3 bg-terminal-green text-primary-foreground font-bold text-sm rounded hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating & Finding Start Block...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Launch Backtest
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
