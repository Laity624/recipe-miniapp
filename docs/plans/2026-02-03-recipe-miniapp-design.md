# 个人菜谱管理小程序 - 设计方案

## 项目概述

一个基于微信小程序的个人菜谱管理应用，支持家人、朋友之间分享菜谱。用户可以创建和管理自己的菜谱，添加好友后可以查看和收藏好友公开的菜谱。

## 一、整体架构

### 技术栈
- **小程序框架**：uni-app（Vue.js 语法）
- **后端**：微信云开发
  - 云数据库（MongoDB）：存储用户、菜谱、好友关系、收藏等数据
  - 云存储：存储菜谱图片、步骤图片
  - 云函数：处理复杂业务逻辑（好友申请、权限校验、统计数据等）

### 核心模块
1. **用户模块**：微信登录、个人主页、用户信息管理
2. **菜谱模块**：创建/编辑/删除菜谱、草稿/发布状态管理
3. **好友模块**：搜索用户、发送/接受好友申请、好友列表管理
4. **收藏模块**：收藏好友菜谱、查看收藏列表
5. **搜索模块**：按菜名、分类、口味、烹饪方式筛选菜谱
6. **枚举管理模块**：管理员管理枚举值

### 数据流向
- 小程序端 → 云函数（业务逻辑处理）→ 云数据库（数据存储）
- 图片上传 → 云存储 → 返回图片URL → 存入云数据库

## 二、数据库设计

### 1. users（用户表）
```javascript
{
  _openid: "微信openid（自动生成）",
  nickname: "用户昵称",
  avatarUrl: "头像URL",
  identityCode: "身份码（唯一标识，用于搜索添加好友）",
  bio: "个人简介",
  phone: "手机号",
  isAdmin: false, // 是否为管理员
  recipeCount: 0,  // 菜谱数量（冗余字段，便于展示）
  friendCount: 0,  // 好友数量
  favoriteCount: 0, // 获得收藏的数量
  createTime: "注册时间"
}
```

**设计说明：**
- `identityCode`：6-8位字母数字组合，用于搜索添加好友
- `recipeCount/friendCount/favoriteCount`：冗余字段，用空间换时间，提高查询性能
- `isAdmin`：管理员标识，用于枚举管理权限控制

### 2. recipes（菜谱表）
```javascript
{
  _id: "菜谱ID",
  _openid: "创建者openid",
  status: 0, // 0=草稿, 1=已发布
  isPublic: 0, // 0=私密, 1=公开
  isDeleted: false, // 软删除标识
  name: "菜名",
  description: "描述",
  images: ["图片URL数组，最多5张"],
  category: 0, // 枚举：分类
  taste: 0, // 枚举：口味
  cookingMethod: 0, // 枚举：烹饪方式
  cookingTime: 0, // 枚举：烹饪时间
  difficulty: 0, // 枚举：难度
  servings: 0, // 枚举：人数
  ingredients: [{name: "食材名", amount: "用量"}],
  seasonings: [{name: "调料名", amount: "用量"}],
  steps: [{order: 1, content: "步骤描述", image: "步骤图片URL（每个步骤最多1张）"}],
  tips: "小技巧",
  notes: "注意事项",
  links: ["外部链接数组（抖音、小红书、微信视频等）"],
  favoriteCount: 0, // 被收藏次数
  createTime: "创建时间",
  updateTime: "更新时间"
}
```

**设计说明：**
- `status`：草稿和已发布状态都可编辑，草稿不能被搜索
- `isDeleted`：软删除，删除时设为 true，不真正删除记录
- 所有枚举字段使用数字，具体映射关系存储在 enums 表

### 3. enums（枚举表）
```javascript
{
  _id: "枚举ID",
  type: "枚举类型", // category/taste/cookingMethod/cookingTime/difficulty/servings
  value: 0, // 枚举值（数字）
  label: "显示文本", // 如：家常菜、川菜、粤菜
  sort: 0, // 排序字段
  isActive: true // 是否启用
}
```

