# 快速启动 PM2（无需配置文件）

如果找不到配置文件，可以直接使用命令行启动 PM2。

## 🚀 最简单的方法

```bash
# 1. 确保项目已编译
npm run build

# 2. 创建日志目录
mkdir -p logs

# 3. 直接启动（无需配置文件）
pm2 start dist/index.js --name polsdk-bot --log ./logs/out.log --error ./logs/err.log --time
```

## 📋 完整命令（包含所有选项）

```bash
pm2 start dist/index.js \
  --name polsdk-bot \
  --log ./logs/out.log \
  --error ./logs/err.log \
  --time \
  --max-memory-restart 1G \
  --autorestart \
  --min-uptime 10s \
  --max-restarts 10 \
  --restart-delay 4000
```

## ✅ 验证和查看

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs polsdk-bot

# 查看详细信息
pm2 show polsdk-bot
```

## 🔧 如果需要配置文件

如果您的服务器上没有配置文件，可以手动创建：

### 创建 JSON 配置文件

```bash
cat > ecosystem.config.json << 'EOF'
{
  "apps": [
    {
      "name": "polsdk-bot",
      "script": "./dist/index.js",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "1G",
      "env": {
        "NODE_ENV": "production"
      },
      "error_file": "./logs/err.log",
      "out_file": "./logs/out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "merge_logs": true,
      "time": true,
      "min_uptime": "10s",
      "max_restarts": 10,
      "restart_delay": 4000
    }
  ]
}
EOF
```

然后使用：
```bash
pm2 start ecosystem.config.json
```

### 或者从 GitHub 拉取最新代码

```bash
# 如果您在项目目录中
git pull

# 然后使用配置文件
pm2 start ecosystem.config.json
```

## 💡 推荐方式

**最简单的方式**：直接使用命令行启动，无需配置文件：

```bash
pm2 start dist/index.js --name polsdk-bot --log ./logs/out.log --error ./logs/err.log --time
```

这样就完全不需要配置文件了！
