import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, Clock, DollarSign, Activity, Shield } from 'lucide-react';

export default function TradeDetail() {
  const { id } = useParams<{ id: string }>();
  const [signal, setSignal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadSignal();
  }, [id]);

  const loadSignal = async () => {
    const { data } = await supabase.from('signals').select('*').eq('id', id!).single();
    setSignal(data);
    setLoading(false);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!signal) return <div className="flex-1 flex items-center justify-center text-muted-foreground">Signal not found</div>;

  const kpis = [
    { label: 'Slot', value: signal.slot?.toLocaleString(), color: 'text-foreground' },
    { label: 'Block Time', value: signal.block_time ? new Date(signal.block_time).toLocaleString() : '—', color: 'text-foreground' },
    { label: 'Token Pair', value: signal.token_pair, color: 'text-terminal-cyan' },
    { label: 'DEX Route', value: signal.dex_route, color: 'text-foreground' },
    { label: 'Optimal Input', value: signal.optimal_input, color: 'text-foreground' },
    { label: 'Gross Profit', value: `$${signal.gross_profit?.toFixed(6)}`, color: (signal.gross_profit || 0) > 0 ? 'text-terminal-green' : 'text-terminal-red' },
    { label: 'Net Profit', value: `$${signal.net_profit?.toFixed(6)}`, color: (signal.net_profit || 0) > 0 ? 'text-terminal-green' : 'text-terminal-red' },
    { label: 'Realized Slippage', value: `${signal.realized_slippage_pct?.toFixed(4)}%`, color: 'text-foreground' },
    { label: 'Priority Fee (99th)', value: `${signal.priority_fee_99th} lamports`, color: 'text-foreground' },
    { label: 'Jito Tip Detected', value: signal.jito_tip_detected ? 'Yes' : 'No', color: signal.jito_tip_detected ? 'text-terminal-amber' : 'text-muted-foreground' },
    { label: 'MarginFi Liquidity', value: signal.margin_fi_liquidity_status, color: signal.margin_fi_liquidity_status === 'Available' ? 'text-terminal-green' : 'text-terminal-red' },
    { label: 'Competitor Overlap', value: signal.competitor_overlap_count?.toString(), color: 'text-foreground' },
    { label: 'Latency Buffer', value: `${signal.latency_buffer_ms}ms`, color: 'text-foreground' },
    { label: 'Realism Factor', value: `${signal.realism_factor}/100`, color: 'text-foreground' },
    { label: 'Pool A Age', value: `${signal.historical_age_pool_a_months} months`, color: 'text-foreground' },
    { label: 'Pool B Age', value: `${signal.historical_age_pool_b_months} months`, color: 'text-foreground' },
    { label: 'Total TVL', value: `$${(signal.total_tvl_usd || 0).toLocaleString()}`, color: 'text-foreground' },
    { label: 'Instruction Index', value: signal.instruction_index?.toString(), color: 'text-foreground' },
    { label: 'LiteSVM Atomic Success', value: signal.atomic_success_lite_svm ? 'Yes' : 'No', color: signal.atomic_success_lite_svm ? 'text-terminal-green' : 'text-terminal-red' },
    { label: 'Alpha Score', value: `${signal.alpha_score}/100`, color: (signal.alpha_score || 0) >= 80 ? 'text-terminal-green' : (signal.alpha_score || 0) >= 60 ? 'text-terminal-amber' : 'text-terminal-red' },
    { label: 'Gap Duration', value: `${signal.gap_duration_ms}ms`, color: 'text-terminal-cyan' },
    { label: 'Spread', value: signal.spread_pct ? `${signal.spread_pct}%` : '—', color: 'text-foreground' },
    { label: 'Price DEX A', value: signal.price_dex_a ? `$${signal.price_dex_a}` : '—', color: 'text-foreground' },
    { label: 'Price DEX B', value: signal.price_dex_b ? `$${signal.price_dex_b}` : '—', color: 'text-foreground' },
  ];

  return (
    <div className="flex-1 overflow-y-auto terminal-scrollbar p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="p-1 hover:bg-surface-2 rounded transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground">Trade Detail</h1>
          <span className="text-[10px] text-muted-foreground bg-surface-2 px-2 py-1 rounded font-mono">{id?.slice(0, 12)}...</span>
          {signal.verified && (
            <span className="flex items-center gap-1 text-[10px] text-terminal-green bg-terminal-green/10 border border-terminal-green/30 px-2 py-0.5 rounded">
              <CheckCircle className="w-3 h-3" /> Verified On-Chain
            </span>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-surface-1 border border-border rounded-lg p-5 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Token Pair</span>
              <div className="text-xl font-bold text-terminal-cyan">{signal.token_pair}</div>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Net Profit</span>
              <div className={`text-xl font-bold ${(signal.net_profit || 0) > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                ${signal.net_profit?.toFixed(6)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Alpha Score</span>
              <div className={`text-xl font-bold ${(signal.alpha_score || 0) >= 80 ? 'text-terminal-green' : 'text-terminal-amber'}`}>
                {signal.alpha_score}/100
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Gap Duration</span>
              <div className="text-xl font-bold text-terminal-cyan">{signal.gap_duration_ms}ms</div>
            </div>
          </div>
        </div>

        {/* On-Chain Proof */}
        <div className="bg-surface-1 border border-border rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-terminal-green" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">On-Chain Proof</h2>
          </div>
          <div className="space-y-3">
            <ProofRow label="Winner Signature" value={signal.winner_signature} explorerType="tx" />
            <ProofRow label="TX Signature A (DEX A)" value={signal.tx_signature_a} explorerType="tx" />
            <ProofRow label="TX Signature B (DEX B)" value={signal.tx_signature_b} explorerType="tx" />
            <div className="pt-2 border-t border-border">
              <span className="text-[10px] text-muted-foreground uppercase">Explorer Links</span>
              <div className="flex gap-2 mt-1">
                {signal.winner_signature && (
                  <>
                    <a href={`https://solscan.io/tx/${signal.winner_signature}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-terminal-cyan hover:underline px-2 py-1 bg-surface-2 rounded">
                      <ExternalLink className="w-3 h-3" /> Solscan
                    </a>
                    <a href={`https://explorer.solana.com/tx/${signal.winner_signature}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-terminal-cyan hover:underline px-2 py-1 bg-surface-2 rounded">
                      <ExternalLink className="w-3 h-3" /> Solana Explorer
                    </a>
                    <a href={`https://solana.fm/tx/${signal.winner_signature}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-terminal-cyan hover:underline px-2 py-1 bg-surface-2 rounded">
                      <ExternalLink className="w-3 h-3" /> Solana FM
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* All 21+ KPIs */}
        <div className="bg-surface-1 border border-border rounded-lg p-5">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">All KPIs ({kpis.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-surface-2 rounded p-2.5 border border-border/50">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                <div className={`text-sm font-semibold mt-0.5 ${kpi.color}`}>{kpi.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProofRow({ label, value, explorerType }: { label: string; value: string | null; explorerType: 'tx' | 'account' }) {
  if (!value) return (
    <div>
      <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
        <XCircle className="w-3 h-3" /> Not available
      </div>
    </div>
  );

  return (
    <div>
      <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
      <div className="flex items-center gap-2 mt-0.5">
        <code className="text-[10px] text-foreground font-mono bg-surface-2 px-2 py-1 rounded break-all">{value}</code>
        <a href={`https://solscan.io/${explorerType}/${value}`} target="_blank" rel="noopener noreferrer"
          className="shrink-0 text-terminal-cyan hover:text-terminal-green transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
