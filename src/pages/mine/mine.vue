<template>
  <view class="page-container">
    <!-- 0. 背景装饰光斑：营造温暖氛围 -->
    <view class="bg-decoration"></view>

    <!-- 1. 顶部个人信息区域 -->
    <view class="header-section">
      <view class="user-card">
        <!-- 头像 -->
        <image class="avatar" src="https://picsum.photos/200" mode="aspectFill"></image>
        
        <!-- 文字信息区域 (左对齐布局) -->
        <view class="info-box">
          <!-- 第一行：昵称 -->
          <view class="nickname-row">
            <text class="nickname">爱做饭的小明</text>
          </view>
          
          <!-- 第二行：身份码 (独立一行，灰色胶囊) -->
          <view class="id-tag" @click="copyId">
            <text class="id-text">ID: ABC1234</text>
            <text class="copy-icon">❐</text>
          </view>
          
          <!-- 第三行：简介 (去掉了多余图标) -->
          <text class="bio">唯有美食与爱不可辜负 🍳</text>
        </view>
        
        <!-- 个人设置入口 (绝对定位在右上角) -->
        <view class="settings-btn" @click="goToSettings">⚙️</view>
      </view>

      <!-- 数据统计栏 -->
      <view class="stats-row">
        <view class="stat-item" @click="navigateTo('recipes')">
          <text class="stat-num">12</text>
          <text class="stat-label">菜谱</text>
        </view>
        <!-- 分割线变淡 -->
        <view class="stat-divider"></view>
        <view class="stat-item" @click="navigateTo('likes')">
          <text class="stat-num">48</text>
          <text class="stat-label">获赞</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="navigateTo('friends')">
          <text class="stat-num">5</text>
          <text class="stat-label">好友</text>
        </view>
      </view>
    </view>

    <!-- 2. 核心功能看板 (Grid 2x2) -->
    <view class="dashboard-grid">
      <!-- 卡片1: 我的菜谱 -->
      <view class="grid-card" hover-class="card-hover" @click="navigateTo('myRecipes')">
        <view class="icon-circle orange-bg">🥘</view>
        <text class="card-title">我的菜谱</text>
        <text class="card-desc">已发布 8 道美味</text>
      </view>

      <!-- 卡片2: 草稿箱 (补齐文案) -->
      <view class="grid-card" hover-class="card-hover" @click="navigateTo('drafts')">
        <view class="icon-circle yellow-bg">📝</view>
        <text class="card-title">草稿箱</text>
        <!-- 动态文案 -->
        <text class="card-desc">{{ draftCount > 0 ? `${draftCount} 个灵感待完成` : '暂无草稿' }}</text>
        <view class="badge" v-if="draftCount > 0">{{ draftCount }}</view>
      </view>

      <!-- 卡片3: 我的收藏 (补齐文案) -->
      <view class="grid-card" hover-class="card-hover" @click="navigateTo('favorites')">
        <view class="icon-circle pink-bg">❤️</view>
        <text class="card-title">我的收藏</text>
        <text class="card-desc">喜欢的味道</text>
      </view>

      <!-- 卡片4: 饭搭子 (补齐文案) -->
      <view class="grid-card" hover-class="card-hover" @click="navigateTo('friends')">
        <view class="icon-circle blue-bg">👋</view>
        <text class="card-title">饭搭子</text>
        <text class="card-desc">常联系的好友</text>
        <!-- 新申请红点 -->
        <view class="red-dot" v-if="hasNewFriendRequest"></view>
      </view>
    </view>

    <!-- 3. 管理员入口 (仅管理员可见) -->
    <view class="menu-list" v-if="isAdmin">
      <view class="menu-item" hover-class="item-hover" @click="navigateTo('enums')">
        <view class="menu-left">
          <text class="menu-icon">🏷️</text>
          <text class="menu-text">枚举管理 (标签/分类)</text>
        </view>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 4. 底部 Slogan -->
    <view class="footer-slogan">
      <text>—— 今日宜：好好吃饭 ——</text>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue';

// --- 状态定义 ---
const isAdmin = ref(true); // 是否为管理员
const draftCount = ref(2); // 草稿数量
const hasNewFriendRequest = ref(true); // 是否有新好友申请

// --- 方法定义 ---

/**
 * 复制身份码
 */
const copyId = () => {
  uni.setClipboardData({
    data: 'ABC1234',
    success: () => {
      uni.showToast({ title: 'ID已复制', icon: 'none' });
    }
  });
};

/**
 * 跳转设置页
 */
const goToSettings = () => {
  console.log('Go to settings');
  // uni.navigateTo({ url: '/pages/settings/settings' });
};

/**
 * 通用跳转处理
 */
const navigateTo = (type) => {
  console.log('Navigate to:', type);
  // 路由跳转逻辑...
};
</script>

<style lang="scss" scoped>
/* --- 变量定义 --- */
$primary-color: #FF9F7F;      // 主色：暖柿色
$bg-color: #FAFAF8;           // 全局背景：米白
$card-bg: #FFFFFF;            // 卡片背景
$text-main: #333333;          // 主要文字
$text-sub: #999999;           // 辅助文字
$border-color: #F5F5F5;       // 极淡分割线

.page-container {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 30rpx;
  position: relative;
  overflow-x: hidden;
}

