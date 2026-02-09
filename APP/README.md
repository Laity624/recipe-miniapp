# 个人菜谱管理小程序

## 项目结构

```
APP/
├── pages/                  # 页面目录
│   ├── recipes/           # 菜谱页（首页）
│   └── mine/              # 我的页面
├── components/            # 自定义组件目录
├── utils/                 # 工具函数目录
│   ├── util.js           # 通用工具函数
│   ├── request.js        # 云函数调用封装
│   ├── enum.js           # 枚举工具类
│   └── validator.js      # 表单验证工具
├── assets/                # 静态资源目录
│   └── icons/            # 图标资源
├── cloudfunctions/        # 云函数目录
├── app.js                 # 小程序入口文件
├── app.json               # 小程序配置文件
├── app.wxss               # 全局样式文件
├── project.config.json    # 项目配置文件
└── sitemap.json           # 站点地图配置
```

## 开发说明

### 1. 环境配置

1. 安装微信开发者工具
2. 在 `project.config.json` 中配置你的 `appid`
3. 在 `app.js` 中配置云开发环境 ID (`env`)

### 2. 云开发配置

在微信开发者工具中：
1. 点击"云开发"按钮
2. 创建云开发环境
3. 获取环境 ID 并填入 `app.js` 的 `env` 字段

### 3. 样式规范

项目使用 CSS 变量定义全局样式，所有变量定义在 `app.wxss` 中：

- **颜色变量**: `--color-primary`, `--bg-color`, `--text-main` 等
- **圆角变量**: `--radius-lg`, `--radius-base` 等
- **间距变量**: `--spacing-xs`, `--spacing-sm` 等
- **阴影变量**: `--shadow-level-1`, `--shadow-level-2` 等

使用示例：
```css
.my-element {
  background-color: var(--color-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}
```

### 4. 工具函数

- **util.js**: 通用工具函数（时间格式化、提示框、节流防抖等）
- **request.js**: 云函数调用封装
- **enum.js**: 枚举值管理（分类、口味、烹饪方式等）
- **validator.js**: 表单验证工具

### 5. 开发流程

1. 根据设计文档创建页面和组件
2. 开发云函数并部署
3. 在页面中调用云函数获取数据
4. 测试功能并优化

## 注意事项

1. 所有页面背景色使用 `--bg-color` (#FAFAF8)，避免使用纯白
2. 卡片组件必须使用 `--radius-lg` (24rpx) 圆角
3. 图片上传前需要压缩，单张不超过 5MB
4. 云函数调用统一使用 `request.js` 中的封装方法
5. 枚举值统一从云端获取，并缓存到全局

## 相关文档

- [设计方案](../docs/plans/20260203-MVP.md)
- [UI 设计规范](../docs/plans/UI.md)

