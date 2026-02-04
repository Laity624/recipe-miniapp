<template>
  <view class="page-container">
    
    <!-- 1. 顶部吸顶区域 (搜索 + 筛选) -->
    <view class="sticky-header">
      <!-- 搜索栏 -->
      <view class="search-bar-box">
        <view class="search-input-bg">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input" 
            placeholder="搜索菜谱、食材..." 
            placeholder-class="placeholder-style"
            confirm-type="search"
          />
        </view>
      </view>

      <!-- 横向滚动筛选标签 -->
      <scroll-view class="filter-scroll" scroll-x :show-scrollbar="false">
        <view class="filter-list">
          <view 
            v-for="(tag, index) in tags" 
            :key="index"
            class="filter-tag"
            :class="{ active: currentTag === index }"
            @click="selectTag(index)"
          >
            {{ tag }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 占位符，防止内容被吸顶头部遮挡 -->
    <view class="header-placeholder"></view>

    <!-- 2. 瀑布流内容区 -->
    <view class="waterfall-container">
      <!-- 左列 -->
      <view class="column">
        <view 
          class="recipe-card" 
          v-for="(item, index) in leftList" 
          :key="item.id"
          @click="goToDetail(item)"
          hover-class="card-hover"
        >
          <!-- 图片容器 -->
          <view class="image-wrapper">
            <image :src="item.image" mode="widthFix" class="recipe-img"></image>
            <!-- 巧思：左下角显示时间和难度 -->
            <view class="info-tag-overlay">
              <text>{{ item.time }} · {{ item.difficulty }}</text>
            </view>
          </view>
          
          <!-- 内容区 -->
          <view class="card-content">
            <text class="recipe-title">{{ item.title }}</text>
            
            <!-- 作者与热度 -->
            <view class="author-row">
              <view class="author-left">
                <image :src="item.avatar" class="author-avatar"></image>
                <text class="author-name">{{ item.author }}</text>
              </view>
              <view class="like-right">
                <text class="heart-icon">❤️</text>
                <text class="like-count">{{ item.likes }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 右列 -->
      <view class="column">
        <view 
          class="recipe-card" 
          v-for="(item, index) in rightList" 
          :key="item.id"
          @click="goToDetail(item)"
          hover-class="card-hover"
        >
          <view class="image-wrapper">
            <image :src="item.image" mode="widthFix" class="recipe-img"></image>
            <view class="info-tag-overlay">
              <text>{{ item.time }} · {{ item.difficulty }}</text>
            </view>
          </view>
          
          <view class="card-content">
            <text class="recipe-title">{{ item.title }}</text>
            
            <view class="author-row">
              <view class="author-left">
                <image :src="item.avatar" class="author-avatar"></image>
                <text class="author-name">{{ item.author }}</text>
              </view>
              <view class="like-right">
                <text class="heart-icon">❤️</text>
                <text class="like-count">{{ item.likes }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 悬浮创作按钮 (FAB) -->
    <view class="fab-btn" hover-class="fab-hover" @click="createRecipe">
      <text class="plus-icon">＋</text>
    </view>

    <!-- 底部加载更多提示 -->
    <view class="loading-text">—— 唯有美食不可辜负 ——</view>

  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// --- 数据定义 ---
const currentTag = ref(0);
const tags = ['全部', '家常菜', '快手餐', '减脂餐', '烘焙', '汤羹', '川菜', '粤菜'];

// 模拟原始数据
const rawList = [
  { id: 1, title: '超级下饭的番茄土豆炖牛腩，汤汁浓郁！', image: 'https://picsum.photos/300/400?random=1', time: '40分钟', difficulty: '中等', author: '小厨娘', avatar: 'https://picsum.photos/50?random=1', likes: 120 },
  { id: 2, title: '10分钟快手早餐，营养又美味', image: 'https://picsum.photos/300/300?random=2', time: '10分钟', difficulty: '简单', author: '早餐达人', avatar: 'https://picsum.photos/50?random=2', likes: 85 },
  { id: 3, title: '零失败戚风蛋糕教程', image: 'https://picsum.photos/300/500?random=3', time: '60分钟', difficulty: '困难', author: '烘焙王', avatar: 'https://picsum.photos/50?random=3', likes: 230 },
  { id: 4, title: '清爽解腻的凉拌黄瓜', image: 'https://picsum.photos/300/350?random=4', time: '5分钟', difficulty: '简单', author: '阿强', avatar: 'https://picsum.photos/50?random=4', likes: 45 },
  { id: 5, title: '红烧肉', image: 'https://picsum.photos/300/420?random=5', time: '90分钟', difficulty: '中等', author: '姥姥的味道', avatar: 'https://picsum.photos/50?random=5', likes: 999 },
  { id: 6, title: '减脂沙拉', image: 'https://picsum.photos/300/280?random=6', time: '10分钟', difficulty: '简单', author: 'FitLife', avatar: 'https://picsum.photos/50?random=6', likes: 12 }
];

// 左右两列数据 (简单的左右分发逻辑，实际开发中可以根据图片高度计算)
const leftList = ref([]);
const rightList = ref([]);

// --- 生命周期与方法 ---

onMounted(() => {
  distributeData();
});

// 将数据简单的分配给左右两列
const distributeData = () => {
  rawList.forEach((item, index) => {
    if (index % 2 === 0) {
      leftList.value.push(item);
    } else {
      rightList.value.push(item);
    }
  });
};

const selectTag = (index) => {
  currentTag.value = index;
  // 这里添加筛选逻辑...
};

const goToDetail = (item) => {
  console.log('查看详情', item.id);
};

const createRecipe = () => {
  console.log('创建菜谱');
};
</script>

<style lang="scss" scoped>
/* 变量保持不变 */
$primary-color: #FF9F7F;
$bg-color: #FAFAF8;
$card-bg: #FFFFFF;
$text-main: #333333;
$text-sub: #999999;

.page-container {
  min-height: 100vh;
  background-color: $bg-color;
  padding: 24rpx; /* 增加一点全局边距 */
  box-sizing: border-box;
}

/* 1. 顶部吸顶区域优化 */
.sticky-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(250, 250, 248, 0.98); /* 不透明度提高一点，防杂乱 */
  backdrop-filter: blur(12px);
  z-index: 999;
  padding-top: 10rpx; 
}

.search-bar-box {
  padding: 10rpx 24rpx; /* 与全局边距对齐 */
}

.search-input-bg {
  background-color: #FFF; /* 改为纯白背景 */
  border: 1rpx solid #F0F0F0; /* 加一个极淡的边框 */
  height: 80rpx; /* 稍微加高一点，更大气 */
  border-radius: 40rpx; 
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02); /* 加一点点阴影 */
  
  .search-icon {
    font-size: 30rpx;
    margin-right: 16rpx;
    color: #CCC; /* 图标颜色更淡 */
  }
  
  .search-input {
    flex: 1;
    font-size: 28rpx;
    color: $text-main;
  }
}

/* 筛选标签优化 */
.filter-scroll {
  width: 100%;
  white-space: nowrap;
  padding: 24rpx 0; /* 增加上下间距 */
  
  .filter-list {
    display: flex;
    padding: 0 24rpx;
    
    .filter-tag {
      display: inline-block;
      padding: 14rpx 36rpx; /* 标签大一点，好点 */
      background-color: #FFF;
      color: #666;
      font-size: 26rpx;
      border-radius: 34rpx;
      margin-right: 20rpx;
      border: 1rpx solid transparent; /* 预留边框位 */
      
      &.active {
        background-color: $primary-color;
        color: #FFFFFF;
        font-weight: 600;
        box-shadow: 0 6rpx 16rpx rgba(255, 159, 127, 0.35); /* 阴影更柔和 */
      }
    }
  }
}

.header-placeholder {
  height: 200rpx; /* 调整高度以匹配 header */
}

/* 2. 瀑布流布局优化 */
.waterfall-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  /* padding 已经在 container 设置了，这里去掉 */
  
  .column {
    width: 48%;
    display: flex;
    flex-direction: column;
  }
}