/* 0. 背景装饰光斑 */
.bg-decoration {
  position: absolute;
  top: -120rpx;
  right: -120rpx;
  width: 500rpx;
  height: 500rpx;
  background: radial-gradient(circle, #FFF8E1 0%, rgba(255,255,255,0) 70%);
  z-index: 0;
  pointer-events: none;
}

/* 1. 顶部区域 */
.header-section {
  position: relative;
  z-index: 1;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
}

.user-card {
  position: relative; /* 为设置按钮定位 */
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 0 10rpx;
  
  .avatar {
    width: 130rpx;
    height: 130rpx;
    border-radius: 50%;
    border: 4rpx solid #fff;
    box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.06);
    margin-right: 30rpx;
    flex-shrink: 0;
  }
  
  .info-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* 关键：左对齐 */
    
    .nickname-row {
      margin-bottom: 12rpx;
      .nickname {
        font-size: 42rpx;
        font-weight: 700;
        color: $text-main;
        line-height: 1.1;
      }
    }
    
    /* ID 胶囊：位于昵称下方 */
    .id-tag {
      display: inline-flex;
      align-items: center;
      background-color: #F2F3F5; /* 极淡灰 */
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      margin-bottom: 16rpx; /* ID与简介的间距 */
      
      .id-text {
        font-size: 22rpx;
        color: #888;
        font-family: monospace;
        letter-spacing: 1rpx;
      }
      .copy-icon {
        font-size: 20rpx;
        color: #AAA;
        margin-left: 8rpx;
      }
    }
    
    .bio {
      font-size: 26rpx;
      color: $text-sub;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }
  }
  
  /* 设置按钮：右上角绝对定位 */
  .settings-btn {
    position: absolute;
    top: -6rpx;
    right: 0;
    padding: 20rpx;
    font-size: 38rpx;
    color: #333;
    opacity: 0.6;
    
    &:active { opacity: 1; }
  }
}

/* 数据统计栏 */
.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: $card-bg;
  border-radius: 24rpx;
  padding: 36rpx 0;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.03);
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 30%;
    
    &:active { transform: scale(0.98); }
    
    .stat-num {
      font-size: 40rpx;
      font-weight: 700;
      color: $text-main;
      margin-bottom: 8rpx;
      line-height: 1;
    }
    .stat-label {
      font-size: 24rpx;
      color: $text-sub;
    }
  }
  
  .stat-divider {
    width: 2rpx;
    height: 24rpx;
    background-color: #EEE; /* 极淡分割线 */
  }
}

/* 2. 功能看板 Grid */
.dashboard-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 40rpx;
  
  .grid-card {
    width: 48%;
    height: 220rpx; /* 固定高度确保对齐 */
    background-color: $card-bg;
    border-radius: 28rpx;
    padding: 30rpx;
    margin-bottom: 24rpx;
    box-sizing: border-box;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
    position: relative;
    
    /* 内容左对齐布局 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    
    &.card-hover {
      background-color: #FFFCF9; /* 按下变暖色 */
      transform: scale(0.99);
      transition: all 0.2s;
    }
    
    .icon-circle {
      width: 72rpx;
      height: 72rpx;
      border-radius: 20rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 34rpx;
      margin-bottom: 24rpx;
      
      &.orange-bg { background-color: rgba(255, 159, 127, 0.12); color: #FF9F7F; }
      &.yellow-bg { background-color: rgba(255, 200, 0, 0.12); color: #FFC800; }
      &.pink-bg   { background-color: rgba(255, 99, 132, 0.12); color: #FF6384; }
      &.blue-bg   { background-color: rgba(54, 162, 235, 0.12); color: #36A2EB; }
    }
    
    .card-title {
      font-size: 30rpx;
      font-weight: 600;
      color: $text-main;
      margin-bottom: 8rpx;
    }
    
    .card-desc {
      font-size: 22rpx;
      color: #B0B0B0;
    }
    
    /* 徽标 */
    .badge {
      position: absolute;
      top: 24rpx;
      right: 24rpx;
      background-color: $primary-color;
      color: #fff;
      font-size: 20rpx;
      font-weight: bold;
      padding: 4rpx 10rpx;
      border-radius: 20rpx;
    }
    
    .red-dot {
      position: absolute;
      top: 30rpx;
      right: 30rpx;
      width: 14rpx;
      height: 14rpx;
      background-color: #FF4D4F;
      border-radius: 50%;
      border: 2rpx solid #fff;
    }
  }
}

/* 3. 菜单列表 */
.menu-list {
  background-color: $card-bg;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  margin-bottom: 60rpx;
  
  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 34rpx 30rpx;
    border-bottom: 1rpx solid $border-color;
    
    &:last-child { border-bottom: none; }
    &.item-hover { background-color: #FAFAFA; }
    
    .menu-left {
      display: flex;
      align-items: center;
      .menu-icon {
        font-size: 32rpx;
        margin-right: 24rpx;
      }
      .menu-text {
        font-size: 28rpx;
        color: $text-main;
      }
    }
    .arrow {
      font-size: 24rpx;
      color: #D0D0D0;
    }
  }
}

/* 4. 底部 Slogan */
.footer-slogan {
  text-align: center;
  padding-bottom: 80rpx;
  opacity: 0.6;
  
  text {
    font-size: 22rpx;
    color: #CCC;
    letter-spacing: 4rpx;
  }
}
</style>