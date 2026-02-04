<template>
  <view class="search-page">
    <view class="search-bar">
      <input class="search-input" placeholder="输入身份码或昵称" v-model="keyword" />
      <button class="search-btn" @click="search">搜索</button>
    </view>
    <view class="result">
      <text class="empty-text">请输入身份码或昵称搜索用户</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const keyword = ref('')

const search = () => {
  console.log('搜索:', keyword.value)
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  gap: 20rpx;
}

.search-input {
  flex: 1;
  height: 70rpx;
  background-color: #f5f5f5;
  border-radius: 35rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.search-btn {
  width: 140rpx;
  height: 70rpx;
  background-color: #ff6b6b;
  color: #fff;
  border-radius: 35rpx;
  font-size: 28rpx;
  line-height: 70rpx;
  padding: 0;
}

.result {
  padding: 200rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
