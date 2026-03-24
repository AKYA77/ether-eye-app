import { memo, useRef, useEffect } from 'react';
import { LogEntry } from '@/types/solana';
import { Terminal } from 'lucide-react';

interface Props {
  logs: LogEntry[];
}

function LogRow({ log }: { log: LogEntry }) {
  const time = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const shortMint = `${log.mint.slice(0, 4)}...${log.mint.slice(-4)}`;

  return (
    <div className="flex items-start gap-2 px-3 py-1 text-[11px] leading-relaxed hover:bg-surface-3/50 transition-colors">
      <span className="text-muted-foreground shrink-0">{time}</span>
      <span className="text-muted-foreground">│</span>
      <a
        href={`https://dexscreener.com/solana/${log.mint}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-terminal-cyan hover:underline shrink-0 font-medium"
      >
        {shortMint}
      </a>
      <span className="text-muted-foreground">│</span>
      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
        log.decision === 'whitelisted'
          ? 'bg-terminal-green/15 text-terminal-green'
          : 'bg-terminal-red/15 text-terminal-red'
      }`}>
        {log.decision === 'whitelisted' ? '✓ PASS' : '✗ REJECT'}
      </span>
      <span className="text-muted-foreground truncate">{log.reason}</span>
    </div>
  );
}

export const LiveLog = memo(function LiveLog({ logs }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full bg-surface-1 border-r border-border">
      <div className="px-3 py-2 border-b border-border bg-surface-2 flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5 text-terminal-green" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-terminal-green">Discovery Terminal</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{logs.length} entries</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto terminal-scrollbar">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            Awaiting discovery stream...
          </div>
        ) : (
          logs.map(log => <LogRow key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
});
