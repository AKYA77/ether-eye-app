import { LogEntry, SignalKPI, SystemMetrics } from '@/types/solana';

const MINTS = [
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'So11111111111111111111111111111111111111112',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
];

const PAIRS = ['SOL/USDC', 'SOL/USDT', 'BONK/SOL', 'JUP/SOL', 'mSOL/SOL', 'RAY/SOL', 'PYTH/SOL', 'WIF/SOL'];
const DEXES = ['Raydium → Orca', 'Orca → Raydium', 'Raydium → Meteora', 'Meteora → Orca', 'Orca → Meteora'];
const REASONS_REJECT = ['TVL < $20,000', 'Age < 6 months', 'No active pools', 'Blacklisted program'];
const REASONS_ACCEPT = ['TVL $45K, Age 14mo', 'TVL $120K, Age 28mo', 'TVL $67K, Age 9mo'];

let logId = 0;
let sigId = 0;

export function generateLogEntry(): LogEntry {
  const isWhitelisted = Math.random() > 0.6;
  return {
    id: `log-${++logId}`,
    timestamp: new Date().toISOString(),
    mint: MINTS[Math.floor(Math.random() * MINTS.length)],
    decision: isWhitelisted ? 'whitelisted' : 'rejected',
    reason: isWhitelisted
      ? REASONS_ACCEPT[Math.floor(Math.random() * REASONS_ACCEPT.length)]
      : REASONS_REJECT[Math.floor(Math.random() * REASONS_REJECT.length)],
  };
}

export function generateSignal(slot: number): SignalKPI {
  const netProfit = parseFloat((Math.random() * 2 + 0.05).toFixed(4));
  return {
    id: `sig-${++sigId}`,
    slot,
    timestamp: new Date().toISOString(),
    tokenPair: PAIRS[Math.floor(Math.random() * PAIRS.length)],
    dexRoute: DEXES[Math.floor(Math.random() * DEXES.length)],
    optimalInput: (Math.random() * 100 + 1).toFixed(6),
    grossProfit: parseFloat((netProfit + Math.random() * 0.5).toFixed(4)),
    netProfit,
    realizedSlippagePct: parseFloat((Math.random() * 0.5).toFixed(4)),
    priorityFee99th: Math.floor(Math.random() * 50000 + 1000),
    jitoTipDetected: Math.random() > 0.7,
    marginFiLiquidityStatus: Math.random() > 0.2 ? 'Available' : 'Depleted',
    competitorOverlapCount: Math.floor(Math.random() * 5),
    winnerSignature: Array.from({ length: 44 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[Math.floor(Math.random() * 58)]).join(''),
    latencyBufferMs: Math.floor(Math.random() * 400 + 50),
    realismFactor: Math.floor(Math.random() * 40 + 60),
    historicalAgePoolAMonths: Math.floor(Math.random() * 30 + 6),
    historicalAgePoolBMonths: Math.floor(Math.random() * 30 + 6),
    totalTvlUsd: Math.floor(Math.random() * 500000 + 20000),
    instructionIndex: Math.floor(Math.random() * 10),
    atomicSuccessLiteSVM: Math.random() > 0.15,
    alphaScore: Math.floor(Math.random() * 60 + 40),
  };
}

export function generateMetrics(currentBlock: number, totalBlocks: number): SystemMetrics {
  return {
    rpcLatencyMs: Math.floor(Math.random() * 150 + 30),
    cpuLoadPct: parseFloat((Math.random() * 40 + 10).toFixed(1)),
    ramUsageMb: Math.floor(Math.random() * 200 + 100),
    totalSignals: sigId,
    netProfitSum: parseFloat((Math.random() * 50 + 5).toFixed(2)),
    successRatePct: parseFloat((Math.random() * 30 + 65).toFixed(1)),
    activePoolsTracked: Math.min(Math.floor(Math.random() * 200 + 50), 1000),
    uniqueMintsTracked: Math.min(Math.floor(Math.random() * 50 + 10), 250),
    currentBlock,
    totalBlocks,
  };
}
