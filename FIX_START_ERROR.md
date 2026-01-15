# 修复启动错误：Script not found

## 🔍 问题原因

错误 `Script not found: /opt/polsdk/dist/copy-trading.js` 表示：
- 文件不存在或未编译
- 或者路径不正确

## ✅ 解决方案

### 方法一：在服务器上编译项目（推荐）

```bash
# 1. 进入项目目录
cd /opt/polsdk

# 2. 检查文件是否存在
ls -la dist/

# 3. 如果没有 dist 目录或文件，重新编译
npm run build

# 4. 验证编译结果
ls -la dist/copy-trading.js

# 5. 如果文件存在，启动 PM2
pm2 start dist/copy-trading.js --name polsdk-copy-trading --log ./logs/copy-trading-out.log --error ./logs/copy-trading-err.log --time
```

### 方法二：使用配置文件启动

```bash
# 1. 确保项目已编译
cd /opt/polsdk
npm run build

# 2. 检查配置文件是否存在
ls -la ecosystem.config.copy.json

# 3. 如果配置文件存在，使用它启动
pm2 start ecosystem.config.copy.json

# 4. 如果配置文件不存在，手动创建（见下方）
```

### 方法三：从 GitHub 拉取最新代码

```bash
# 1. 进入项目目录
cd /opt/polsdk

# 2. 拉取最新代码
git pull

# 3. 安装依赖（如果有新的依赖）
npm install

# 4. 编译项目
npm run build

# 5. 启动
pm2 start ecosystem.config.copy.json
```

### 方法四：手动创建配置文件（如果文件丢失）

```bash
cd /opt/polsdk

# 创建配置文件
cat > ecosystem.config.copy.json << 'EOF'
{
  "apps": [
    {
      "name": "polsdk-copy-trading",
      "script": "./dist/copy-trading.js",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "1G",
      "env": {
        "NODE_ENV": "production"
      },
      "error_file": "./logs/copy-trading-err.log",
      "out_file": "./logs/copy-trading-out.log",
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

# 然后启动
pm2 start ecosystem.config.copy.json
```

## 🔍 诊断步骤

```bash
# 1. 检查当前目录
pwd
# 应该显示: /opt/polsdk

# 2. 检查项目结构
ls -la

# 3. 检查是否有 src 目录
ls -la src/

# 4. 检查是否有 dist 目录
ls -la dist/

# 5. 检查 package.json
cat package.json | grep scripts

# 6. 检查 node_modules 是否存在
ls -la node_modules/ | head -5
```

## 📋 完整启动流程

```bash
# 1. 进入项目目录
cd /opt/polsdk

# 2. 检查是否是从 GitHub 克隆的
git status

# 3. 如果是，拉取最新代码
git pull

# 4. 确保依赖已安装
npm install

# 5. 编译项目
npm run build

# 6. 验证编译结果
ls -la dist/copy-trading.js
ls -la dist/dip-arb.js

# 7. 创建日志目录
mkdir -p logs

# 8. 检查 .env 配置文件
ls -la .env
# 如果不存在，需要创建：
# cp env.example.txt .env
# vim .env

# 9. 启动跟单功能
pm2 start dist/copy-trading.js --name polsdk-copy-trading --log ./logs/copy-trading-out.log --error ./logs/copy-trading-err.log --time

# 10. 查看状态
pm2 status

# 11. 查看日志
pm2 logs polsdk-copy-trading
```

## ⚠️ 常见问题

### 问题1：npm run build 失败

```bash
# 检查 Node.js 版本
node -v
# 应该是 v18+ 或 v20+

# 检查 TypeScript
npm list typescript

# 如果 TypeScript 未安装
npm install --save-dev typescript

# 重新编译
npm run build
```

### 问题2：编译成功但文件不存在

```bash
# 检查编译输出
npm run build

# 查看是否有错误信息
# 检查 dist 目录权限
ls -la dist/

# 如果权限问题
chmod -R 755 dist/
```

### 问题3：PM2 找不到文件

```bash
# 使用绝对路径
pm2 start /opt/polsdk/dist/copy-trading.js --name polsdk-copy-trading --log /opt/polsdk/logs/copy-trading-out.log --error /opt/polsdk/logs/copy-trading-err.log --time

# 或者确保在正确的目录
cd /opt/polsdk
pm2 start ./dist/copy-trading.js --name polsdk-copy-trading --log ./logs/copy-trading-out.log --error ./logs/copy-trading-err.log --time
```

## 💡 快速修复命令

```bash
# 一键修复脚本
cd /opt/polsdk && \
npm install && \
npm run build && \
mkdir -p logs && \
pm2 start dist/copy-trading.js --name polsdk-copy-trading --log ./logs/copy-trading-out.log --error ./logs/copy-trading-err.log --time && \
pm2 status
```