**示例数据：**
```javascript
// 分类
{type: "category", value: 0, label: "家常菜", sort: 0, isActive: true}
{type: "category", value: 1, label: "川菜", sort: 1, isActive: true}

// 口味
{type: "taste", value: 0, label: "清淡", sort: 0, isActive: true}
{type: "taste", value: 1, label: "微辣", sort: 1, isActive: true}

// 烹饪方式
{type: "cookingMethod", value: 0, label: "炒", sort: 0, isActive: true}
{type: "cookingMethod", value: 1, label: "炖", sort: 1, isActive: true}

// 烹饪时间
{type: "cookingTime", value: 0, label: "10分钟内", sort: 0, isActive: true}
{type: "cookingTime", value: 1, label: "10-30分钟", sort: 1, isActive: true}

// 难度
{type: "difficulty", value: 0, label: "简单", sort: 0, isActive: true}
{type: "difficulty", value: 1, label: "中等", sort: 1, isActive: true}

// 人数
{type: "servings", value: 0, label: "1人份", sort: 0, isActive: true}
{type: "servings", value: 1, label: "2人份", sort: 1, isActive: true}
```

### 4. friends（好友关系表）
```javascript
{
  _id: "关系ID",
  fromOpenid: "发起者openid",
  toOpenid: "接收者openid",
  status: 0, // 0=待确认, 1=已同意, 2=已拒绝
  createTime: "申请时间",
  updateTime: "更新时间"
}
```

**设计说明：**
- 好友关系采用双向存储：A添加B时，创建一条记录（fromOpenid=A, toOpenid=B）
- 成为好友后，双方都可以查看对方的公开菜谱

### 5. favorites（收藏表）
```javascript
{
  _id: "收藏ID",
  _openid: "收藏者openid",
  recipeId: "菜谱ID",
  recipeOpenid: "菜谱创建者openid",
  createTime: "收藏时间"
}
```

**设计说明：**
- 记录了菜谱创建者的openid，便于后续权限校验
- 当菜谱变为私密时，收藏记录保留，但不能查看详情

## 三、核心功能模块设计

### 1. 用户模块

**微信登录**
- 使用 `wx.login()` 获取 code
- 调用云函数换取 openid 和 session_key
- 首次登录时获取微信头像和昵称，生成唯一的身份码

**个人主页**
- 展示头像、昵称、身份码、个人简介
- 展示统计数据：菜谱数、好友数、获得收藏数
- 功能入口：我的菜谱、我的收藏、好友管理、个人设置

**信息编辑**
- 可修改昵称、个人简介、手机号

### 2. 菜谱模块

**创建菜谱**
- 默认状态为草稿（status=0）
- 默认私密（isPublic=0）
- 支持上传最多5张主图
- 每个步骤最多1张图片

**编辑菜谱**
- 草稿和已发布状态都可编辑
- 修改后更新 updateTime

**发布菜谱**
- 将 status 从 0 改为 1
- 同时更新用户的 recipeCount

**删除菜谱**
- 软删除：将 isDeleted 设为 true
- 更新用户的 recipeCount

**权限控制**
- 草稿状态：仅创建者可见
- 已发布+私密：仅创建者可见
- 已发布+公开：所有好友可见

### 3. 好友模块

**搜索用户**
- 通过身份码或昵称搜索
- 云函数实现，避免暴露所有用户数据

**发送申请**
- 创建 friends 记录，status=0（待确认）

**接受/拒绝**
- 更新 friends 记录的 status
- 同意后更新双方的 friendCount

**好友列表**
- 查询 status=1 的好友关系

**删除好友**
- 删除好友关系记录
- 更新双方的 friendCount

### 4. 收藏模块

**收藏菜谱**
- 创建 favorites 记录
- 更新菜谱的 favoriteCount
- 更新创建者的 favoriteCount

