import { useState, useRef, useEffect } from 'react';
import { useEngine } from '@/hooks/useEngine';
import { MetricsHeader } from '@/components/MetricsHeader';
import { ConfigOverlay } from '@/components/ConfigOverlay';
import { LiveLog } from '@/components/LiveLog';
import { SignalMatrix } from '@/components/SignalMatrix';
import { Square } from 'lucide-react';

export default function Index() {
  const { status, wsStatus, logs, signals, metrics, error, progress, launch, stop, setStatus } = useEngine();
  const [showConfig, setShowConfig] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);
  const [mainHeight, setMainHeight] = useState(600);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setMainHeight(e.contentRect.height);
    });
    if (mainRef.current) obs.observe(mainRef.current);
    return () => obs.disconnect();
  }, []);

  const handleLaunch = async (config: any) => {
    await launch(config);
    setShowConfig(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {showConfig && (
        <ConfigOverlay
          onLaunch={handleLaunch}
          error={error}
          isLoading={status === 'finding-block'}
        />
      )}

      <MetricsHeader metrics={metrics} status={status} wsStatus={wsStatus} progress={progress} />

      {!showConfig && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-surface-2 border-b border-border">
          <span className="text-[10px] text-muted-foreground">
            Engine {status === 'running' ? 'streaming' : status}
            {wsStatus === 'connected' && ' • WebSocket connected'}
          </span>
          <div className="flex items-center gap-2">
            {status === 'running' && (
              <button
                onClick={stop}
                className="flex items-center gap-1 px-2 py-1 text-[10px] text-terminal-red border border-terminal-red/30 rounded hover:bg-terminal-red/10 transition-colors"
              >
                <Square className="w-3 h-3" /> Stop
              </button>
            )}
            <button
              onClick={() => { stop(); setShowConfig(true); setStatus('configuring'); }}
              className="px-2 py-1 text-[10px] text-muted-foreground border border-border rounded hover:bg-surface-3 transition-colors"
            >
              Reconfigure
            </button>
          </div>
        </div>
      )}

      <div ref={mainRef} className="flex flex-1 overflow-hidden">
        <div className="w-80 shrink-0 border-r border-border">
          <LiveLog logs={logs} />
        </div>
        <div className="flex-1 overflow-hidden">
          <SignalMatrix signals={signals} containerHeight={mainHeight} />
        </div>
      </div>
    </div>
  );
}
