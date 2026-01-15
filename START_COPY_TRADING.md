# 启动跟单功能

## 🚀 快速启动

### 方法一：使用 PM2（推荐生产环境）

```bash
# 1. 确保项目已编译
npm run build

# 2. 创建日志目录
mkdir -p logs

# 3. 启动跟单功能
pm2 start ecosystem.config.copy.json

# 4. 查看状态
pm2 status

# 5. 查看日志
pm2 logs polsdk-copy-trading
```

### 方法二：直接启动（无需配置文件）

```bash
# 1. 确保项目已编译
npm run build

# 2. 创建日志目录
mkdir -p logs

# 3. 直接启动
pm2 start dist/copy-trading.js --name polsdk-copy-trading --log ./logs/copy-trading-out.log --error ./logs/copy-trading-err.log --time

# 4. 查看状态
pm2 status
```

### 方法三：开发模式（调试用）

```bash
# 直接运行，无需编译
npm run dev:copy
```

## ⚙️ 配置要求

启动前，确保 `.env` 文件已正确配置：

```env
# 必需：私钥
PRIVATE_KEY=0x您的私钥

# 必需：要跟单的钱包地址
FOLLOW_WALLETS=0x钱包1,0x钱包2,0x钱包3

# 可选配置
FOLLOW_MIN_AMOUNT=100      # 最小跟单金额 (USD)
FOLLOW_MAX_AMOUNT=1000     # 最大跟单金额 (USD)
FOLLOW_RATIO=0.1           # 跟单比例 (0.1 = 10%)

# 套利功能可以禁用（如果只运行跟单）
DIP_ARB_ENABLED=false
```

## 📊 管理命令

```bash
# 查看进程状态
pm2 status

# 查看详细信息和资源使用
pm2 show polsdk-copy-trading

# 查看日志（实时）
pm2 logs polsdk-copy-trading

# 查看最近100行日志
pm2 logs polsdk-copy-trading --lines 100

# 停止跟单功能
pm2 stop polsdk-copy-trading

# 重启跟单功能
pm2 restart polsdk-copy-trading

# 删除进程
pm2 delete polsdk-copy-trading

# 监控面板（查看 CPU、内存使用）
pm2 monit
```

## ✅ 验证运行

启动成功后，您应该看到类似输出：

```
[INFO] 初始化跟单机器人...
[INFO] 🚀 跟单机器人启动中...
[INFO] 监控 2 个钱包
[INFO] 开始跟单钱包: 0x...
[INFO] ✅ 钱包 0x... 跟单已启动
[INFO] ✅ 跟单功能已全部启动，程序运行中...
```

## 🔍 故障排除

### 如果启动失败

1. **检查配置**：
   ```bash
   # 检查 .env 文件是否存在
   ls -la .env
   
   # 检查配置（不显示私钥）
   cat .env | grep -v PRIVATE_KEY
   ```

2. **检查编译**：
   ```bash
   # 确保已编译
   ls -la dist/copy-trading.js
   
   # 如果没有，重新编译
   npm run build
   ```

3. **查看错误日志**：
   ```bash
   pm2 logs polsdk-copy-trading --err
   ```

### 常见问题

**问题：提示未配置跟单钱包**
- 解决：在 `.env` 文件中设置 `FOLLOW_WALLETS`

**问题：SDK 初始化失败**
- 解决：检查 `PRIVATE_KEY` 格式是否正确（必须以 0x 开头）

**问题：程序启动后立即退出**
- 解决：查看错误日志 `pm2 logs polsdk-copy-trading --err`

## 💡 提示

1. **首次启动**：建议使用开发模式先测试：`npm run dev:copy`
2. **生产环境**：使用 PM2 管理，设置开机自启
3. **监控日志**：定期查看日志了解运行状态
4. **配置调整**：修改配置后需要重启：`pm2 restart polsdk-copy-trading`

## 📚 相关文档

- [SEPARATE_START.md](SEPARATE_START.md) - 分开启动完整指南
- [PM2_USAGE.md](PM2_USAGE.md) - PM2 使用指南
- [README.md](README.md) - 完整文档
