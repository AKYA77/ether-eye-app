import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, DollarSign, Target, Activity, Download, ExternalLink } from 'lucide-react';

interface SessionStats {
  totalSignals: number;
  profitableSignals: number;
  totalNetProfit: number;
  totalGrossProfit: number;
  avgAlphaScore: number;
  avgSlippage: number;
  successRate: number;
  avgGapDuration: number;
  jitoCount: number;
  verifiedCount: number;
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [signals, setSignals] = useState<any[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    setLoading(true);

    // Load sessions
    const { data: sessData } = await supabase.from('scan_sessions').select('*').order('created_at', { ascending: false });
    setSessions(sessData || []);

    // Load signals
    let query = supabase.from('signals').select('*').order('created_at', { ascending: false });
    if (sessionId) query = query.eq('session_id', sessionId);

    const { data: sigData } = await query.limit(500);
    const sigs = sigData || [];
    setSignals(sigs);

    // Calculate stats
    if (sigs.length > 0) {
      const profitable = sigs.filter(s => (s.net_profit || 0) > 0);
      setStats({
        totalSignals: sigs.length,
        profitableSignals: profitable.length,
        totalNetProfit: sigs.reduce((sum, s) => sum + (s.net_profit || 0), 0),
        totalGrossProfit: sigs.reduce((sum, s) => sum + (s.gross_profit || 0), 0),
        avgAlphaScore: sigs.reduce((sum, s) => sum + (s.alpha_score || 0), 0) / sigs.length,
        avgSlippage: sigs.reduce((sum, s) => sum + (s.realized_slippage_pct || 0), 0) / sigs.length,
        successRate: (profitable.length / sigs.length) * 100,
        avgGapDuration: sigs.reduce((sum, s) => sum + (s.gap_duration_ms || 0), 0) / sigs.length,
        jitoCount: sigs.filter(s => s.jito_tip_detected).length,
        verifiedCount: sigs.filter(s => s.verified).length,
      });
    }

    setLoading(false);
  };