**取消收藏**
- 删除 favorites 记录
- 减少相应的计数

**收藏列表**
- 查询当前用户的所有收藏

**权限校验**
- 查看收藏的菜谱详情时，需要校验：
  - 菜谱是否被软删除（isDeleted=true）
  - 菜谱是否为私密（isPublic=0）
  - 如果私密或删除，显示提示信息

### 5. 搜索模块

**场景一：公共搜索菜单（菜谱页）**
- 搜索范围：
  - 自己的已发布菜谱（包括私密和公开）
  - 所有好友的已发布且公开的菜谱
- 筛选条件：菜名、分类、口味、烹饪方式

**场景二：我的菜谱页面**
- Tab 栏切换：
  - 全部：显示所有菜谱（草稿+已发布）
  - 已发布：只显示 status=1 的菜谱
  - 草稿：只显示 status=0 的菜谱
- 支持搜索和筛选

### 6. 枚举管理模块

**管理员权限**
- users 表的 isAdmin 字段标识管理员
- 只有管理员可以管理枚举值

**管理功能**
- 新增枚举值
- 编辑枚举值（修改 label、sort）
- 删除枚举值
- 启用/禁用枚举值（isActive 字段）
- 调整枚举值排序

**管理页面**
- 在"我的"页面，管理员可以看到"枚举管理"入口
- 按类型分组展示（分类、口味、烹饪方式等）
- 每个类型下可以新增、编辑、删除、排序枚举值

## 四、页面结构设计

### 底部导航栏（2个Tab）
1. **菜谱**：公共搜索菜单，展示自己和好友的已发布菜谱
2. **我的**：个人主页

### 详细页面结构

**1. 菜谱页（首页）**
- 顶部：搜索框（菜名搜索）
- 筛选栏：分类、口味、烹饪方式（下拉选择或横向滚动标签）
- 菜谱列表：卡片式展示（封面图、菜名、作者头像、作者昵称、收藏数）
- 点击卡片：进入菜谱详情页
- 右下角：悬浮按钮"+"（快速创建菜谱）

**2. 我的页面**
- **顶部个人信息区**：
  - 头像、昵称、身份码
  - 个人简介
  - 统计数据：菜谱数 | 好友数 | 获得收藏数（可点击）

- **功能入口列表**：
  - 我的菜谱（进入菜谱管理页，有全部/已发布/草稿 tab）
  - 我的收藏（进入收藏列表页）
  - 好友管理（进入好友页，有好友列表/好友申请 tab）
  - 枚举管理（仅管理员可见）
  - 个人设置（编辑个人信息、关于、退出登录）

**3. 其他重要页面**
- **菜谱详情页**：展示完整菜谱信息，底部有收藏按钮
- **菜谱编辑页**：表单式编辑，支持图片上传
- **我的菜谱管理页**：Tab栏（全部/已发布/草稿），支持搜索筛选
- **好友页**：Tab栏（好友列表/好友申请），顶部有搜索添加按钮
- **搜索用户页**：输入身份码或昵称搜索，发送好友申请
- **枚举管理页**：按类型分组，管理枚举值（仅管理员）

## 五、权限和安全设计

### 1. 数据权限控制

**菜谱访问权限：**
- 草稿状态（status=0）：仅创建者可见
- 已发布+私密（status=1, isPublic=0）：仅创建者可见
- 已发布+公开（status=1, isPublic=1）：所有好友可见
- 软删除（isDeleted=true）：任何人都不可见

**收藏权限校验：**
- 查看收藏的菜谱时，需要实时校验菜谱的状态和隐私设置
- 如果菜谱变为私密或被删除，显示"该菜谱已设为私密"或"该菜谱已被删除"

**好友关系校验：**
- 查看好友的公开菜谱前，需要校验双方是否为好友关系（status=1）
- 如果已解除好友关系，则不能查看对方的菜谱

