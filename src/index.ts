import { PolySDK } from '@catalyst-team/poly-sdk';
import { loadConfig, Config } from './config.js';
import { logger } from './logger.js';
import type {
  AutoCopyTradingSubscription,
  AutoCopyTradingStats,
  DipArbServiceConfig,
  DipArbSignalEvent,
  DipArbExecutionResult,
  DipArbStats,
  DipArbRoundState,
} from '@catalyst-team/poly-sdk';

class TradingBot {
  private sdk: PolySDK;
  private config: Config;
  private copyTradingSubscriptions: Map<string, AutoCopyTradingSubscription> = new Map();
  private isRunning = false;

  constructor(config: Config) {
    this.config = config;
    this.sdk = new PolySDK({
      privateKey: config.privateKey,
    });
  }

  /**
   * 初始化并启动跟单功能
   */
  async startCopyTrading(): Promise<void> {
    if (this.config.followTrading.wallets.length === 0) {
      logger.warn('未配置跟单钱包，跳过跟单功能');
      return;
    }

    logger.info(`开始启动跟单功能，监控 ${this.config.followTrading.wallets.length} 个钱包`);

    for (const wallet of this.config.followTrading.wallets) {
      try {
        logger.info(`开始跟单钱包: ${wallet}`);

        const subscription = this.sdk.smartMoney.autoCopyTrading({
          walletAddress: wallet,
          minAmount: this.config.followTrading.minAmount,
          maxAmount: this.config.followTrading.maxAmount,
          copyRatio: this.config.followTrading.ratio,
          onTrade: (trade) => {
            logger.info(`📋 跟单交易执行:`, {
              wallet,
              market: trade.market,
              side: trade.side,
              amount: trade.amount,
              outcome: trade.outcome,
              price: trade.price,
            });
          },
          onError: (error) => {
            logger.error(`跟单错误 (钱包: ${wallet}):`, error);
          },
        });

        this.copyTradingSubscriptions.set(wallet, subscription);

      // 定期输出统计信息
      setInterval(() => {
        try {
          const stats = subscription.getStats();
          this.logCopyTradingStats(wallet, stats);
        } catch (error) {
          logger.error(`获取跟单统计失败 (${wallet}):`, error);
        }
      }, 60000); // 每分钟输出一次

        logger.info(`✅ 钱包 ${wallet} 跟单已启动`);
      } catch (error) {
        logger.error(`启动跟单失败 (钱包: ${wallet}):`, error);
      }
    }

    if (this.copyTradingSubscriptions.size === 0) {
      logger.warn('⚠️  没有成功启动任何跟单订阅');
    }
  }

  /**
   * 启动15分钟市场套利功能
   */
  async startDipArb(): Promise<void> {
    if (!this.config.dipArb.enabled) {
      logger.info('15分钟套利功能已禁用');
      return;
    }

    logger.info('开始启动15分钟市场套利功能');

    const dipArbConfig: DipArbServiceConfig = {
      underlyings: this.config.dipArb.underlyings,
      duration: this.config.dipArb.duration,
      minProfitRate: this.config.dipArb.minProfit,
      maxPositionSize: this.config.dipArb.maxPosition,
    };

    try {
      // 配置套利服务
      await this.sdk.dipArb.configure(dipArbConfig);

      // 启用自动轮换
      this.sdk.dipArb.enableAutoRotate({
        enabled: true,
        underlyings: this.config.dipArb.underlyings,
        duration: this.config.dipArb.duration,
        settleStrategy: this.config.dipArb.settleStrategy,
        redeemWaitMinutes: this.config.dipArb.redeemWaitMinutes,
      });

      // 监听事件
      this.sdk.dipArb.on('started', (config) => {
        logger.info('🎯 套利监控已启动:', {
          market: config.marketSlug,
          underlying: config.underlying,
          duration: config.duration,
        });
      });

      this.sdk.dipArb.on('stopped', () => {
        logger.info('⏹️  套利监控已停止');
      });

      this.sdk.dipArb.on('newRound', (data) => {
        logger.info('🔄 新一轮交易:', {
          roundId: data.roundId,
          upOpen: data.upOpen,
          downOpen: data.downOpen,
        });
      });

      this.sdk.dipArb.on('signal', (signal: DipArbSignalEvent) => {
        logger.info('📊 套利信号 detected:', {
          type: signal.type,
          market: signal.marketSlug,
          profitRate: signal.profitRate,
          leg1Price: signal.leg1Price,
          leg2Price: signal.leg2Price,
        });
      });

      this.sdk.dipArb.on('execution', (result: DipArbExecutionResult) => {
        if (result.success) {
          logger.info('✅ 套利交易执行成功:', {
            market: result.marketSlug,
            leg1: result.leg1,
            leg2: result.leg2,
            profit: result.profit,
            profitRate: result.profitRate,
          });
        } else {
          logger.error('❌ 套利交易执行失败:', {
            market: result.marketSlug,
            error: result.error,
          });
        }
      });

      this.sdk.dipArb.on('roundComplete', (data) => {
        logger.info('🏁 交易轮次完成:', {
          profit: data.profit,
          profitRate: data.profitRate,
        });
      });

      this.sdk.dipArb.on('rotate', (data) => {
        logger.info('🔄 切换到新市场:', {
          reason: data.reason,
          newMarket: data.newMarket,
        });
      });

      this.sdk.dipArb.on('settled', (data) => {
        if (data.success) {
          logger.info('💰 仓位结算成功:', {
            amountReceived: data.amountReceived,
          });
        } else {
          logger.error('❌ 仓位结算失败');
        }
      });

      // 启动套利服务
      await this.sdk.dipArb.start();

      // 定期输出统计信息
      setInterval(() => {
        try {
          const stats = this.sdk.dipArb.getStats();
          this.logDipArbStats(stats);
        } catch (error) {
          logger.error('获取套利统计失败:', error);
        }
      }, 60000); // 每分钟输出一次

      logger.info('✅ 15分钟套利功能已启动');
    } catch (error) {
      logger.error('启动15分钟套利失败:', error);
      // 套利失败不应该阻止程序运行（如果跟单功能正常）
      if (this.copyTradingSubscriptions.size === 0) {
        throw error;
      } else {
        logger.warn('套利功能启动失败，但程序将继续运行（仅跟单模式）');
      }
    }
  }

