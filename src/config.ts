import 'dotenv/config';

export interface Config {
  privateKey: string;
  followTrading: {
    wallets: string[];
    minAmount: number;
    maxAmount: number;
    ratio: number;
  };
  dipArb: {
    enabled: boolean;
    underlyings: string[];
    minProfit: number;
    maxPosition: number;
    duration: string;
    settleStrategy: 'redeem';
    redeemWaitMinutes: number;
  };
  logLevel: string;
}

export function loadConfig(): Config {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY 环境变量未设置');
  }

  const followWallets = process.env.FOLLOW_WALLETS?.split(',').map(w => w.trim()).filter(Boolean) || [];
  if (followWallets.length === 0) {
    console.warn('⚠️  警告: 未配置跟单钱包地址');
  }

  return {
    privateKey,
    followTrading: {
      wallets: followWallets,
      minAmount: parseFloat(process.env.FOLLOW_MIN_AMOUNT || '100'),
      maxAmount: parseFloat(process.env.FOLLOW_MAX_AMOUNT || '1000'),
      ratio: parseFloat(process.env.FOLLOW_RATIO || '0.1'),
    },
    dipArb: {
      enabled: process.env.DIP_ARB_ENABLED === 'true',
      underlyings: process.env.DIP_ARB_UNDERLYINGS?.split(',').map(u => u.trim()).filter(Boolean) || ['ETH'],
      minProfit: parseFloat(process.env.DIP_ARB_MIN_PROFIT || '0.02'),
      maxPosition: parseFloat(process.env.DIP_ARB_MAX_POSITION || '500'),
      duration: '15m',
      settleStrategy: 'redeem',
      redeemWaitMinutes: 5,
    },
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}
