import { memo, useCallback, useRef, useState, useEffect } from 'react';
import { SignalKPI } from '@/types/solana';
import { TableProperties, Download } from 'lucide-react';

interface Props {
  signals: SignalKPI[];
  containerHeight: number;
}

const COLUMNS: { key: keyof SignalKPI | 'index'; label: string; width: string }[] = [
  { key: 'index', label: '#', width: 'w-10' },
  { key: 'slot', label: 'Slot', width: 'w-24' },
  { key: 'tokenPair', label: 'Pair', width: 'w-24' },
  { key: 'dexRoute', label: 'DEX Route', width: 'w-36' },
  { key: 'netProfit', label: 'Net $', width: 'w-20' },
  { key: 'grossProfit', label: 'Gross $', width: 'w-20' },
  { key: 'realizedSlippagePct', label: 'Slip%', width: 'w-16' },
  { key: 'priorityFee99th', label: 'PFee', width: 'w-16' },
  { key: 'jitoTipDetected', label: 'Jito', width: 'w-12' },
  { key: 'marginFiLiquidityStatus', label: 'MFi', width: 'w-20' },
  { key: 'competitorOverlapCount', label: 'Comp', width: 'w-12' },
  { key: 'alphaScore', label: 'Alpha', width: 'w-14' },
  { key: 'atomicSuccessLiteSVM', label: 'SVM', width: 'w-12' },
  { key: 'totalTvlUsd', label: 'TVL', width: 'w-20' },
  { key: 'latencyBufferMs', label: 'Lat(ms)', width: 'w-16' },
  { key: 'realismFactor', label: 'Real', width: 'w-12' },
];

const ROW_HEIGHT = 28;

function formatCell(key: string, value: any): string {
  if (key === 'netProfit' || key === 'grossProfit') return `$${value}`;
  if (key === 'realizedSlippagePct') return `${value}%`;
  if (key === 'jitoTipDetected' || key === 'atomicSuccessLiteSVM') return value ? '✓' : '✗';
  if (key === 'totalTvlUsd') return `$${(value / 1000).toFixed(0)}K`;
  if (key === 'slot') return value.toLocaleString();
  return String(value);
}

function cellColor(key: string, value: any): string {
  if (key === 'netProfit') return value > 0 ? 'text-terminal-green' : 'text-terminal-red';
  if (key === 'atomicSuccessLiteSVM') return value ? 'text-terminal-green' : 'text-terminal-red';
  if (key === 'jitoTipDetected') return value ? 'text-terminal-amber' : 'text-muted-foreground';
  if (key === 'alphaScore') return value >= 80 ? 'text-terminal-green' : value >= 60 ? 'text-terminal-amber' : 'text-terminal-red';
  if (key === 'marginFiLiquidityStatus') return value === 'Available' ? 'text-terminal-green' : 'text-terminal-red';
  return 'text-foreground';
}

export const SignalMatrix = memo(function SignalMatrix({ signals, containerHeight }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const listHeight = Math.max(containerHeight - 80, 200);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) setScrollTop(scrollRef.current.scrollTop);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll, { passive: true });
    return () => { if (el) el.removeEventListener('scroll', handleScroll); };
  }, [handleScroll]);

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5);
  const visibleCount = Math.ceil(listHeight / ROW_HEIGHT) + 10;
  const endIndex = Math.min(signals.length, startIndex + visibleCount);
  const visibleSignals = signals.slice(startIndex, endIndex);

  const exportCSV = useCallback(() => {
    if (signals.length === 0) return;
    const headers = Object.keys(signals[0]).join(',');
    const rows = signals.map(s => Object.values(s).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signals_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [signals]);

  return (
    <div className="flex flex-col h-full bg-surface-1">
      <div className="px-3 py-2 border-b border-border bg-surface-2 flex items-center gap-2">
        <TableProperties className="w-3.5 h-3.5 text-terminal-cyan" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-terminal-cyan">Signal Matrix</span>
        <span className="text-[10px] text-muted-foreground">— 21 KPI</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{signals.length} signals</span>
        <button onClick={exportCSV} disabled={signals.length === 0} className="ml-2 p-1 text-muted-foreground hover:text-terminal-green transition-colors disabled:opacity-30" title="Export CSV">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-surface-2/50">
        {COLUMNS.map(col => (
          <div key={col.key} className={`${col.width} shrink-0 px-2 py-1.5`}>{col.label}</div>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto terminal-scrollbar" style={{ height: listHeight }}>
        {signals.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            Awaiting signal data...
          </div>
        ) : (
          <div style={{ height: signals.length * ROW_HEIGHT, position: 'relative' }}>
            {visibleSignals.map((s, i) => {
              const idx = startIndex + i;
              return (
                <div
                  key={s.id}
                  className={`flex items-center text-[10px] border-b border-border/50 ${idx % 2 === 0 ? 'bg-surface-1' : 'bg-surface-2/50'} hover:bg-surface-3/50 transition-colors`}
                  style={{ position: 'absolute', top: idx * ROW_HEIGHT, height: ROW_HEIGHT, left: 0, right: 0 }}
                >
                  {COLUMNS.map(col => (
                    <div key={col.key} className={`${col.width} shrink-0 px-2 py-1 truncate ${col.key === 'index' ? 'text-muted-foreground' : cellColor(col.key, (s as any)[col.key])}`}>
                      {col.key === 'index' ? idx + 1 : formatCell(col.key, (s as any)[col.key])}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
