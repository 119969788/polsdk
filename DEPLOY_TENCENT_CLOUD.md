# 腾讯云服务器部署详细教程

本教程将指导您在腾讯云服务器上安装和运行 Polymarket 跟单和15分钟市场策略套利程序。

## 📋 目录

1. [服务器准备](#1-服务器准备)
2. [环境安装](#2-环境安装)
3. [项目部署](#3-项目部署)
4. [配置设置](#4-配置设置)
5. [运行程序](#5-运行程序)
6. [进程管理](#6-进程管理)
7. [监控和维护](#7-监控和维护)
8. [故障排除](#8-故障排除)

---

## 1. 服务器准备

### 1.1 购买腾讯云服务器

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **云服务器 CVM** 页面
3. 点击 **新建** 创建实例
4. 推荐配置：
   - **地域**: 选择离您最近的地域
   - **实例类型**: 标准型 S5（2核4GB内存起步）
   - **镜像**: Ubuntu 22.04 LTS 或 CentOS 7.9
   - **系统盘**: 50GB SSD
   - **网络**: 公网IP（用于访问）
   - **安全组**: 开放 SSH (22端口)

### 1.2 连接服务器

#### Windows 用户（使用 PowerShell 或 CMD）

```powershell
# 使用 SSH 连接（替换为您的服务器IP）
ssh root@您的服务器IP
```

#### 使用 PuTTY（Windows）

1. 下载并安装 [PuTTY](https://www.putty.org/)
2. 输入服务器IP地址
3. 端口：22
4. 连接类型：SSH
5. 点击 **Open** 连接

#### 使用 Xshell（推荐）

1. 下载 [Xshell](https://www.netsarang.com/zh/xshell/)
2. 新建会话，输入服务器IP和端口22
3. 使用 root 账户和密码登录

---

## 2. 环境安装

### 2.1 更新系统（Ubuntu/Debian）

```bash
# 更新软件包列表
sudo apt update

# 升级系统
sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim
```

### 2.2 更新系统（CentOS）

```bash
# 更新系统
sudo yum update -y

# 安装基础工具
sudo yum install -y curl wget git vim
```

### 2.3 安装 Node.js

#### 方法一：使用 NodeSource 安装（推荐）

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

#### 方法二：使用 NVM 安装（灵活版本管理）

```bash
# 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc

# 安装 Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

#### 验证安装

```bash
# 检查 Node.js 版本（应该是 v20.x.x）
node -v

# 检查 npm 版本
npm -v
```

### 2.4 安装 PM2（进程管理器）

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 验证安装
pm2 -v
```

### 2.5 安装 TypeScript 编译工具（可选）

```bash
# 全局安装 tsx（用于开发模式）
sudo npm install -g tsx typescript
```

---

## 3. 项目部署

### 3.1 克隆项目

```bash
# 进入合适的目录（例如 /opt 或 /home）
cd /opt

# 克隆项目
git clone https://github.com/119969788/polsdk.git

# 进入项目目录
cd polsdk
```

### 3.2 安装项目依赖

```bash
# 安装依赖
npm install

# 如果 npm install 较慢，可以使用国内镜像
npm install --registry=https://registry.npmmirror.com
```

### 3.3 验证项目结构

```bash
# 查看项目文件
ls -la

# 应该看到以下文件：
# - package.json
# - tsconfig.json
# - src/
# - README.md
```

---

## 4. 配置设置

### 4.1 创建环境变量文件

```bash
# 复制示例配置文件
cp env.example.txt .env

# 编辑配置文件
vim .env
# 或使用 nano
nano .env
```

### 4.2 配置环境变量

在 `.env` 文件中填写以下配置：

```env
# ===== 必需配置 =====
# 您的私钥（用于签名交易）
PRIVATE_KEY=0x你的私钥

# ===== 跟单配置 =====
# 要跟单的钱包地址，多个地址用逗号分隔
FOLLOW_WALLETS=0x钱包1,0x钱包2
# 最小跟单金额 (USD)
FOLLOW_MIN_AMOUNT=100
# 最大跟单金额 (USD)
FOLLOW_MAX_AMOUNT=1000
# 跟单比例 (0.0-1.0)
FOLLOW_RATIO=0.1

# ===== 15分钟套利配置 =====
# 是否启用15分钟套利功能
DIP_ARB_ENABLED=true
# 标的资产
DIP_ARB_UNDERLYINGS=ETH
# 最小利润率
DIP_ARB_MIN_PROFIT=0.02
# 最大持仓金额 (USD)
DIP_ARB_MAX_POSITION=500

# ===== 日志配置 =====
LOG_LEVEL=info
```

#### 使用 Vim 编辑（如果使用 vim）

```bash
# 按 i 进入插入模式
# 编辑完成后按 ESC，然后输入 :wq 保存退出
```

#### 使用 Nano 编辑（更简单）

```bash
# 直接编辑，完成后按 Ctrl+X，然后按 Y 确认，回车保存
```

### 4.3 设置文件权限

```bash
# 确保 .env 文件权限安全（仅所有者可读写）
chmod 600 .env

# 验证权限
ls -l .env
# 应该显示: -rw------- 1 root root ...
```

---

## 5. 运行程序

### 5.1 开发模式测试（首次运行）

```bash
# 使用 tsx 直接运行（需要全局安装 tsx）
npm run dev

# 或使用 npx
npx tsx src/index.ts
```

如果看到类似以下输出，说明程序运行正常：

```
[2024-01-01T00:00:00.000Z] [INFO] 初始化交易机器人...
[2024-01-01T00:00:00.000Z] [INFO] 🚀 交易机器人启动中...
```

按 `Ctrl+C` 停止程序。

### 5.2 编译项目（生产模式）

```bash
# 编译 TypeScript 到 JavaScript
npm run build

# 查看编译输出
ls -la dist/
```

### 5.3 使用 PM2 运行（推荐生产环境）

#### 创建 PM2 配置文件

```bash
# 创建 ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'polsdk-bot',
    script: './dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
};
EOF
```

#### 启动程序

```bash
# 使用 PM2 启动
pm2 start ecosystem.config.js

# 查看运行状态
pm2 status

# 查看日志
pm2 logs polsdk-bot

# 实时查看日志（类似 tail -f）
pm2 logs polsdk-bot --lines 100
```

#### PM2 常用命令

```bash
# 查看所有进程
pm2 list

# 停止程序
pm2 stop polsdk-bot

# 重启程序
pm2 restart polsdk-bot

# 删除进程
pm2 delete polsdk-bot

# 查看详细信息
pm2 show polsdk-bot

# 监控面板
pm2 monit

# 保存当前进程列表（开机自启需要）
pm2 save

# 设置开机自启
pm2 startup
# 执行上面命令输出的命令（通常是 sudo 开头的）
```

---

## 6. 进程管理

### 6.1 设置开机自启动

```bash
# 生成启动脚本
pm2 startup

# 执行输出的命令（例如）：
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# 保存当前进程列表
pm2 save
```

### 6.2 创建日志目录

```bash
# 创建日志目录
mkdir -p logs

# 设置权限
chmod 755 logs
```

### 6.3 配置日志轮转（可选）

```bash
# 安装 PM2 日志轮转模块
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 7. 监控和维护

### 7.1 查看程序状态

```bash
# 查看 PM2 状态
pm2 status

# 查看详细信息
pm2 show polsdk-bot

# 查看资源使用
pm2 monit
```

### 7.2 查看日志

```bash
# 查看所有日志
pm2 logs

# 查看最近100行
pm2 logs --lines 100

# 清空日志
pm2 flush
```

### 7.3 更新程序

```bash
# 进入项目目录
cd /opt/polsdk

# 停止程序
pm2 stop polsdk-bot

# 拉取最新代码
git pull

# 重新安装依赖（如果有新依赖）
npm install

# 重新编译
npm run build

# 重启程序
pm2 restart polsdk-bot

# 查看日志确认运行正常
pm2 logs polsdk-bot --lines 50
```

### 7.4 备份配置

```bash
# 备份 .env 文件（重要！）
cp .env .env.backup.$(date +%Y%m%d)

# 定期备份到其他位置
# 例如备份到 /root/backups/
mkdir -p /root/backups
cp .env /root/backups/polsdk.env.$(date +%Y%m%d)
```

---

## 8. 故障排除

### 8.1 程序无法启动

#### 检查 Node.js 版本

```bash
node -v
# 应该是 v18.x.x 或更高版本
```

#### 检查依赖安装

```bash
cd /opt/polsdk
npm install
```

#### 检查环境变量

```bash
# 检查 .env 文件是否存在
ls -la .env

# 检查配置是否正确
cat .env | grep -v "PRIVATE_KEY"  # 不显示私钥
```

#### 查看详细错误

```bash
# 直接运行查看错误
npm run dev

# 或查看 PM2 错误日志
pm2 logs polsdk-bot --err
```

### 8.2 程序运行后立即退出

#### 检查日志

```bash
pm2 logs polsdk-bot --err --lines 50
```

#### 常见原因

1. **私钥格式错误**: 确保以 `0x` 开头
2. **网络连接问题**: 检查服务器网络
3. **依赖缺失**: 重新运行 `npm install`

### 8.3 内存不足

```bash
# 查看内存使用
free -h

# 如果内存不足，可以：
# 1. 升级服务器配置
# 2. 调整 PM2 内存限制
# 编辑 ecosystem.config.js，修改 max_memory_restart
```

### 8.4 网络连接问题

```bash
# 测试网络连接
ping google.com

# 测试 DNS
nslookup github.com

# 如果无法访问 GitHub，配置代理或使用镜像
```

### 8.5 权限问题

```bash
# 检查文件权限
ls -la

# 修复权限
chmod 600 .env
chmod 755 logs
```

---

## 9. 安全建议

### 9.1 防火墙配置

```bash
# Ubuntu/Debian 使用 ufw
sudo ufw allow 22/tcp
sudo ufw enable

# CentOS 使用 firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### 9.2 SSH 安全

```bash
# 禁用密码登录，使用密钥登录（推荐）
# 编辑 SSH 配置
sudo vim /etc/ssh/sshd_config

# 设置：
# PasswordAuthentication no
# PermitRootLogin prohibit-password

# 重启 SSH 服务
sudo systemctl restart sshd
```

### 9.3 定期更新

```bash
# 定期更新系统
sudo apt update && sudo apt upgrade -y  # Ubuntu
sudo yum update -y  # CentOS

# 更新 Node.js 和依赖
npm update
```

---

## 10. 快速部署脚本

创建一个自动化部署脚本：

```bash
# 创建部署脚本
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "开始部署 polsdk..."

# 1. 更新系统
echo "更新系统..."
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js
echo "安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 PM2
echo "安装 PM2..."
sudo npm install -g pm2

# 4. 克隆项目
echo "克隆项目..."
cd /opt
git clone https://github.com/119969788/polsdk.git
cd polsdk

# 5. 安装依赖
echo "安装依赖..."
npm install

# 6. 创建 .env 文件
echo "请手动配置 .env 文件"
cp env.example.txt .env
chmod 600 .env

# 7. 编译项目
echo "编译项目..."
npm run build

# 8. 创建 PM2 配置
cat > ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: 'polsdk-bot',
    script: './dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
PM2EOF

echo "部署完成！"
echo "请编辑 .env 文件配置参数，然后运行: pm2 start ecosystem.config.js"
EOF

# 设置执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

---

## 11. 联系和支持

如果遇到问题：

1. 查看 [README.md](README.md) 了解项目详情
2. 查看 [QUICKSTART.md](QUICKSTART.md) 快速开始指南
3. 提交 [GitHub Issue](https://github.com/119969788/polsdk/issues)

---

## 总结

完成以上步骤后，您的程序应该已经在腾讯云服务器上成功运行。记住：

✅ **定期检查日志**: `pm2 logs polsdk-bot`  
✅ **定期备份配置**: 备份 `.env` 文件  
✅ **监控资源使用**: `pm2 monit`  
✅ **保持系统更新**: 定期更新系统和依赖  

祝您交易顺利！🚀
