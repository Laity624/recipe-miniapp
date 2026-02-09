/**
 * 收藏模块云函数
 *
 * 功能列表：
 * - addFavorite: 收藏菜谱
 * - removeFavorite: 取消收藏
 * - getFavoriteList: 获取收藏列表（支持筛选和排序）
 * - checkFavoriteStatus: 检查收藏状态
 *
 * 调用方式：
 * wx.cloud.callFunction({
 *   name: 'favorite',
 *   data: {
 *     action: 'addFavorite',
 *     recipeId: 'xxx',
 *     ...
 *   }
 * })
 *
 * @module cloudfunctions/favorite
 * @author Claude
 * @date 2026-02-09
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 动态路由映射
const handlers = {
  addFavorite: require('./addFavorite'),
  removeFavorite: require('./removeFavorite'),
  getFavoriteList: require('./getFavoriteList'),
  checkFavoriteStatus: require('./checkFavoriteStatus')
};

exports.main = async (event, context) => {
  const { action } = event;

  // 验证 action
  if (!action || !handlers[action]) {
    return {
      success: false,
      errorCode: 'INVALID_ACTION',
      errorMessage: `无效的操作: ${action}`
    };
  }

  try {
    // 调用对应的处理函数
    return await handlers[action].main(event, context);
  } catch (err) {
    console.error(`[favorite/${action}] 执行失败:`, err);
    return {
      success: false,
      errorCode: 'SYSTEM_ERROR',
      errorMessage: '系统错误'
    };
  }
};
