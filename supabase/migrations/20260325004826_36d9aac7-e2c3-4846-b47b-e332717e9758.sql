
-- Create scan_sessions table
CREATE TABLE public.scan_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'idle',
  helius_rpc_url text NOT NULL,
  birdeye_api_key text NOT NULL,
  start_date timestamptz NOT NULL,
  min_profit_threshold numeric DEFAULT 0.05,
  max_compute_units integer DEFAULT 1400000,
  total_blocks integer DEFAULT 432000,
  current_block integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.scan_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scan_sessions" ON public.scan_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scan_sessions" ON public.scan_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update scan_sessions" ON public.scan_sessions FOR UPDATE USING (true);

-- Create whitelist table
CREATE TABLE public.whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.scan_sessions(id) ON DELETE CASCADE,
  mint_address text NOT NULL,
  token_symbol text,
  token_name text,
  liquidity_usd numeric NOT NULL DEFAULT 0,
  dex text NOT NULL,
  pool_address text,
  pool_age_months integer DEFAULT 0,
  status text DEFAULT 'active',
  removed_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read whitelist" ON public.whitelist FOR SELECT USING (true);
CREATE POLICY "Anyone can insert whitelist" ON public.whitelist FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update whitelist" ON public.whitelist FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete whitelist" ON public.whitelist FOR DELETE USING (true);

-- Create signals table (trades found)
CREATE TABLE public.signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.scan_sessions(id) ON DELETE CASCADE,
  slot bigint NOT NULL,
  block_time timestamptz,
  token_pair text NOT NULL,
  dex_route text NOT NULL,
  optimal_input text,
  gross_profit numeric DEFAULT 0,
  net_profit numeric DEFAULT 0,
  realized_slippage_pct numeric DEFAULT 0,
  priority_fee_99th integer DEFAULT 0,
  jito_tip_detected boolean DEFAULT false,
  margin_fi_liquidity_status text DEFAULT 'Unknown',
  competitor_overlap_count integer DEFAULT 0,
  winner_signature text,
  latency_buffer_ms integer DEFAULT 0,
  realism_factor integer DEFAULT 0,
  historical_age_pool_a_months integer DEFAULT 0,
  historical_age_pool_b_months integer DEFAULT 0,
  total_tvl_usd numeric DEFAULT 0,
  instruction_index integer DEFAULT 0,
  atomic_success_lite_svm boolean DEFAULT false,
  alpha_score integer DEFAULT 0,
  gap_duration_ms integer DEFAULT 0,
  tx_signature_a text,
  tx_signature_b text,
  price_dex_a numeric,
  price_dex_b numeric,
  spread_pct numeric,
  explorer_url text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read signals" ON public.signals FOR SELECT USING (true);
CREATE POLICY "Anyone can insert signals" ON public.signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update signals" ON public.signals FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_scan_sessions_updated_at BEFORE UPDATE ON public.scan_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whitelist_updated_at BEFORE UPDATE ON public.whitelist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_whitelist_session ON public.whitelist(session_id);
CREATE INDEX idx_whitelist_status ON public.whitelist(status);
CREATE INDEX idx_whitelist_liquidity ON public.whitelist(liquidity_usd);
CREATE INDEX idx_signals_session ON public.signals(session_id);
CREATE INDEX idx_signals_slot ON public.signals(slot);
CREATE INDEX idx_signals_net_profit ON public.signals(net_profit);
