# PM2 使用指南

## 📋 简介

PM2 是一个 Node.js 进程管理器，可以让您的应用在后台运行，自动重启，并提供日志管理功能。

## 🚀 快速开始

### 1. 确保项目已编译

```bash
npm run build
```

### 2. 使用 PM2 启动程序

**最简单的方式**（推荐，无需配置文件）：

```bash
# 创建日志目录
mkdir -p logs

# 直接启动
pm2 start dist/index.js --name polsdk-bot --log ./logs/out.log --error ./logs/err.log --time
```

**或者使用配置文件**（如果文件存在）：

```bash
# 方法1：使用 JSON 配置文件
pm2 start ecosystem.config.json

# 方法2：使用 .cjs 配置文件
pm2 start ecosystem.config.cjs
```

**如果找不到配置文件**，请使用上面的直接启动方式，或者手动创建配置文件（见下方说明）。

**为什么不能使用 `.js` 文件？**  
因为 `package.json` 中设置了 `"type": "module"`，`.js` 文件会被当作 ES 模块，而 PM2 配置文件需要使用 CommonJS 格式。

### 3. 查看运行状态

```bash
pm2 status
```

### 4. 查看日志

```bash
# 查看所有日志
pm2 logs polsdk-bot

# 查看最近 100 行日志
pm2 logs polsdk-bot --lines 100

# 实时查看日志（类似 tail -f）
pm2 logs polsdk-bot --lines 0
```

## 📝 常用命令

### 进程管理

```bash
# 启动
pm2 start ecosystem.config.js

# 停止
pm2 stop polsdk-bot

# 重启
pm2 restart polsdk-bot

# 删除
pm2 delete polsdk-bot

# 查看详细信息
pm2 show polsdk-bot

# 查看所有进程
pm2 list

# 监控面板（实时查看 CPU、内存使用）
pm2 monit
```

### 日志管理

```bash
# 查看日志
pm2 logs polsdk-bot

# 查看错误日志
pm2 logs polsdk-bot --err

# 查看标准输出
pm2 logs polsdk-bot --out

# 清空日志
pm2 flush

# 重新加载日志
pm2 reloadLogs
```

### 开机自启动

```bash
# 1. 生成启动脚本
pm2 startup

# 2. 执行输出的命令（例如）：
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# 3. 保存当前进程列表
pm2 save

# 取消开机自启
pm2 unstartup
```

## 🔧 配置文件说明

`ecosystem.config.js` 配置文件包含以下重要设置：

- **name**: 进程名称
- **script**: 要运行的脚本路径
- **instances**: 实例数量（1 = 单实例）
- **autorestart**: 自动重启
- **watch**: 是否监视文件变化
- **max_memory_restart**: 内存超过此限制时重启（1G）
- **error_file**: 错误日志路径
- **out_file**: 标准输出日志路径
- **log_date_format**: 日志时间格式

## 📊 监控和维护

### 查看资源使用

```bash
# 实时监控
pm2 monit

# 查看详细信息
pm2 show polsdk-bot
```

### 更新程序

```bash
# 1. 停止程序
pm2 stop polsdk-bot

# 2. 拉取最新代码（如果在服务器上）
git pull

# 3. 重新安装依赖（如果有变更）
npm install

# 4. 重新编译
npm run build

# 5. 重启程序
pm2 restart polsdk-bot

# 6. 查看日志确认运行正常
pm2 logs polsdk-bot --lines 50
```

## 🐛 故障排除

### 程序无法启动

```bash
# 1. 检查日志
pm2 logs polsdk-bot --err

# 2. 检查配置文件
cat ecosystem.config.js

# 3. 手动运行程序查看错误
node dist/index.js
```

### 程序频繁重启

```bash
# 1. 查看重启次数
pm2 status

# 2. 查看详细错误日志
pm2 logs polsdk-bot --err --lines 100

# 3. 检查内存使用
pm2 show polsdk-bot
```

### 日志文件过大

```bash
# 1. 安装日志轮转模块
pm2 install pm2-logrotate

# 2. 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## 📚 更多信息

- PM2 官方文档: https://pm2.keymetrics.io/docs/usage/quick-start/
- 查看帮助: `pm2 --help`
- 查看命令帮助: `pm2 <command> --help`

## 💡 最佳实践

1. **开发环境**: 使用 `npm run dev` 直接运行
2. **生产环境**: 使用 PM2 管理进程
3. **定期检查日志**: `pm2 logs polsdk-bot`
4. **设置日志轮转**: 避免日志文件过大
5. **监控资源使用**: `pm2 monit`

---

**提示**: 首次使用 PM2 时，确保：
1. 项目已编译（`npm run build`）
2. `.env` 文件已配置
3. `logs/` 目录已创建（PM2 会自动创建）
