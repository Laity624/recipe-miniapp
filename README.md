# 个人菜谱管理小程序

一个基于 uni-app 和微信云开发的个人菜谱管理小程序，支持家人、朋友之间分享菜谱。

## 功能特性

- 📝 菜谱管理：创建、编辑、删除菜谱，支持草稿和发布状态
- 👥 好友系统：搜索添加好友，查看好友公开的菜谱
- ⭐ 收藏功能：收藏喜欢的菜谱
- 🔍 搜索筛选：按菜名、分类、口味、烹饪方式筛选
- 🔐 隐私控制：菜谱可设置为私密或公开
- 🛠️ 枚举管理：管理员可管理分类、口味等枚举值

## 技术栈

- **前端框架**：uni-app (Vue.js)
- **后端服务**：微信云开发
  - 云数据库（MongoDB）
  - 云存储
  - 云函数
- **开发工具**：VS Code / HBuilderX

## 项目结构

```
recipe-miniapp/
├── docs/                  # 文档
│   └── plans/            # 设计方案
├── src/                  # 源代码（待创建）
│   ├── pages/           # 页面
│   ├── components/      # 组件
│   ├── utils/           # 工具函数
│   └── cloudfunctions/  # 云函数
├── CLAUDE.md            # Claude 指令
└── README.md            # 项目说明
```

## 开发计划

详细的设计方案请查看：[docs/plans/2026-02-03-recipe-miniapp-design.md](docs/plans/2026-02-03-recipe-miniapp-design.md)

## 开始开发

### 前置要求

- Node.js >= 14
- 微信开发者工具
- 微信小程序账号

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd recipe-manage
   ```

2. **配置敏感信息**
   ```bash
   # 复制配置模板
   cd APP
   cp config.example.js config.js
   cp project.private.config.json.example project.private.config.json
   ```

3. **填写配置信息**
   - 在 `APP/config.js` 中填入你的云环境 ID
   - 在 `APP/project.private.config.json` 中填入你的 appid

4. **安装依赖**
   ```bash
   npm install
   ```

5. **使用微信开发者工具打开 APP 目录**

### 安全说明

本项目已将敏感信息（appid、云环境 ID）从代码仓库中排除：
- `APP/project.private.config.json` - 包含 appid
- `APP/config.js` - 包含云环境 ID

这些文件不会被提交到 Git 仓库，请根据模板文件自行配置。

## 许可证

MIT
