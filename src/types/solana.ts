export interface AppConfig {
  heliusRpcUrl: string;
  birdeyeApiKey: string;
  startDate: Date;
  minProfitThreshold: number;
  maxComputeUnits: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  mint: string;
  decision: 'whitelisted' | 'rejected';
  reason: string;
}

export interface SignalKPI {
  id: string;
  slot: number;
  timestamp: string;
  tokenPair: string;
  dexRoute: string;
  optimalInput: string;
  grossProfit: number;
  netProfit: number;
  realizedSlippagePct: number;
  priorityFee99th: number;
  jitoTipDetected: boolean;
  marginFiLiquidityStatus: string;
  competitorOverlapCount: number;
  winnerSignature: string;
  latencyBufferMs: number;
  realismFactor: number;
  historicalAgePoolAMonths: number;
  historicalAgePoolBMonths: number;
  totalTvlUsd: number;
  instructionIndex: number;
  atomicSuccessLiteSVM: boolean;
  alphaScore: number;
}

export interface SystemMetrics {
  rpcLatencyMs: number;
  cpuLoadPct: number;
  ramUsageMb: number;
  totalSignals: number;
  netProfitSum: number;
  successRatePct: number;
  activePoolsTracked: number;
  uniqueMintsTracked: number;
  currentBlock: number;
  totalBlocks: number;
}

export type EngineStatus = 'idle' | 'configuring' | 'finding-block' | 'running' | 'completed' | 'error';
