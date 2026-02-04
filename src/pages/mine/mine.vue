<template>
  <view class="mine-page">
    <view class="header">
      <view class="user-info">
        <image class="avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ userInfo.nickname || '未登录' }}</text>
          <text class="identity-code">身份码: {{ userInfo.identityCode || '-' }}</text>
        </view>
      </view>
      <view class="bio">{{ userInfo.bio || '这个人很懒，什么都没写~' }}</view>
      <view class="stats">
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.recipeCount || 0 }}</text>
          <text class="stat-label">菜谱</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.friendCount || 0 }}</text>
          <text class="stat-label">好友</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.favoriteCount || 0 }}</text>
          <text class="stat-label">获赞</text>
        </view>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="navigateTo('/pages/recipe/list/list')">
        <text class="menu-icon">📖</text>
        <text class="menu-title">我的菜谱</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/favorite/favorite')">
        <text class="menu-icon">⭐</text>
        <text class="menu-title">我的收藏</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/friend/list/list')">
        <text class="menu-icon">👥</text>
        <text class="menu-title">好友管理</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userInfo = ref({
  nickname: '美食家',
  avatarUrl: '',
  identityCode: 'ABC123',
  bio: '热爱烹饪，分享美食',
  recipeCount: 0,
  friendCount: 0,
  favoriteCount: 0
})

const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