.recipe-card {
  background-color: $card-bg;
  border-radius: 24rpx; /* 圆角更大 */
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.04); /* 阴影更扩散，不生硬 */
  will-change: transform;
  
  &.card-hover {
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 30rpx rgba(0,0,0,0.08);
    transition: all 0.2s ease;
  }
  
  .image-wrapper {
    position: relative;
    width: 100%;
    
    .recipe-img {
      width: 100%;
      display: block;
    }
    
    /* --- 重点优化：图片上的标签 --- */
    .info-tag-overlay {
      position: absolute;
      bottom: 16rpx;
      left: 16rpx;
      /* 方案：使用毛玻璃效果，颜色变淡 */
      background: rgba(0, 0, 0, 0.45); 
      backdrop-filter: blur(4px); 
      padding: 8rpx 16rpx;
      border-radius: 20rpx; /* 更圆润 */
      display: flex;
      align-items: center;
      border: 1rpx solid rgba(255,255,255,0.1); /* 极细的内发光描边 */
      
      text {
        color: #fff;
        font-size: 20rpx;
        font-weight: 500;
        letter-spacing: 1rpx;
      }
    }
  }
  
  .card-content {
    padding: 24rpx 20rpx; /* 增加内边距 */
    
    /* --- 重点优化：标题排版 --- */
    .recipe-title {
      font-size: 30rpx; /* 字号微调 */
      font-weight: 600;
      color: $text-main;
      line-height: 1.5; /* 增加行高，呼吸感 */
      margin-bottom: 20rpx; /* 标题和作者栏拉开距离 */
      text-align: justify; /* 两端对齐更整齐 */
      
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    
    .author-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .author-left {
        display: flex;
        align-items: center;
        
        .author-avatar {
          width: 40rpx; /* 头像稍微大一点 */
          height: 40rpx;
          border-radius: 50%;
          margin-right: 12rpx;
          background-color: #EEE;
        }
        
        .author-name {
          font-size: 22rpx;
          color: #888; /* 颜色更淡 */
          max-width: 140rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      
      .like-right {
        display: flex;
        align-items: center;
        opacity: 0.8;
        
        .heart-icon {
          font-size: 24rpx; /* 爱心稍微大一点 */
          margin-right: 6rpx;
          color: #FF6B6B; /* 爱心改用专门的红，不要用默认Emoji颜色 */
        }
        
        .like-count {
          font-size: 24rpx;
          color: #999;
          font-family: 'Nunito', sans-serif; /* 如果有圆润数字字体 */
        }
      }
    }
  }
}

/* 3. 悬浮按钮位置修正 */
.fab-btn {
  position: fixed;
  right: 40rpx; /* 离右边远一点 */
  bottom: 140rpx; /* 离底部远一点（避开TabBar区域） */
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #FF9F7F, #FF8E66);
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba(255, 159, 127, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  
  .plus-icon {
    font-size: 56rpx;
    color: #fff;
    font-weight: 300;
    margin-top: -6rpx;
  }
}

.loading-text {
  text-align: center;
  padding: 40rpx 0 60rpx 0;
  color: #DDD;
  font-size: 22rpx;
}
</style>