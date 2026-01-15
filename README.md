# Polymarket 跟单和15分钟市场策略套利程序

这是一个完整的 Polymarket 交易机器人，集成了智能跟单功能和15分钟加密市场套利策略。

## 功能特性

### 🎯 智能跟单功能
- 实时监控指定钱包的交易活动
- 自动复制目标钱包的交易决策
- 可配置跟单比例和金额限制
- 支持同时监控多个钱包
- 实时统计和日志记录

### 💰 15分钟市场套利策略
- 专注于15分钟加密市场（ETH、BTC等）
- 自动检测套利机会
- 自动执行买卖操作
- 自动轮换市场以寻找最佳机会
- 自动结算和赎回仓位
- 完整的风险控制

## 安装

### 1. 克隆或下载项目

```bash
git clone <your-repo-url>
cd polsdk
```

### 2. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 必需: 您的私钥
PRIVATE_KEY=0x你的私钥

# 跟单配置
FOLLOW_WALLETS=0x钱包1,0x钱包2,0x钱包3
FOLLOW_MIN_AMOUNT=100              # 最小跟单金额 (USD)
FOLLOW_MAX_AMOUNT=1000             # 最大跟单金额 (USD)
FOLLOW_RATIO=0.1                   # 跟单比例 (0.1 = 10%)

# 15分钟套利配置
DIP_ARB_ENABLED=true               # 是否启用套利
DIP_ARB_UNDERLYINGS=ETH,BTC        # 标的资产
DIP_ARB_MIN_PROFIT=0.02            # 最小利润率 (2%)
DIP_ARB_MAX_POSITION=500           # 最大持仓金额 (USD)

# 日志级别
LOG_LEVEL=info                     # debug, info, warn, error
```

## 使用方法

### 开发模式运行

```bash
npm run dev
```

### 生产模式运行

```bash
# 1. 编译 TypeScript
npm run build

# 2. 运行编译后的程序
npm start
```

## 配置说明

### 跟单配置

- `FOLLOW_WALLETS`: 要跟单的钱包地址，多个地址用逗号分隔
- `FOLLOW_MIN_AMOUNT`: 最小跟单金额（USD），低于此金额的交易不会跟单
- `FOLLOW_MAX_AMOUNT`: 最大跟单金额（USD），超过此金额的交易会按比例缩小
- `FOLLOW_RATIO`: 跟单比例（0-1之间），例如 0.1 表示跟单原交易的10%

### 15分钟套利配置

- `DIP_ARB_ENABLED`: 是否启用15分钟套利功能
- `DIP_ARB_UNDERLYINGS`: 要监控的标的资产，如 ETH、BTC，多个用逗号分隔
- `DIP_ARB_MIN_PROFIT`: 最小利润率，例如 0.02 表示至少2%的利润才执行
- `DIP_ARB_MAX_POSITION`: 单次最大持仓金额（USD）

## 程序功能详解

### 跟单工作流程

1. **监控阶段**: 程序实时监控配置的钱包地址
2. **信号检测**: 当目标钱包执行交易时，触发跟单信号
3. **风险评估**: 检查交易金额是否在配置范围内
4. **执行跟单**: 按照配置的比例自动执行相同交易
5. **结果记录**: 记录所有跟单交易的执行结果

### 15分钟套利工作流程

1. **市场监控**: 实时监控15分钟加密市场的价格变化
2. **信号识别**: 检测 Leg1/Leg2 套利信号
3. **机会评估**: 计算预期利润率，过滤低收益机会
4. **自动执行**: 在检测到机会时自动执行买卖操作
5. **仓位管理**: 自动轮换市场，结算和赎回已结束的仓位

## 日志说明

程序会输出详细的日志信息：

- `📋 跟单交易执行`: 跟单交易被执行时
- `📊 跟单统计`: 定期输出跟单统计信息
- `🎯 套利监控已启动`: 套利服务启动时
- `📊 套利信号 detected`: 检测到套利机会时
- `✅ 套利交易执行成功`: 套利交易成功时
- `🏁 交易轮次完成`: 完成一轮套利交易时

## 安全提示

⚠️ **重要安全提示**:

1. **私钥安全**: 永远不要将私钥提交到版本控制系统
2. **测试环境**: 建议先在测试环境或小额资金上测试
3. **风险控制**: 合理设置最大持仓和跟单金额
4. **定期检查**: 定期检查程序运行状态和资金安全
5. **监控告警**: 建议设置监控告警系统

## 故障排除

### 常见问题

1. **程序无法启动**
   - 检查 `.env` 文件是否正确配置
   - 确认 `PRIVATE_KEY` 格式正确（以 0x 开头）
   - 检查网络连接

2. **跟单功能不工作**
   - 确认 `FOLLOW_WALLETS` 配置了有效的钱包地址
   - 检查目标钱包是否有交易活动
   - 查看日志中的错误信息

3. **套利功能不执行**
   - 确认 `DIP_ARB_ENABLED=true`
   - 检查市场是否有套利机会
   - 调整 `DIP_ARB_MIN_PROFIT` 降低门槛

## 项目结构

```
polsdk/
├── src/
│   ├── index.ts      # 主程序入口
│   ├── config.ts     # 配置加载
│   └── logger.ts     # 日志工具
├── dist/             # 编译输出（自动生成）
├── package.json      # 项目配置
├── tsconfig.json     # TypeScript 配置
├── .env              # 环境变量（需要创建）
└── README.md         # 说明文档
```

## 依赖说明

- `@catalyst-team/poly-sdk`: Polymarket SDK，提供交易和市场数据接口
- `dotenv`: 环境变量管理
- `typescript`: TypeScript 编译器
- `tsx`: TypeScript 执行工具

## 许可证

MIT

## 免责声明

本程序仅供学习和研究使用。使用本程序进行实际交易存在风险，请自行承担所有责任。作者不对任何损失负责。

## 支持

如有问题或建议，请提交 Issue 或 Pull Request。
