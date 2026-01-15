# 快速开始指南

## 5分钟快速启动

### 步骤 1: 安装依赖

```bash
npm install
```

### 步骤 2: 配置环境变量

```bash
# Windows
copy env.example.txt .env

# Linux/Mac
cp env.example.txt .env
```

然后编辑 `.env` 文件，至少需要设置：

```env
PRIVATE_KEY=0x你的私钥
FOLLOW_WALLETS=0x要跟单的钱包地址
DIP_ARB_ENABLED=true
```

### 步骤 3: 运行程序

**开发模式（推荐首次使用）**:
```bash
npm run dev
```

**生产模式**:
```bash
npm run build
npm start
```

## 配置示例

### 基础跟单配置

只启用跟单功能：

```env
PRIVATE_KEY=0x...
FOLLOW_WALLETS=0xabc...,0xdef...
FOLLOW_MIN_AMOUNT=50
FOLLOW_MAX_AMOUNT=500
FOLLOW_RATIO=0.2
DIP_ARB_ENABLED=false
```

### 基础套利配置

只启用15分钟套利：

```env
PRIVATE_KEY=0x...
FOLLOW_WALLETS=
DIP_ARB_ENABLED=true
DIP_ARB_UNDERLYINGS=ETH
DIP_ARB_MIN_PROFIT=0.015
DIP_ARB_MAX_POSITION=300
```

### 完整配置

同时启用跟单和套利：

```env
PRIVATE_KEY=0x...

# 跟单
FOLLOW_WALLETS=0x钱包1,0x钱包2
FOLLOW_MIN_AMOUNT=100
FOLLOW_MAX_AMOUNT=1000
FOLLOW_RATIO=0.1

# 套利
DIP_ARB_ENABLED=true
DIP_ARB_UNDERLYINGS=ETH,BTC
DIP_ARB_MIN_PROFIT=0.02
DIP_ARB_MAX_POSITION=500
```

## 如何找到要跟单的钱包地址

1. 在 Polymarket 上找到表现优秀的交易者
2. 查看他们的交易历史
3. 复制他们的钱包地址
4. 添加到 `FOLLOW_WALLETS` 配置中

## 监控和调试

### 查看实时日志

程序运行时会输出详细日志：

- `📋` - 跟单交易
- `📊` - 统计信息
- `🎯` - 套利信号
- `✅` - 成功操作
- `❌` - 错误信息

### 调整日志级别

在 `.env` 中设置：

```env
LOG_LEVEL=debug  # 详细日志
LOG_LEVEL=info   # 一般日志（推荐）
LOG_LEVEL=warn   # 仅警告和错误
LOG_LEVEL=error  # 仅错误
```

## 常见问题

**Q: 程序启动后没有任何输出？**

A: 检查以下几点：
- `.env` 文件是否存在且配置正确
- `PRIVATE_KEY` 格式是否正确（以 0x 开头）
- 网络连接是否正常
- 查看日志级别设置

**Q: 跟单功能不工作？**

A: 
- 确认 `FOLLOW_WALLETS` 配置了有效的钱包地址
- 检查目标钱包最近是否有交易活动
- 调整 `FOLLOW_MIN_AMOUNT` 和 `FOLLOW_MAX_AMOUNT`

**Q: 套利功能没有执行交易？**

A:
- 确认 `DIP_ARB_ENABLED=true`
- 降低 `DIP_ARB_MIN_PROFIT` 值（例如改为 0.01）
- 检查市场是否有足够的流动性

## 安全建议

1. **测试环境**: 首次使用建议设置较小的金额限制
2. **私钥安全**: 永远不要分享或提交私钥
3. **资金管理**: 设置合理的最大持仓限制
4. **定期检查**: 定期查看程序运行状态

## 下一步

- 查看 [README.md](README.md) 了解完整功能
- 根据实际使用调整配置参数
- 设置监控和告警系统
