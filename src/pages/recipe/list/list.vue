<template>
  <view class="list-page">
    <view class="tabs">
      <view class="tab-item" :class="{ active: activeTab === 0 }" @click="activeTab = 0">
        <text>全部</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 1 }" @click="activeTab = 1">
        <text>已发布</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 2 }" @click="activeTab = 2">
        <text>草稿</text>
      </view>
    </view>
    <view class="content">
      <text class="empty-text">暂无菜谱</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const activeTab = ref(0)
</script>

<style scoped>
.list-page {
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
</style>
