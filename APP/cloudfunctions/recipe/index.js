/**
 * 菜谱模块云函数
 *
 * 功能列表：
 * - createRecipe: 创建菜谱
 * - updateRecipe: 更新菜谱
 * - deleteRecipe: 删除菜谱（软删除）
 * - publishRecipe: 发布菜谱
 * - getRecipeDetail: 获取菜谱详情
 * - searchRecipes: 搜索菜谱
 * - getRecipeCounts: 获取菜谱数量统计
 *
 * 调用方式：
 * wx.cloud.callFunction({
 *   name: 'recipe',
 *   data: {
 *     action: 'createRecipe',
 *     name: '宫保鸡丁',
 *     ...
 *   }
 * })
 *
 * @module cloudfunctions/recipe
 * @author Claude
 * @date 2026-02-06
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 动态路由映射
const handlers = {
  createRecipe: require('./createRecipe'),
  updateRecipe: require('./updateRecipe'),
  deleteRecipe: require('./deleteRecipe'),
  publishRecipe: require('./publishRecipe'),
  getRecipeDetail: require('./getRecipeDetail'),
  searchRecipes: require('./searchRecipes'),
  getRecipeCounts: require('./getRecipeCounts')
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
    console.error(`[recipe/${action}] 执行失败:`, err);
    return {
      success: false,
      errorCode: 'SYSTEM_ERROR',
      errorMessage: '系统错误'
    };
  }
};