  /**
   * 输出跟单统计信息
   */
  private logCopyTradingStats(wallet: string, stats: AutoCopyTradingStats): void {
    logger.info(`📊 跟单统计 (${wallet}):`, {
      监控时间: `${stats.monitoringTime / 1000}秒`,
      检测到交易: stats.tradesDetected,
      执行交易: stats.tradesExecuted,
      成功交易: stats.successfulTrades,
      失败交易: stats.failedTrades,
      总利润: `$${stats.totalProfit?.toFixed(2) || '0.00'}`,
    });
  }

  /**
   * 输出套利统计信息
   */
  private logDipArbStats(stats: DipArbStats): void {
    logger.info('📊 套利统计:', {
      检测信号: stats.signalsDetected,
      Leg1成交: stats.leg1Filled,
      Leg2成交: stats.leg2Filled,
      完成轮次: stats.roundsCompleted,
      总利润: `$${stats.totalProfit?.toFixed(2) || '0.00'}`,
    });
  }

  /**
   * 启动所有功能
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('程序已在运行中');
      return;
    }

    this.isRunning = true;
    logger.info('🚀 交易机器人启动中...');

    try {
      // 启动跟单功能
      await this.startCopyTrading();

      // 启动15分钟套利功能
      await this.startDipArb();

      logger.info('✅ 所有功能已启动，程序运行中...');

      // 优雅退出处理
      process.on('SIGINT', async () => {
        logger.info('收到退出信号，正在关闭...');
        await this.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        logger.info('收到终止信号，正在关闭...');
        await this.stop();
        process.exit(0);
      });
    } catch (error) {
      logger.error('启动失败:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * 停止所有功能
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    logger.info('正在停止所有功能...');

    // 停止跟单
    for (const [wallet, subscription] of this.copyTradingSubscriptions) {
      try {
        subscription.stop();
        logger.info(`已停止跟单: ${wallet}`);
      } catch (error) {
        logger.error(`停止跟单失败 (${wallet}):`, error);
      }
    }
    this.copyTradingSubscriptions.clear();

    // 停止套利
    if (this.config.dipArb.enabled) {
      try {
        await this.sdk.dipArb.stop();
        logger.info('已停止15分钟套利');
      } catch (error) {
        logger.error('停止套利失败:', error);
      }
    }

    // 停止SDK
    try {
      this.sdk.stop();
      logger.info('SDK已停止');
    } catch (error) {
      logger.error('停止SDK失败:', error);
    }

    this.isRunning = false;
    logger.info('✅ 所有功能已停止');
  }

  /**
   * 获取运行状态
   */
  getStatus(): {
    isRunning: boolean;
    copyTrading: {
      activeWallets: number;
      stats: Map<string, AutoCopyTradingStats>;
    };
    dipArb: {
      enabled: boolean;
      stats: DipArbStats | null;
    };
  } {
    const copyTradingStats = new Map<string, AutoCopyTradingStats>();
    for (const [wallet, subscription] of this.copyTradingSubscriptions) {
      copyTradingStats.set(wallet, subscription.getStats());
    }

    return {
      isRunning: this.isRunning,
      copyTrading: {
        activeWallets: this.copyTradingSubscriptions.size,
        stats: copyTradingStats,
      },
      dipArb: {
        enabled: this.config.dipArb.enabled,
        stats: this.config.dipArb.enabled ? this.sdk.dipArb.getStats() : null,
      },
    };
  }
}

// 主程序入口
async function main() {
  try {
    logger.info('初始化交易机器人...');
    const config = loadConfig();
    const bot = new TradingBot(config);

    await bot.start();

    // 保持程序运行
    setInterval(() => {
      const status = bot.getStatus();
      logger.debug('运行状态:', status);
    }, 300000); // 每5分钟输出一次状态
  } catch (error) {
    logger.error('程序启动失败:', error);
    process.exit(1);
  }
}

// 运行主程序
main().catch((error) => {
  logger.error('未处理的错误:', error);
  process.exit(1);
});
