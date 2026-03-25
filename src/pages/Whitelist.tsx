import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Coins, RefreshCw, ExternalLink, ShieldCheck, ShieldX } from 'lucide-react';

export default function Whitelist() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'removed'>('all');
  const [dexFilter, setDexFilter] = useState<string>('all');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState(sessionId || '');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    loadWhitelist();
  }, [selectedSession, filter, dexFilter]);

  const loadSessions = async () => {
    const { data } = await supabase.from('scan_sessions').select('id, created_at, status').order('created_at', { ascending: false });
    setSessions(data || []);
    if (!selectedSession && data && data.length > 0) {
      setSelectedSession(data[0].id);
    }
  };

  const loadWhitelist = async () => {
    setLoading(true);
    let query = supabase.from('whitelist').select('*').order('liquidity_usd', { ascending: false });

    if (selectedSession) query = query.eq('session_id', selectedSession);
    if (filter === 'active') query = query.eq('status', 'active');
    if (filter === 'removed') query = query.eq('status', 'removed');
    if (dexFilter !== 'all') query = query.eq('dex', dexFilter);

    const { data } = await query.limit(1000);
    setEntries(data || []);
    setLoading(false);
  };

  const activeCount = entries.filter(e => e.status === 'active').length;
  const removedCount = entries.filter(e => e.status === 'removed').length;
  const uniqueMints = new Set(entries.filter(e => e.status === 'active').map(e => e.mint_address)).size;
  const dexes = [...new Set(entries.map(e => e.dex))];

  return (
    <div className="flex-1 overflow-y-auto terminal-scrollbar p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Coins className="w-6 h-6 text-terminal-cyan" />
          <h1 className="text-lg font-bold text-foreground">Coin / Pool Whitelist</h1>
        </div>
        <button onClick={loadWhitelist} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:bg-surface-2 transition-colors text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-surface-1 border border-border rounded-lg p-3">
          <span className="text-[10px] text-muted-foreground uppercase">Unique Mints</span>
          <div className="text-lg font-bold text-terminal-cyan">{uniqueMints}/250</div>
        </div>
        <div className="bg-surface-1 border border-border rounded-lg p-3">
          <span className="text-[10px] text-muted-foreground uppercase">Active Paths</span>
          <div className="text-lg font-bold text-terminal-green">{activeCount}/1000</div>
        </div>
        <div className="bg-surface-1 border border-border rounded-lg p-3">
          <span className="text-[10px] text-muted-foreground uppercase">Removed</span>
          <div className="text-lg font-bold text-terminal-red">{removedCount}</div>
        </div>
        <div className="bg-surface-1 border border-border rounded-lg p-3">
          <span className="text-[10px] text-muted-foreground uppercase">DEXs</span>
          <div className="text-lg font-bold text-terminal-amber">{dexes.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)}
          className="px-2 py-1 bg-input border border-border rounded text-xs text-foreground">
          <option value="">All Sessions</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>Session {s.id.slice(0, 8)} — {new Date(s.created_at).toLocaleDateString()}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {(['all', 'active', 'removed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded border transition-colors ${filter === f ? 'border-terminal-cyan text-terminal-cyan bg-terminal-cyan/10' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
              {f}
            </button>
          ))}
        </div>
        <select value={dexFilter} onChange={e => setDexFilter(e.target.value)}
          className="px-2 py-1 bg-input border border-border rounded text-xs text-foreground">
          <option value="all">All DEXs</option>
          {dexes.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-1 border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/50 text-muted-foreground uppercase tracking-wider">
                <th className="px-2 py-1.5 text-left">#</th>
                <th className="px-2 py-1.5 text-left">Status</th>
                <th className="px-2 py-1.5 text-left">Symbol</th>
                <th className="px-2 py-1.5 text-left">Mint Address</th>
                <th className="px-2 py-1.5 text-left">DEX</th>
                <th className="px-2 py-1.5 text-right">Liquidity ($)</th>
                <th className="px-2 py-1.5 text-right">Pool Age (mo)</th>
                <th className="px-2 py-1.5 text-left">Removed Reason</th>
                <th className="px-2 py-1.5 text-center">Explorer</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">No whitelist entries. Run a scan from Settings first.</td></tr>
              ) : entries.map((e, i) => (
                <tr key={e.id} className={`border-b border-border/50 hover:bg-surface-3/50 transition-colors ${i % 2 === 0 ? 'bg-surface-1' : 'bg-surface-2/30'}`}>
                  <td className="px-2 py-1.5 text-muted-foreground">{i + 1}</td>
                  <td className="px-2 py-1.5">
                    {e.status === 'active'
                      ? <span className="flex items-center gap-1 text-terminal-green"><ShieldCheck className="w-3 h-3" />Active</span>
                      : <span className="flex items-center gap-1 text-terminal-red"><ShieldX className="w-3 h-3" />Removed</span>}
                  </td>
                  <td className="px-2 py-1.5 font-semibold">{e.token_symbol || '?'}</td>
                  <td className="px-2 py-1.5 font-mono text-muted-foreground">{e.mint_address?.slice(0, 8)}...{e.mint_address?.slice(-4)}</td>
                  <td className="px-2 py-1.5">{e.dex}</td>
                  <td className={`px-2 py-1.5 text-right ${(e.liquidity_usd || 0) < 20000 ? 'text-terminal-red' : 'text-terminal-green'}`}>
                    ${(e.liquidity_usd || 0).toLocaleString()}
                  </td>
                  <td className="px-2 py-1.5 text-right">{e.pool_age_months || '—'}</td>
                  <td className="px-2 py-1.5 text-terminal-red">{e.removed_reason || '—'}</td>
                  <td className="px-2 py-1.5 text-center">
                    <a href={`https://solscan.io/token/${e.mint_address}`} target="_blank" rel="noopener noreferrer"
                      className="text-terminal-cyan hover:underline inline-flex items-center gap-0.5">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
