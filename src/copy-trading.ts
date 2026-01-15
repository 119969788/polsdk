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
      logger.info('正在初始化 SDK...');
      this.sdk = new PolySDK({
        privateKey: config.privateKey,
      });
      logger.info('SDK 对象创建成功');
      logger.debug('SDK 对象结构:', {
        hasSmartMoney: !!this.sdk.smartMoney,
        sdkKeys: Object.keys(this.sdk || {})
      });
    } catch (error: any) {
      logger.error('SDK 初始化失败:', {
        message: error?.message || String(error),
        stack: error?.stack,
        error: error
      });
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

    // 检查 SDK 是否正确初始化
    if (!this.sdk) {
      logger.error('SDK 未初始化');
      throw new Error('SDK 未初始化');
    }

    // 检查 smartMoney 服务是否存在
    if (!this.sdk.smartMoney) {
      logger.error('SDK smartMoney 服务不存在，可能 SDK 版本不兼容');
      logger.info('尝试的 SDK 结构:', Object.keys(this.sdk));
      throw new Error('SDK smartMoney 服务不存在');
    }

    // 尝试初始化 SDK（如果支持）
    if (typeof this.sdk.initialize === 'function') {
      try {
        await this.sdk.initialize();
        logger.info('SDK 初始化完成');
      } catch (error) {
        logger.warn('SDK 初始化失败，继续尝试:', error);
      }
    }

    for (const wallet of this.config.followTrading.wallets) {
      try {
        logger.info(`开始跟单钱包: ${wallet}`);

        // 调试：输出 SDK 结构
        logger.debug('SDK smartMoney 对象:', {
          exists: !!this.sdk.smartMoney,
          methods: this.sdk.smartMoney ? Object.keys(this.sdk.smartMoney) : 'N/A'
        });

        // 检查 autoCopyTrading 方法是否存在
        if (typeof this.sdk.smartMoney.autoCopyTrading !== 'function') {
          const availableMethods = this.sdk.smartMoney ? Object.keys(this.sdk.smartMoney) : [];
          logger.error('autoCopyTrading 方法不存在');
          logger.info('可用的 smartMoney 方法:', availableMethods);
          
          // 尝试查找类似的方法名
          const possibleMethods = ['startAutoCopyTrading', 'copyTrading', 'autoCopy', 'followWallet'];
          const foundMethod = possibleMethods.find(m => typeof this.sdk.smartMoney[m] === 'function');
          
          if (foundMethod) {
            logger.info(`找到类似方法: ${foundMethod}，尝试使用它`);
            // 使用找到的方法
            const subscription = this.sdk.smartMoney[foundMethod]({
              targetAddresses: [wallet],
              walletAddress: wallet,
              minAmount: this.config.followTrading.minAmount,
              minTradeSize: this.config.followTrading.minAmount,
              maxAmount: this.config.followTrading.maxAmount,
              maxSizePerTrade: this.config.followTrading.maxAmount,
              copyRatio: this.config.followTrading.ratio,
              sizeScale: this.config.followTrading.ratio,
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
            
            if (subscription) {
              this.copyTradingSubscriptions.set(wallet, subscription);
              logger.info(`✅ 钱包 ${wallet} 跟单已启动（使用 ${foundMethod} 方法）`);
              continue;
            }
          }
          
          throw new Error(`autoCopyTrading 方法不存在。可用方法: ${availableMethods.join(', ')}`);
        }

        // 尝试调用跟单 API
        logger.debug('调用 autoCopyTrading，参数:', {
          walletAddress: wallet,
          minAmount: this.config.followTrading.minAmount,
          maxAmount: this.config.followTrading.maxAmount,
          ratio: this.config.followTrading.ratio
        });
        
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

        if (!subscription) {
          throw new Error('订阅返回为空');
        }

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
      } catch (error: any) {
        // 详细错误信息输出
        const errorInfo: any = {
          message: error?.message || String(error),
          name: error?.name || 'Unknown',
          code: error?.code,
        };
        
        if (error?.stack) {
          errorInfo.stack = error?.stack;
        }
        
        // 尝试序列化整个错误对象
        try {
          errorInfo.fullError = JSON.stringify(error, Object.getOwnPropertyNames(error));
        } catch (e) {
          errorInfo.fullError = String(error);
        }
        
        // 如果是空对象，尝试其他方式获取信息
        if (!error?.message && !error?.stack) {
          errorInfo.type = typeof error;
          errorInfo.value = String(error);
          errorInfo.keys = Object.keys(error || {});
        }
        
        logger.error(`启动跟单失败 (钱包: ${wallet}):`, errorInfo);
        
        // 尝试使用替代的 API 调用方式
        logger.info('尝试使用替代的 API 调用方式...');
        try {
          // 尝试使用 startAutoCopyTrading（如果存在）
          if (typeof this.sdk.smartMoney.startAutoCopyTrading === 'function') {
            logger.info('尝试使用 startAutoCopyTrading 方法');
            const altSubscription = this.sdk.smartMoney.startAutoCopyTrading({
              targetAddresses: [wallet],
              sizeScale: this.config.followTrading.ratio,
              maxSizePerTrade: this.config.followTrading.maxAmount,
              minTradeSize: this.config.followTrading.minAmount,
              onTrade: (trade: any, result: any) => {
                logger.info(`📋 跟单交易执行:`, {
                  wallet,
                  trade,
                  result
                });
              },
              onError: (err: any) => {
                logger.error(`跟单错误 (钱包: ${wallet}):`, err);
              },
            });
            if (altSubscription) {
              this.copyTradingSubscriptions.set(wallet, altSubscription);
              logger.info(`✅ 钱包 ${wallet} 跟单已启动（使用替代方法）`);
              continue;
            }
          }
        } catch (altError: any) {
          logger.error('替代方法也失败:', altError?.message || altError);
        }
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
