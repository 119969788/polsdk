# 修复 PM2 配置文件错误

## 问题原因

您的 `package.json` 中设置了 `"type": "module"`，这会使所有 `.js` 文件被当作 ES 模块处理。但是 PM2 的配置文件需要使用 CommonJS 格式。

## 解决方案

### 方案一：使用 .cjs 扩展名（推荐）

PM2 支持 `.cjs` 扩展名，使用 CommonJS 格式：

```bash
# 使用 .cjs 文件启动
pm2 start ecosystem.config.cjs

# 或者直接指定文件名
pm2 start dist/index.js --name polsdk-bot
```

### 方案二：直接启动（无需配置文件）

```bash
pm2 start dist/index.js --name polsdk-bot --log ./logs/out.log --error ./logs/err.log
```

### 方案三：使用 PM2 JSON 配置

创建一个 JSON 格式的配置文件：

```json
{
  "apps": [{
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
    "time": true
  }]
}
```

保存为 `ecosystem.config.json`，然后：

```bash
pm2 start ecosystem.config.json
```

## 快速修复命令

```bash
# 方法1：使用 .cjs 文件（已创建）
pm2 start ecosystem.config.cjs

# 方法2：直接启动，无需配置文件
pm2 start dist/index.js --name polsdk-bot --log ./logs/out.log --error ./logs/err.log --time

# 方法3：使用 JSON 配置文件
pm2 start ecosystem.config.json
```

## 验证配置

启动后验证：

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs polsdk-bot

# 查看详细信息
pm2 show polsdk-bot
```
