# 跟单功能调试指南

## 🔍 当前问题

错误信息：`启动跟单失败`，返回空对象 `{}`

这表明 SDK 的 `autoCopyTrading` 方法调用失败，但错误信息不完整。

## 🔧 已做的改进

我已经更新了代码，添加了：
1. 更详细的错误日志
2. SDK 初始化检查
3. API 方法存在性检查
4. 替代 API 调用方式尝试

## 📋 排查步骤

### 1. 重新编译并运行

```bash
cd /opt/polsdk
npm run build
pm2 restart polsdk-copy-trading
pm2 logs polsdk-copy-trading --lines 50
```

### 2. 查看详细错误信息

现在日志应该会显示：
- SDK 是否初始化成功
- smartMoney 服务是否存在
- autoCopyTrading 方法是否存在
- 具体的错误信息

### 3. 检查 SDK 版本和 API

```bash
# 检查已安装的 SDK 版本
cd /opt/polsdk
npm list @catalyst-team/poly-sdk

# 查看 SDK 文档
# 可能需要检查实际的 API 方法名
```

### 4. 可能的解决方案

#### 方案 A：检查 API 方法名

SDK 可能使用不同的方法名：
- `autoCopyTrading` → 可能是 `startAutoCopyTrading`
- `walletAddress` → 可能是 `targetAddresses`（数组）

#### 方案 B：检查 SDK 初始化

```typescript
// 代码已经添加了初始化尝试
// 但可能需要等待初始化完成
await sdk.initialize();
await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
```

#### 方案 C：使用正确的参数格式

可能需要使用不同的参数格式：

```typescript
// 当前格式
sdk.smartMoney.autoCopyTrading({
  walletAddress: wallet,
  minAmount: ...,
  ...
})

// 可能的正确格式
sdk.smartMoney.startAutoCopyTrading({
  targetAddresses: [wallet],  // 数组格式
  minTradeSize: ...,
  sizeScale: ...,
  ...
})
```

## 🔍 手动测试 SDK

创建一个测试脚本来检查 SDK API：

```bash
cd /opt/polsdk
cat > test-sdk.js << 'EOF'
import('@catalyst-team/poly-sdk').then(async (module) => {
  const SDK = module.default || module.PolySDK || module;
  const sdk = new SDK({ privateKey: process.env.PRIVATE_KEY });
  
  console.log('SDK 对象:', Object.keys(sdk));
  console.log('smartMoney 服务:', sdk.smartMoney ? Object.keys(sdk.smartMoney) : '不存在');
  
  if (sdk.smartMoney) {
    console.log('可用的方法:');
    Object.keys(sdk.smartMoney).forEach(key => {
      console.log(`  - ${key}: ${typeof sdk.smartMoney[key]}`);
    });
  }
}).catch(console.error);
EOF

node test-sdk.js
```

## 📊 查看详细日志

运行后查看日志：

```bash
pm2 logs polsdk-copy-trading --lines 100
```

关注以下信息：
- `SDK 初始化完成` - SDK 是否正确初始化
- `可用的 smartMoney 方法:` - 列出了哪些方法可用
- `autoCopyTrading 方法不存在` - 如果出现，说明方法名不对
- 具体的错误堆栈信息

## 💡 临时解决方案

如果 SDK API 不兼容，可能需要：

1. **降级或升级 SDK 版本**
   ```bash
   npm install @catalyst-team/poly-sdk@0.2.0  # 尝试其他版本
   # 或
   npm install @catalyst-team/poly-sdk@latest
   ```

2. **检查 SDK 官方文档**
   - 查看 GitHub: https://github.com/cyl19970726/poly-sdk
   - 查看实际的 API 文档

3. **使用不同的初始化方式**
   ```typescript
   // 可能需要使用 create 方法
   const sdk = await SDK.create({ privateKey });
   await sdk.initialize();
   ```

## 📝 需要的信息

请运行更新后的代码，然后提供：

1. **完整的日志输出**（特别是错误部分）
2. **SDK 版本信息**：`npm list @catalyst-team/poly-sdk`
3. **SDK 可用方法**：日志中会显示 "可用的 smartMoney 方法"

这样我可以帮您确定正确的 API 调用方式。

## 🚀 快速测试

```bash
# 1. 更新代码
cd /opt/polsdk
git pull
npm run build

# 2. 重启服务
pm2 restart polsdk-copy-trading

# 3. 查看日志
pm2 logs polsdk-copy-trading --lines 100

# 4. 分享日志输出
```
