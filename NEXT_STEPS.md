# 安装完成后的下一步操作

## ✅ 当前状态

- ✅ 依赖已安装（133个包）
- ✅ Node.js v22.13.1
- ✅ npm v10.9.2

## 📝 接下来的步骤

### 1. 配置环境变量

```bash
# 复制环境变量示例文件
cp env.example.txt .env

# 编辑配置文件（Windows PowerShell）
notepad .env

# 或使用其他编辑器
code .env
```

**必须配置的项：**
- `PRIVATE_KEY` - 您的私钥（必需！）

**可选配置：**
- `FOLLOW_WALLETS` - 要跟单的钱包地址
- `FOLLOW_RATIO` - 跟单比例（默认 0.1 = 10%）
- `DIP_ARB_ENABLED` - 是否启用15分钟套利（默认 true）
- `DIP_ARB_UNDERLYINGS` - 标的资产（默认 ETH）

### 2. 编译项目

```bash
npm run build
```

这将把 TypeScript 代码编译为 JavaScript，输出到 `dist/` 目录。

### 3. 运行程序

#### 开发模式（推荐首次测试）

```bash
npm run dev
```

这将直接运行 TypeScript 代码，方便调试和查看错误。

#### 生产模式

```bash
# 先编译
npm run build

# 然后运行
npm start
```

### 4. 验证运行

如果看到类似以下输出，说明程序运行正常：

```
[INFO] 初始化交易机器人...
[INFO] 🚀 交易机器人启动中...
[INFO] 开始启动跟单功能...
[INFO] 开始启动15分钟套利功能...
[INFO] ✅ 所有功能已启动，程序运行中...
```

### 5. 停止程序

按 `Ctrl+C` 停止程序。

---

## 🔧 常见问题

### npm 版本提示

您看到 npm 提示有新版本可用（11.7.0）。这是可选的，如果需要更新：

```bash
npm install -g npm@11.7.0
```

但当前版本（10.9.2）已经足够使用，不更新也可以。

### 如果编译失败

检查是否有 TypeScript 错误：

```bash
npm run build
```

### 如果运行时出错

1. **检查 .env 文件是否存在且配置正确**
   ```bash
   # 查看 .env 文件（不显示私钥）
   cat .env | findstr /V "PRIVATE_KEY"
   ```

2. **检查私钥格式**
   - 必须以 `0x` 开头
   - 应该是64个十六进制字符（不包括0x）

3. **查看详细错误信息**
   - 开发模式会显示详细的错误堆栈
   - 检查是否有网络连接问题

---

## 📚 更多信息

- 详细使用说明: [README.md](README.md)
- 快速开始指南: [QUICKSTART.md](QUICKSTART.md)
- 腾讯云部署: [DEPLOY_TENCENT_CLOUD.md](DEPLOY_TENCENT_CLOUD.md)

---

## 🚀 快速命令参考

```bash
# 安装依赖
npm install

# 编译项目
npm run build

# 开发模式运行
npm run dev

# 生产模式运行
npm start

# 清理编译文件
npm run clean
```

祝您使用愉快！🎉
