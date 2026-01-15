# 继续部署指南

如果您看到系统服务重启的提示，说明系统更新已完成。现在可以继续部署项目。

## ✅ 当前状态

系统已更新，服务正在重启。这是正常的过程。

## 📋 下一步：继续部署项目

### 1. 验证系统状态

```bash
# 检查系统是否正常运行
systemctl status

# 检查网络连接
ping -c 3 google.com
```

### 2. 安装 Node.js（如果还未安装）

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

### 3. 安装 PM2（如果还未安装）

```bash
sudo npm install -g pm2
pm2 -v
```

### 4. 克隆项目

```bash
# 进入合适的目录
cd /opt

# 克隆项目
git clone https://github.com/119969788/polsdk.git

# 进入项目目录
cd polsdk
```

### 5. 安装项目依赖

```bash
# 安装依赖
npm install

# 如果安装慢，可以使用国内镜像
npm install --registry=https://registry.npmmirror.com
```

### 6. 配置环境变量

```bash
# 复制示例配置文件
cp env.example.txt .env

# 编辑配置文件
vim .env
# 或
nano .env

# 至少需要配置：
# PRIVATE_KEY=0x您的私钥
```

### 7. 编译项目

```bash
npm run build
```

### 8. 使用 PM2 启动

```bash
# 创建日志目录
mkdir -p logs

# 启动程序
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs polsdk-bot
```

## 🔍 如果遇到问题

### 系统服务重启后无法连接

```bash
# 检查 SSH 服务状态
systemctl status ssh

# 如果服务未运行，启动它
sudo systemctl start ssh
sudo systemctl enable ssh
```

### Node.js 安装失败

```bash
# 更新软件包列表
sudo apt update  # Ubuntu/Debian
sudo yum update  # CentOS

# 清理缓存后重试
sudo apt clean   # Ubuntu/Debian
sudo yum clean all  # CentOS
```

### 网络连接问题

```bash
# 检查 DNS
cat /etc/resolv.conf

# 测试网络
ping -c 3 8.8.8.8
```

## 📚 相关文档

- 完整部署教程: [DEPLOY_TENCENT_CLOUD.md](DEPLOY_TENCENT_CLOUD.md)
- PM2 使用指南: [PM2_USAGE.md](PM2_USAGE.md)
- 快速开始: [QUICKSTART.md](QUICKSTART.md)

## ✅ 检查清单

完成以下步骤后，您的项目应该已经运行：

- [ ] Node.js 已安装 (`node -v`)
- [ ] PM2 已安装 (`pm2 -v`)
- [ ] 项目已克隆 (`cd /opt/polsdk`)
- [ ] 依赖已安装 (`npm install`)
- [ ] `.env` 已配置
- [ ] 项目已编译 (`npm run build`)
- [ ] PM2 已启动 (`pm2 start ecosystem.config.js`)
- [ ] 程序运行正常 (`pm2 logs polsdk-bot`)

---

**提示**: 如果系统服务重启已完成，您可以继续执行上述步骤。所有步骤都应在项目目录（`/opt/polsdk`）中执行。
