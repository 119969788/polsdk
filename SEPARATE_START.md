# 分开启动两个功能

现在支持将跟单功能和15分钟套利功能分开启动，可以独立运行和管理。

## 📋 功能说明

### 1. 跟单功能 (Copy Trading)
- 监控指定钱包的交易活动
- 自动复制目标钱包的交易
- 独立的进程和日志

### 2. 15分钟套利功能 (Dip Arbitrage)
- 专注于15分钟加密市场套利
- 自动检测和执行套利机会
- 独立的进程和日志

## 🚀 启动方式

### 方式一：使用 npm 脚本（开发模式）

```bash
# 启动跟单功能
npm run dev:copy

# 启动15分钟套利功能
npm run dev:arb

# 或者同时启动两个（需要两个终端）
npm run dev:copy  # 终端1
npm run dev:arb   # 终端2
```

### 方式二：使用编译后的代码（生产模式）

```bash
# 先编译
npm run build

# 启动跟单功能
npm run start:copy

# 启动15分钟套利功能
npm run start:arb
```

### 方式三：使用 PM2（推荐生产环境）

#### 分别启动

```bash
# 启动跟单功能
pm2 start ecosystem.config.copy.json

# 启动15分钟套利功能
pm2 start ecosystem.config.arb.json
```

#### 或者直接启动（无需配置文件）

```bash
# 启动跟单功能
pm2 start dist/copy-trading.js --name polsdk-copy-trading --log ./logs/copy-trading-out.log --error ./logs/copy-trading-err.log --time

# 启动15分钟套利功能
pm2 start dist/dip-arb.js --name polsdk-dip-arb --log ./logs/dip-arb-out.log --error ./logs/dip-arb-err.log --time
```

## 📊 管理命令

### PM2 管理

```bash
# 查看所有进程
pm2 status

# 查看跟单功能
pm2 show polsdk-copy-trading
pm2 logs polsdk-copy-trading

# 查看套利功能
pm2 show polsdk-dip-arb
pm2 logs polsdk-dip-arb

# 停止跟单功能
pm2 stop polsdk-copy-trading

# 停止套利功能
pm2 stop polsdk-dip-arb

# 重启跟单功能
pm2 restart polsdk-copy-trading

# 重启套利功能
pm2 restart polsdk-dip-arb

# 停止所有
pm2 stop all

# 删除所有
pm2 delete all
```

## ⚙️ 配置说明

### 跟单功能配置（.env）

```env
# 必需
PRIVATE_KEY=0x您的私钥

# 跟单配置（必需）
FOLLOW_WALLETS=0x钱包1,0x钱包2
FOLLOW_MIN_AMOUNT=100
FOLLOW_MAX_AMOUNT=1000
FOLLOW_RATIO=0.1

# 套利功能可以禁用（如果只运行跟单）
DIP_ARB_ENABLED=false
```

### 15分钟套利功能配置（.env）

```env
# 必需
PRIVATE_KEY=0x您的私钥

# 套利配置（必需）
DIP_ARB_ENABLED=true
DIP_ARB_UNDERLYINGS=ETH,BTC
DIP_ARB_MIN_PROFIT=0.02
DIP_ARB_MAX_POSITION=500

# 跟单钱包可以为空（如果只运行套利）
FOLLOW_WALLETS=
```

## 📁 日志文件

分开启动后，日志文件也是分开的：

```
logs/
├── copy-trading-out.log  # 跟单功能标准输出
├── copy-trading-err.log  # 跟单功能错误日志
├── dip-arb-out.log       # 套利功能标准输出
└── dip-arb-err.log       # 套利功能错误日志
```

## 🔄 完整启动流程

### 场景1：只运行跟单功能

```bash
# 1. 编译项目
npm run build

# 2. 配置 .env（确保 FOLLOW_WALLETS 已配置）

# 3. 使用 PM2 启动
pm2 start ecosystem.config.copy.json

# 4. 查看日志
pm2 logs polsdk-copy-trading
```

### 场景2：只运行15分钟套利功能

```bash
# 1. 编译项目
npm run build

# 2. 配置 .env（确保 DIP_ARB_ENABLED=true）

# 3. 使用 PM2 启动
pm2 start ecosystem.config.arb.json

# 4. 查看日志
pm2 logs polsdk-dip-arb
```

### 场景3：同时运行两个功能

```bash
# 1. 编译项目
npm run build

# 2. 配置 .env（两个功能都配置好）

# 3. 分别启动
pm2 start ecosystem.config.copy.json
pm2 start ecosystem.config.arb.json

# 4. 查看所有进程
pm2 status

# 5. 分别查看日志
pm2 logs polsdk-copy-trading
pm2 logs polsdk-dip-arb

# 或者查看所有日志
pm2 logs
```

## 💡 优势

1. **独立管理**: 可以单独启动、停止、重启某个功能
2. **独立日志**: 每个功能有独立的日志文件，便于排查问题
3. **资源隔离**: 每个功能独立运行，互不影响
4. **灵活配置**: 可以只运行需要的功能，节省资源

## ⚠️ 注意事项

1. **配置检查**: 
   - 运行跟单功能时，确保 `FOLLOW_WALLETS` 已配置
   - 运行套利功能时，确保 `DIP_ARB_ENABLED=true`

2. **资源占用**: 
   - 同时运行两个功能会占用更多资源
   - 根据服务器配置合理选择

3. **日志管理**: 
   - 定期清理日志文件
   - 可以使用 PM2 的日志轮转功能

## 📚 相关文档

- [README.md](README.md) - 完整使用说明
- [PM2_USAGE.md](PM2_USAGE.md) - PM2 使用指南
- [QUICK_PM2_START.md](QUICK_PM2_START.md) - 快速启动指南
