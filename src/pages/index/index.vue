<template>
  <view class="recipe-page">
    <view class="search-bar">
      <input class="search-input" placeholder="搜索菜谱" placeholder-style="color: #999" />
    </view>

    <view class="filter-bar">
      <text class="filter-item">全部分类</text>
      <text class="filter-item">全部口味</text>
      <text class="filter-item">烹饪方式</text>
    </view>

    <view class="recipe-list">
      <view class="empty-tip">
        <text class="empty-text">暂无菜谱</text>
        <text class="empty-desc">快去创建你的第一个菜谱吧~</text>
      </view>
    </view>

    <view class="add-btn" @click="createRecipe">
      <text class="add-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const createRecipe = () => {
  uni.navigateTo({
    url: '/pages/recipe/edit/edit'
  })
}
</script>

<style scoped>
.recipe-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 100rpx;
}

.search-bar {
  padding: 20rpx;
  background-color: #fff;
}

.search-input {
  height: 70rpx;
  background-color: #f5f5f5;
  border-radius: 35rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.filter-bar {
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  margin-top: 2rpx;
}

.filter-item {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

.recipe-list {
  padding: 20rpx;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #ccc;
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
