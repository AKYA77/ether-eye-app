import { memo } from 'react';
import { SystemMetrics, EngineStatus, WsStatus } from '@/types/solana';
import { Activity, Cpu, HardDrive, Signal, DollarSign, Target, Database, Coins, Wifi, WifiOff } from 'lucide-react';

interface Props {
  metrics: SystemMetrics | null;
  status: EngineStatus;
  wsStatus: WsStatus;
  progress: number;
}

function MetricBadge({ icon: Icon, label, value, color = 'text-foreground' }: {
  icon: typeof Activity; label: string; value: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 rounded border border-border">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</span>
      <span className={`text-xs font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function WsBadge({ wsStatus }: { wsStatus: WsStatus }) {
  const config = {
    disconnected: { icon: WifiOff, color: 'text-muted-foreground', label: 'OFF', bg: '' },
    connecting: { icon: Wifi, color: 'text-terminal-amber', label: 'CONNECTING', bg: 'animate-pulse' },
    connected: { icon: Wifi, color: 'text-terminal-green', label: 'LIVE', bg: '' },
    reconnecting: { icon: Wifi, color: 'text-terminal-amber', label: 'RECONNECTING', bg: 'animate-pulse' },
    error: { icon: WifiOff, color: 'text-terminal-red', label: 'ERROR', bg: '' },
  }[wsStatus];

  if (wsStatus === 'disconnected') return null;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 rounded border border-border ${config.bg}`}>
      <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
      <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>{config.label}</span>
    </div>
  );
}

export const MetricsHeader = memo(function MetricsHeader({ metrics, status, wsStatus, progress }: Props) {
  const statusColor = {
    idle: 'text-muted-foreground',
    configuring: 'text-terminal-amber',
    'finding-block': 'text-terminal-cyan',
    running: 'text-terminal-green',
    completed: 'text-terminal-green',
    error: 'text-terminal-red',
  }[status];

  return (
    <header className="border-b border-border bg-surface-1 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-terminal-green animate-pulse-glow' : status === 'error' ? 'bg-terminal-red' : 'bg-muted-foreground'}`} />
            <span className="text-sm font-bold tracking-tight">
              <span className="text-terminal-green glow-text-green">STREAM</span>
              <span className="text-muted-foreground">-TEST</span>
              <span className="text-terminal-cyan text-[10px] ml-1">v6.0</span>
            </span>
          </div>
          <span className={`text-[10px] uppercase tracking-widest font-semibold ${statusColor}`}>
            [{status}]
          </span>
          <WsBadge wsStatus={wsStatus} />
        </div>

        {metrics && (
          <div className="flex items-center gap-2 flex-wrap">
            <MetricBadge icon={Activity} label="RPC" value={`${metrics.rpcLatencyMs}ms`} color={metrics.rpcLatencyMs > 100 ? 'text-terminal-amber' : 'text-terminal-green'} />
            <MetricBadge icon={Cpu} label="CPU" value={`${metrics.cpuLoadPct}%`} color={metrics.cpuLoadPct > 70 ? 'text-terminal-red' : 'text-terminal-green'} />
            <MetricBadge icon={HardDrive} label="RAM" value={`${metrics.ramUsageMb}MB`} />
            <MetricBadge icon={Signal} label="Signals" value={`${metrics.totalSignals}`} color="text-terminal-cyan" />
            <MetricBadge icon={DollarSign} label="Profit" value={`$${metrics.netProfitSum}`} color="text-terminal-green" />
            <MetricBadge icon={Target} label="Win%" value={`${metrics.successRatePct}%`} />
            <MetricBadge icon={Database} label="Pools" value={`${metrics.activePoolsTracked}/1000`} />
            <MetricBadge icon={Coins} label="Mints" value={`${metrics.uniqueMintsTracked}/250`} />
          </div>
        )}
      </div>

      {(status === 'running' || status === 'finding-block') && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Processing Block {metrics?.currentBlock?.toLocaleString() ?? 0} of {(432000).toLocaleString()}</span>
            <span>{(progress * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-terminal-green rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%`, boxShadow: '0 0 8px hsl(160 100% 45% / 0.5)' }}
            />
          </div>
        </div>
      )}
    </header>
  );
});
