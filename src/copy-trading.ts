// 跟单功能独立启动入口
import * as PolySDKModule from '@catalyst-team/poly-sdk';
import { loadConfig, Config } from './config.js';
import { logger } from './logger.js';

const PolySDK = (PolySDKModule as any).default || 
                (PolySDKModule as any).PolySDK || 
                (PolySDKModule as any).PolymarketSDK ||
                PolySDKModule;

interface AutoCopyTradingSubscription {
  getStats(): AutoCopyTradingStats;
  stop(): void;
}

interface AutoCopyTradingStats {
  tradesDetected?: number;
  tradesExecuted?: number;
  [key: string]: any;
}

class CopyTradingBot {
  private sdk: any;
  private config: Config;
  private copyTradingSubscriptions: Map<string, AutoCopyTradingSubscription> = new Map();
  private isRunning = false;

  constructor(config: Config) {
    this.config = config;
    try {
      this.sdk = new PolySDK({
        privateKey: config.privateKey,
      });
    } catch (error) {
      logger.error('SDK 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 启动跟单功能
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('跟单程序已在运行中');
      return;
    }

    if (this.config.followTrading.wallets.length === 0) {
      logger.error('未配置跟单钱包地址，请在 .env 文件中设置 FOLLOW_WALLETS');
      process.exit(1);
    }

    this.isRunning = true;
    logger.info('🚀 跟单机器人启动中...');
    logger.info(`监控 ${this.config.followTrading.wallets.length} 个钱包`);

    for (const wallet of this.config.followTrading.wallets) {
      try {
        logger.info(`开始跟单钱包: ${wallet}`);

        const subscription = this.sdk.smartMoney.autoCopyTrading({
          walletAddress: wallet,
          minAmount: this.config.followTrading.minAmount,
          maxAmount: this.config.followTrading.maxAmount,
          copyRatio: this.config.followTrading.ratio,
          onTrade: (trade: any) => {
            logger.info(`📋 跟单交易执行:`, {
              wallet,
              market: trade?.market || trade?.marketSlug,
              side: trade?.side,
              amount: trade?.amount,
              outcome: trade?.outcome,
              price: trade?.price,
            });
          },
          onError: (error: any) => {
            logger.error(`跟单错误 (钱包: ${wallet}):`, error);
          },
        });

        this.copyTradingSubscriptions.set(wallet, subscription);

        // 定期输出统计信息
        setInterval(() => {
          try {
            const stats = subscription.getStats();
            this.logStats(wallet, stats);
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
      logger.error('⚠️  没有成功启动任何跟单订阅');
      process.exit(1);
    }

    logger.info('✅ 跟单功能已全部启动，程序运行中...');

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
  }

  /**
   * 停止跟单功能
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    logger.info('正在停止跟单功能...');

    for (const [wallet, subscription] of this.copyTradingSubscriptions) {
      try {
        subscription.stop();
        logger.info(`已停止跟单: ${wallet}`);
      } catch (error) {
        logger.error(`停止跟单失败 (${wallet}):`, error);
      }
    }
    this.copyTradingSubscriptions.clear();

    try {
      this.sdk.stop?.();
      logger.info('SDK已停止');
    } catch (error) {
      logger.error('停止SDK失败:', error);
    }

    this.isRunning = false;
    logger.info('✅ 跟单功能已停止');
  }

  /**
   * 输出统计信息
   */
  private logStats(wallet: string, stats: AutoCopyTradingStats): void {
    logger.info(`📊 跟单统计 (${wallet}):`, {
      监控时间: stats.monitoringTime ? `${stats.monitoringTime / 1000}秒` : 'N/A',
      检测到交易: stats.tradesDetected || 0,
      执行交易: stats.tradesExecuted || 0,
      成功交易: stats.successfulTrades || stats.tradesExecuted || 0,
      失败交易: stats.failedTrades || 0,
      总利润: stats.totalProfit ? `$${stats.totalProfit.toFixed(2)}` : '$0.00',
    });
  }
}

// 主程序入口
async function main() {
  try {
    logger.info('初始化跟单机器人...');
    const config = loadConfig();
    const bot = new CopyTradingBot(config);
    await bot.start();

    // 保持程序运行
    setInterval(() => {
      logger.debug('跟单程序运行中...');
    }, 300000); // 每5分钟输出一次状态
  } catch (error) {
    logger.error('程序启动失败:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('未处理的错误:', error);
  process.exit(1);
});
