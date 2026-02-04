<template>
  <view class="favorite-page">
    <view class="list">
      <text class="empty-text">暂无收藏</text>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style scoped>
.favorite-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.list {
  padding: 200rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