  const exportCSV = () => {
    if (signals.length === 0) return;
    const headers = [
      'ID', 'Slot', 'Block Time', 'Token Pair', 'DEX Route', 'Optimal Input',
      'Gross Profit', 'Net Profit', 'Slippage %', 'Priority Fee', 'Jito Tip',
      'MarginFi Status', 'Competitors', 'Winner Signature', 'Latency (ms)',
      'Realism Factor', 'Pool A Age (mo)', 'Pool B Age (mo)', 'TVL ($)',
      'Instruction Index', 'LiteSVM Success', 'Alpha Score', 'Gap Duration (ms)',
      'TX Signature A', 'TX Signature B', 'Spread %', 'Explorer URL', 'Verified'
    ];
    const rows = signals.map(s => [
      s.id, s.slot, s.block_time, s.token_pair, s.dex_route, s.optimal_input,
      s.gross_profit, s.net_profit, s.realized_slippage_pct, s.priority_fee_99th,
      s.jito_tip_detected, s.margin_fi_liquidity_status, s.competitor_overlap_count,
      s.winner_signature, s.latency_buffer_ms, s.realism_factor,
      s.historical_age_pool_a_months, s.historical_age_pool_b_months, s.total_tvl_usd,
      s.instruction_index, s.atomic_success_lite_svm, s.alpha_score, s.gap_duration_ms,
      s.tx_signature_a, s.tx_signature_b, s.spread_pct, s.explorer_url, s.verified
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signals_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto terminal-scrollbar p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-terminal-cyan" />
          <h1 className="text-lg font-bold text-foreground">Results & KPIs</h1>
          {sessionId && <span className="text-[10px] text-muted-foreground bg-surface-2 px-2 py-1 rounded">Session: {sessionId.slice(0, 8)}...</span>}
        </div>
        <button onClick={exportCSV} disabled={signals.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:bg-surface-2 transition-colors disabled:opacity-30 text-muted-foreground">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-20">Loading...</div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total Signals" value={stats.totalSignals.toString()} icon={Activity} color="text-terminal-cyan" />
              <StatCard label="Net Profit" value={`$${stats.totalNetProfit.toFixed(4)}`} icon={DollarSign} color={stats.totalNetProfit > 0 ? 'text-terminal-green' : 'text-terminal-red'} />
              <StatCard label="Success Rate" value={`${stats.successRate.toFixed(1)}%`} icon={Target} color="text-terminal-green" />
              <StatCard label="Avg Alpha" value={stats.avgAlphaScore.toFixed(0)} icon={TrendingUp} color="text-terminal-amber" />
              <StatCard label="Profitable" value={stats.profitableSignals.toString()} icon={TrendingUp} color="text-terminal-green" />
              <StatCard label="Avg Gap Duration" value={`${stats.avgGapDuration.toFixed(0)}ms`} icon={Activity} color="text-terminal-cyan" />
              <StatCard label="Jito Detected" value={stats.jitoCount.toString()} icon={Activity} color="text-terminal-amber" />
              <StatCard label="Verified on-chain" value={stats.verifiedCount.toString()} icon={Target} color="text-terminal-green" />
            </div>
          )}

          {/* Signals Table */}
          <div className="bg-surface-1 border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-surface-2 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-terminal-cyan">All Signals — 21+ KPIs</span>
              <span className="text-[10px] text-muted-foreground">{signals.length} results</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/50 text-muted-foreground uppercase tracking-wider">
                    <th className="px-2 py-1.5 text-left">#</th>
                    <th className="px-2 py-1.5 text-left">Slot</th>
                    <th className="px-2 py-1.5 text-left">Time</th>
                    <th className="px-2 py-1.5 text-left">Pair</th>
                    <th className="px-2 py-1.5 text-left">Route</th>
                    <th className="px-2 py-1.5 text-right">Net $</th>
                    <th className="px-2 py-1.5 text-right">Gross $</th>
                    <th className="px-2 py-1.5 text-right">Slip%</th>
                    <th className="px-2 py-1.5 text-right">Alpha</th>
                    <th className="px-2 py-1.5 text-center">Jito</th>
                    <th className="px-2 py-1.5 text-center">SVM</th>
                    <th className="px-2 py-1.5 text-right">Gap(ms)</th>
                    <th className="px-2 py-1.5 text-right">TVL</th>
                    <th className="px-2 py-1.5 text-center">Verified</th>
                    <th className="px-2 py-1.5 text-center">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((s, i) => (
                    <tr key={s.id} className={`border-b border-border/50 hover:bg-surface-3/50 transition-colors ${i % 2 === 0 ? 'bg-surface-1' : 'bg-surface-2/30'}`}>
                      <td className="px-2 py-1.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-2 py-1.5">{s.slot?.toLocaleString()}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{s.block_time ? new Date(s.block_time).toLocaleTimeString() : '—'}</td>
                      <td className="px-2 py-1.5 font-semibold">{s.token_pair}</td>
                      <td className="px-2 py-1.5">{s.dex_route}</td>
                      <td className={`px-2 py-1.5 text-right font-semibold ${(s.net_profit || 0) > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>${s.net_profit?.toFixed(4)}</td>
                      <td className="px-2 py-1.5 text-right">${s.gross_profit?.toFixed(4)}</td>
                      <td className="px-2 py-1.5 text-right">{s.realized_slippage_pct?.toFixed(2)}%</td>
                      <td className={`px-2 py-1.5 text-right ${(s.alpha_score || 0) >= 80 ? 'text-terminal-green' : (s.alpha_score || 0) >= 60 ? 'text-terminal-amber' : 'text-terminal-red'}`}>{s.alpha_score}</td>
                      <td className={`px-2 py-1.5 text-center ${s.jito_tip_detected ? 'text-terminal-amber' : 'text-muted-foreground'}`}>{s.jito_tip_detected ? '✓' : '✗'}</td>
                      <td className={`px-2 py-1.5 text-center ${s.atomic_success_lite_svm ? 'text-terminal-green' : 'text-terminal-red'}`}>{s.atomic_success_lite_svm ? '✓' : '✗'}</td>
                      <td className="px-2 py-1.5 text-right">{s.gap_duration_ms}ms</td>
                      <td className="px-2 py-1.5 text-right">${((s.total_tvl_usd || 0) / 1000).toFixed(0)}K</td>
                      <td className={`px-2 py-1.5 text-center ${s.verified ? 'text-terminal-green' : 'text-muted-foreground'}`}>{s.verified ? '✓' : '—'}</td>
                      <td className="px-2 py-1.5 text-center">
                        <Link to={`/trade/${s.id}`} className="text-terminal-cyan hover:underline">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {signals.length === 0 && (
              <div className="text-center text-muted-foreground py-10 text-xs">
                No signals found. Run a scan from Settings to generate results.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="bg-surface-1 border border-border rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}
