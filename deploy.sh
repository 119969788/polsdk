#!/bin/bash

# Polymarket 交易机器人 - 腾讯云一键部署脚本
# 使用方法: bash deploy.sh

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  Polymarket 交易机器人部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}警告: 建议使用 root 用户运行此脚本${NC}"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检测操作系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo -e "${RED}无法检测操作系统类型${NC}"
    exit 1
fi

echo -e "${GREEN}检测到操作系统: $OS $VER${NC}"
echo ""

# 1. 更新系统
echo -e "${YELLOW}[1/8] 更新系统软件包...${NC}"
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt update
    apt upgrade -y
    apt install -y curl wget git vim
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum update -y
    yum install -y curl wget git vim
else
    echo -e "${RED}不支持的操作系统: $OS${NC}"
    exit 1
fi

# 2. 检查 Node.js
echo -e "${YELLOW}[2/8] 检查 Node.js 安装...${NC}"
if ! command -v node &> /dev/null; then
    echo "Node.js 未安装，开始安装..."
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}Node.js 已安装: $NODE_VERSION${NC}"
fi

# 验证 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js 安装失败${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"
echo -e "${GREEN}✓ npm: $NPM_VERSION${NC}"

# 3. 安装 PM2
echo -e "${YELLOW}[3/8] 安装 PM2 进程管理器...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 安装完成${NC}"
else
    PM2_VERSION=$(pm2 -v)
    echo -e "${GREEN}✓ PM2 已安装: v$PM2_VERSION${NC}"
fi

# 4. 选择安装目录
echo -e "${YELLOW}[4/8] 选择安装目录...${NC}"
INSTALL_DIR="/opt/polsdk"
read -p "安装目录 [$INSTALL_DIR]: " input_dir
INSTALL_DIR=${input_dir:-$INSTALL_DIR}

# 创建目录
mkdir -p $(dirname $INSTALL_DIR)

# 5. 克隆或更新项目
echo -e "${YELLOW}[5/8] 获取项目代码...${NC}"
if [ -d "$INSTALL_DIR" ]; then
    echo "目录已存在，更新代码..."
    cd $INSTALL_DIR
    git pull || echo "更新失败，继续使用现有代码"
else
    echo "克隆项目..."
    git clone https://github.com/119969788/polsdk.git $INSTALL_DIR
    cd $INSTALL_DIR
fi

# 6. 安装依赖
echo -e "${YELLOW}[6/8] 安装项目依赖...${NC}"
npm install --production=false

# 如果安装失败，尝试使用国内镜像
if [ $? -ne 0 ]; then
    echo "使用国内镜像重试..."
    npm install --registry=https://registry.npmmirror.com --production=false
fi

# 7. 配置环境变量
echo -e "${YELLOW}[7/8] 配置环境变量...${NC}"
if [ ! -f "$INSTALL_DIR/.env" ]; then
    cp env.example.txt .env
    chmod 600 .env
    echo -e "${GREEN}✓ 已创建 .env 文件${NC}"
    echo -e "${YELLOW}⚠️  请编辑 .env 文件配置您的私钥和其他参数:${NC}"
    echo "   vim $INSTALL_DIR/.env"
    echo ""
    echo -e "${RED}重要: 必须配置 PRIVATE_KEY 才能运行程序！${NC}"
    read -p "是否现在编辑 .env 文件? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-vim} $INSTALL_DIR/.env
    fi
else
    echo -e "${GREEN}✓ .env 文件已存在${NC}"
fi

# 8. 编译项目
echo -e "${YELLOW}[8/8] 编译项目...${NC}"
npm run build

if [ ! -d "$INSTALL_DIR/dist" ]; then
    echo -e "${RED}编译失败，请检查错误信息${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 编译完成${NC}"

# 创建 PM2 配置文件
echo ""
echo -e "${YELLOW}创建 PM2 配置文件...${NC}"
cat > $INSTALL_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'polsdk-bot',
    script: './dist/index.js',
    cwd: process.cwd(),
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

# 创建日志目录
mkdir -p $INSTALL_DIR/logs
chmod 755 $INSTALL_DIR/logs

echo -e "${GREEN}✓ PM2 配置已创建${NC}"

# 设置开机自启
echo ""
read -p "是否设置开机自启动? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pm2 startup
    echo -e "${YELLOW}请执行上面输出的命令来设置开机自启${NC}"
fi

# 完成
echo ""
echo "=========================================="
echo -e "${GREEN}部署完成！${NC}"
echo "=========================================="
echo ""
echo "项目目录: $INSTALL_DIR"
echo ""
echo "下一步操作:"
echo "1. 编辑配置文件: vim $INSTALL_DIR/.env"
echo "2. 启动程序: cd $INSTALL_DIR && pm2 start ecosystem.config.js"
echo "3. 查看状态: pm2 status"
echo "4. 查看日志: pm2 logs polsdk-bot"
echo ""
echo "常用命令:"
echo "  pm2 start ecosystem.config.js   # 启动"
echo "  pm2 stop polsdk-bot             # 停止"
echo "  pm2 restart polsdk-bot          # 重启"
echo "  pm2 logs polsdk-bot             # 查看日志"
echo "  pm2 monit                       # 监控面板"
echo ""
