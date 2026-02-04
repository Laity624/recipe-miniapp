<template>
  <view class="login-container">
    <!-- 顶部Logo区域 -->
    <view class="logo-section">
      <view class="logo-icon">🍳</view>
      <view class="app-name">个人菜谱</view>
      <view class="app-slogan">记录美味，分享温暖</view>
    </view>

    <!-- 中间欢迎区域 -->
    <view class="welcome-section">
      <view class="welcome-title">欢迎使用</view>
      <view class="welcome-desc">
        <view class="desc-item">📖 记录专属菜谱</view>
        <view class="desc-item">👥 分享给好友</view>
        <view class="desc-item">❤️ 收藏喜欢的菜</view>
      </view>
    </view>

    <!-- 底部登录按钮 -->
    <view class="login-section">
      <button
        class="login-btn"
        @tap="handleLogin"
        hover-class="login-btn-hover"
      >
        <view class="btn-content">
          <text class="wechat-icon">💬</text>
          <text class="btn-text">微信登录</text>
        </view>
      </button>

      <view class="privacy-text">
        登录即表示同意
        <text class="link">《用户协议》</text>
        和
        <text class="link">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 登录加载状态
const isLoading = ref(false)

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true

    // TODO: 后续实现云函数调用
    // 1. 调用 wx.getUserProfile() 获取用户信息
    // 2. 调用 wx.login() 获取 code
    // 3. 调用云函数 login 处理登录逻辑

    // 临时模拟：直接跳转到首页
    uni.showToast({
      title: '登录功能开发中',
      icon: 'none',
      duration: 2000
    })

    // 模拟延迟后跳转
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }, 1500)

  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: $uni-bg-color;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 120rpx 60rpx 80rpx;
  box-sizing: border-box;
}

/* 顶部Logo区域 */
.logo-section {
  text-align: center;
  margin-top: 80rpx;

  .logo-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }

  .app-name {
    font-size: $uni-font-size-xxl;
    font-weight: 700;
    color: $uni-text-main;
    margin-bottom: 16rpx;
  }

  .app-slogan {
    font-size: $uni-font-size-sm;
    color: $uni-text-light;
  }
}

/* 中间欢迎区域 */
.welcome-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 60rpx 0;

  .welcome-title {
    font-size: $uni-font-size-xl;
    font-weight: 600;
    color: $uni-text-main;
    text-align: center;
    margin-bottom: 50rpx;
  }

  .welcome-desc {
    .desc-item {
      font-size: $uni-font-size-base;
      color: $uni-text-sub;
      line-height: 2;
      padding: 16rpx 0;
      text-align: center;
    }
  }
}

/* 底部登录区域 */
.login-section {
  .login-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #FF9F7F, #FF8E66);
    border-radius: $uni-radius-capsule;
    box-shadow: 0 8rpx 20rpx rgba(255, 159, 127, 0.3);
    border: none;
    padding: 0;
    margin-bottom: 30rpx;
    transition: all 0.3s ease;

    &::after {
      border: none;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;

      .wechat-icon {
        font-size: 40rpx;
        margin-right: 12rpx;
      }

      .btn-text {
        font-size: $uni-font-size-lg;
        font-weight: 600;
        color: #FFFFFF;
      }
    }
  }

  .login-btn-hover {
    transform: scale(0.98);
    opacity: 0.9;
  }

  .privacy-text {
    font-size: $uni-font-size-xs;
    color: $uni-text-light;
    text-align: center;
    line-height: 1.6;

    .link {
      color: $uni-color-primary;
    }
  }
}
</style>


