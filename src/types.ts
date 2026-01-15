/**
 * 交易机器人类型定义
 */

export interface BotStatus {
  isRunning: boolean;
  copyTrading: {
    activeWallets: number;
    stats: Map<string, CopyTradingStats>;
  };
  dipArb: {
    enabled: boolean;
    stats: DipArbStats | null;
  };
}

export interface CopyTradingStats {
  monitoringTime: number;
  tradesDetected: number;
  tradesExecuted: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfit?: number;
}

export interface DipArbStats {
  signalsDetected: number;
  leg1Filled: number;
  leg2Filled: number;
  roundsCompleted: number;
  totalProfit?: number;
}

export interface TradeEvent {
  wallet: string;
  market: string;
  side: 'Buy' | 'Sell';
  amount: number;
  outcome: string;
  price: number;
  timestamp: Date;
}

export interface ArbitrageEvent {
  type: 'Leg1' | 'Leg2';
  marketSlug: string;
  profitRate: number;
  leg1Price?: number;
  leg2Price?: number;
  timestamp: Date;
}
