// 15分钟套利功能独立启动入口
import * as PolySDKModule from '@catalyst-team/poly-sdk';
import { loadConfig, Config } from './config.js';
import { logger } from './logger.js';

const PolySDK = (PolySDKModule as any).default || 
                (PolySDKModule as any).PolySDK || 
                (PolySDKModule as any).PolymarketSDK ||
                PolySDKModule;

interface DipArbServiceConfig {
  underlyings: string[];
  duration: string;
  minProfitRate: number;
  maxPositionSize: number;
}

interface DipArbSignalEvent {
  type: string;
  marketSlug: string;
  profitRate: number;
  leg1Price?: number;
  leg2Price?: number;
}

interface DipArbExecutionResult {
  success: boolean;
  marketSlug: string;
  leg1?: any;
  leg2?: any;
  profit?: number;
  profitRate?: number;
  error?: any;
}

interface DipArbStats {
  signalsDetected?: number;
  leg1Filled?: number;
  leg2Filled?: number;
  roundsCompleted?: number;
  totalProfit?: number;
}

class DipArbBot {
  private sdk: any;
  private config: Config;
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
   * 启动15分钟市场套利功能
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('套利程序已在运行中');
      return;
    }

    if (!this.config.dipArb.enabled) {
      logger.error('15分钟套利功能已禁用，请在 .env 文件中设置 DIP_ARB_ENABLED=true');
      process.exit(1);
    }

    this.isRunning = true;
    logger.info('🚀 15分钟套利机器人启动中...');
    logger.info(`标的资产: ${this.config.dipArb.underlyings.join(', ')}`);

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
      this.sdk.dipArb.on('started', (config: any) => {
        logger.info('🎯 套利监控已启动:', {
          market: config?.marketSlug || config?.market,
          underlying: config?.underlying,
          duration: config?.duration,
        });
      });

      this.sdk.dipArb.on('stopped', () => {
        logger.info('⏹️  套利监控已停止');
      });

      this.sdk.dipArb.on('newRound', (data: any) => {
        logger.info('🔄 新一轮交易:', {
          roundId: data?.roundId,
          upOpen: data?.upOpen,
          downOpen: data?.downOpen,
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

      this.sdk.dipArb.on('roundComplete', (data: any) => {
        logger.info('🏁 交易轮次完成:', {
          profit: data?.profit,
          profitRate: data?.profitRate,
        });
      });

      this.sdk.dipArb.on('rotate', (data: any) => {
        logger.info('🔄 切换到新市场:', {
          reason: data?.reason,
          newMarket: data?.newMarket,
        });
      });

      this.sdk.dipArb.on('settled', (data: any) => {
        if (data?.success) {
          logger.info('💰 仓位结算成功:', {
            amountReceived: data?.amountReceived,
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
          this.logStats(stats);
        } catch (error) {
          logger.error('获取套利统计失败:', error);
        }
      }, 60000); // 每分钟输出一次

      logger.info('✅ 15分钟套利功能已启动');

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
      logger.error('启动15分钟套利失败:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * 停止套利功能
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    logger.info('正在停止15分钟套利功能...');

    try {
      await this.sdk.dipArb.stop();
      logger.info('已停止15分钟套利');
    } catch (error) {
      logger.error('停止套利失败:', error);
    }

    try {
      this.sdk.stop?.();
      logger.info('SDK已停止');
    } catch (error) {
      logger.error('停止SDK失败:', error);
    }

    this.isRunning = false;
    logger.info('✅ 套利功能已停止');
  }

  /**
   * 输出统计信息
   */
  private logStats(stats: DipArbStats): void {
    logger.info('📊 套利统计:', {
      检测信号: stats.signalsDetected || 0,
      Leg1成交: stats.leg1Filled || 0,
      Leg2成交: stats.leg2Filled || 0,
      完成轮次: stats.roundsCompleted || 0,
      总利润: stats.totalProfit ? `$${stats.totalProfit.toFixed(2)}` : '$0.00',
    });
  }
}

// 主程序入口
async function main() {
  try {
    logger.info('初始化15分钟套利机器人...');
    const config = loadConfig();
    const bot = new DipArbBot(config);
    await bot.start();

    // 保持程序运行
    setInterval(() => {
      logger.debug('套利程序运行中...');
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