### 2. 数据库安全规则

使用微信云开发的数据库权限设置：
- **users 表**：仅创建者可读写自己的记录
- **recipes 表**：创建者可读写，好友可读（需通过云函数校验权限）
- **friends 表**：相关双方可读，发起者可写
- **favorites 表**：创建者可读写
- **enums 表**：所有人可读，仅管理员可写

### 3. 云函数权限校验

关键操作必须通过云函数处理，避免客户端直接操作数据库：
- 搜索用户（避免暴露所有用户数据）
- 查看好友的菜谱（校验好友关系和菜谱权限）
- 收藏菜谱（校验权限并更新计数）
- 发送/接受好友申请（校验状态并更新计数）
- 管理枚举值（校验管理员权限）

## 六、云函数设计

### 1. user 相关
- `login`：处理微信登录，获取或创建用户信息，生成唯一身份码
- `updateUserInfo`：更新用户信息（昵称、个人简介、手机号）
- `searchUser`：搜索用户（通过身份码或昵称），避免暴露所有用户数据

### 2. recipe 相关
- `createRecipe`：创建菜谱，更新用户的 recipeCount
- `updateRecipe`：更新菜谱信息
- `deleteRecipe`：软删除菜谱，更新用户的 recipeCount
- `publishRecipe`：发布菜谱（status 从 0 改为 1）
- `getRecipeDetail`：获取菜谱详情（带权限校验）
- `searchRecipes`：搜索菜谱（公共搜索或我的菜谱）

### 3. friend 相关
- `sendFriendRequest`：发送好友申请
- `handleFriendRequest`：处理好友申请（同意/拒绝），更新双方的 friendCount
- `getFriendList`：获取好友列表
- `deleteFriend`：删除好友，更新双方的 friendCount

### 4. favorite 相关
- `addFavorite`：收藏菜谱，更新 favoriteCount（菜谱和创建者）
- `removeFavorite`：取消收藏，更新 favoriteCount
- `getFavoriteList`：获取收藏列表（带权限校验）

### 5. enum 相关
- `getEnums`：获取所有枚举值（可按 type 筛选）
- `addEnum`：新增枚举值（需管理员权限）
- `updateEnum`：编辑枚举值（需管理员权限）
- `deleteEnum`：删除枚举值（需管理员权限）
- `sortEnums`：调整枚举值排序（需管理员权限）

## 七、技术要点

### 1. 数据一致性
- 使用云函数的事务或原子操作，确保计数字段的一致性
- 例如：收藏菜谱时，同时更新 favorites 表、recipes.favoriteCount、users.favoriteCount

### 2. 图片上传
- 使用云存储上传图片
- 限制图片大小和格式（建议：单张不超过5MB，支持 jpg/png）
- 上传成功后返回图片URL，存入数据库

### 3. 身份码生成
- 6-8位字母数字组合
- 需要保证唯一性，生成时检查是否已存在
- 建议格式：大写字母+数字，如 ABC123

### 4. 性能优化
- 使用冗余字段（recipeCount、friendCount、favoriteCount）减少查询
- 枚举值缓存到小程序本地，减少网络请求
- 菜谱列表分页加载

### 5. 用户体验
- 图片上传时显示进度条
- 操作成功/失败时给予明确的提示
- 加载数据时显示骨架屏或加载动画

## 八、后续扩展

### 可选功能（后期可考虑）
1. **评论功能**：好友可以评论菜谱
2. **点赞功能**：给菜谱点赞
3. **菜谱分享**：分享到微信聊天或朋友圈
4. **菜单计划**：规划一周的菜单
5. **购物清单**：根据菜谱生成购物清单
6. **营养分析**：计算菜谱的营养成分
7. **视频支持**：支持上传烹饪视频
8. **AI 推荐**：根据用户喜好推荐菜谱

---

**文档版本**：v1.0
**创建日期**：2026-02-03
**最后更新**：2026-02-03
