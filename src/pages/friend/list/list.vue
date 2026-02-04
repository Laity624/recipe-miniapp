<template>
  <view class="friend-list-page">
    <view class="tabs">
      <view class="tab-item" :class="{ active: activeTab === 0 }" @click="activeTab = 0">
        <text>好友列表</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 1 }" @click="activeTab = 1">
        <text>好友申请</text>
      </view>
    </view>
    <view class="content">
      <text class="empty-text">暂无好友</text>
    </view>
    <view class="add-btn" @click="searchFriend">
      <text class="add-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const activeTab = ref(0)

const searchFriend = () => {
  uni.navigateTo({
    url: '/pages/friend/search/search'
  })
}
</script>

<style scoped>
.friend-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.tabs {
  display: flex;
  background-color: #fff;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 28rpx;
  color: #666;
}

.tab-item.active {
  color: #ff6b6b;
  border-bottom: 4rpx solid #ff6b6b;
}

.content {
  padding: 200rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #ff6b6b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.4);
}

.add-icon {
  font-size: 60rpx;
  color: #fff;
  line-height: 1;
}
</style>
