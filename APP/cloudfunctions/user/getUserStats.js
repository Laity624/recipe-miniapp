/**
 * 获取用户统计数据
 *
 * 功能描述：
 * 1. 实时查询用户的菜谱数量
 * 2. 实时查询用户的好友数量
 * 3. 实时查询用户获得的收藏数量（获赞数）
 *
 * 业务逻辑：
 * - 菜谱数量：查询 recipes 表，统计已发布且未删除的菜谱
 * - 好友数量：查询 friends 表，统计已同意的好友关系
 * - 获赞数量：查询所有自己的菜谱，累加 favoriteCount
 *
 * 数据库操作：
 * - 查询 recipes 表（统计菜谱数量）
 * - 查询 friends 表（统计好友数量）
 * - 查询 recipes 表（获取所有菜谱的 favoriteCount）
 *
 * 参数：
 * 无需参数，自动获取当前用户的 OPENID
 *
 * 返回：
 * @returns {Object} { success: true, data: { recipeCount, friendCount, favoriteCount } }
 *
 * 错误码：
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-09
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const { success, error } = require('./utils');

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 查询菜谱数量（已发布且未删除）
    const recipeCountResult = await db.collection('recipes')
      .where({
        _openid: OPENID,
        status: 1,
        isDeleted: false
      })
      .count();

    // 2. 查询好友数量（已同意的好友关系）
    const friendCountResult = await db.collection('friends')
      .where({
        status: 1,
        _: _.or([
          { fromOpenid: OPENID },
          { toOpenid: OPENID }
        ])
      })
      .count();

    // 3. 查询获赞数量（所有菜谱的 favoriteCount 总和）
    const recipesResult = await db.collection('recipes')
      .where({
        _openid: OPENID,
        isDeleted: false
      })
      .field({
        favoriteCount: true
      })
      .get();

    // 累加所有菜谱的 favoriteCount
    const favoriteCount = recipesResult.data.reduce((sum, recipe) => {
      return sum + (recipe.favoriteCount || 0);
    }, 0);

    // 4. 返回统计数据
    return success({
      recipeCount: recipeCountResult.total,
      friendCount: friendCountResult.total,
      favoriteCount
    });

  } catch (err) {
    console.error('[user/getUserStats] 获取统计数据失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
