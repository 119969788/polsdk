# 解决 "Could not read package.json" 错误

## 🔍 错误原因

您遇到了这个错误：
```
npm error path /opt/package.json
npm error enoent Could not read package.json
```

**原因**：您在错误的目录（`/opt/`）下运行了 npm 命令，但项目还没有克隆到那里。

## ✅ 解决方案

### 方法一：克隆项目到当前目录

```bash
# 1. 检查当前位置
pwd

# 2. 如果不在 /opt 目录，进入 /opt
cd /opt

# 3. 克隆项目
git clone https://github.com/119969788/polsdk.git

# 4. 进入项目目录（重要！）
cd polsdk

# 5. 现在可以运行 npm 命令了
npm install
```

### 方法二：如果项目已经克隆在其他位置

```bash
# 1. 查找项目目录
find ~ -name "package.json" -type f 2>/dev/null | grep polsdk

# 2. 或查找 polsdk 目录
find ~ -type d -name "polsdk" 2>/dev/null

# 3. 进入找到的项目目录
cd /path/to/polsdk

# 4. 验证 package.json 存在
ls -la package.json

# 5. 运行 npm 命令
npm install
```

## 📋 完整部署步骤（在腾讯云服务器上）

```bash
# 1. 进入合适的目录
cd /opt

# 2. 克隆项目
git clone https://github.com/119969788/polsdk.git

# 3. 进入项目目录（这一步很重要！）
cd polsdk

# 4. 验证项目文件
ls -la
# 应该看到：package.json, tsconfig.json, src/, README.md 等

# 5. 安装依赖
npm install

# 6. 配置环境变量
cp env.example.txt .env
vim .env  # 编辑配置文件

# 7. 编译项目
npm run build

# 8. 运行程序
npm run dev  # 开发模式
# 或
npm start    # 生产模式
```

## ⚠️ 重要提示

**总是确保在项目目录中运行 npm 命令！**

在运行任何 npm 命令之前，先确认：
```bash
# 检查当前目录
pwd

# 检查 package.json 是否存在
ls package.json

# 如果看到 "package.json"，说明在正确的目录
# 如果看到 "No such file or directory"，需要先进入项目目录
```

## 🔧 验证步骤

```bash
# 1. 确认您在项目目录中
cd /opt/polsdk  # 或您克隆项目的目录

# 2. 列出文件，确认 package.json 存在
ls -la | grep package.json

# 3. 查看 package.json 内容（验证文件完整）
cat package.json | head -5

# 4. 现在可以安全地运行 npm 命令
npm install
```

## 📚 参考

- 完整部署教程：[DEPLOY_TENCENT_CLOUD.md](DEPLOY_TENCENT_CLOUD.md)
- 快速开始指南：[QUICKSTART.md](QUICKSTART.md)
