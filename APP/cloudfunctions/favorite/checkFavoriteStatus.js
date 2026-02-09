/**
 * 检查收藏状态
 *
 * 功能描述：
 * 1. 查询指定菜谱是否已被当前用户收藏
 *
 * 业务逻辑：
 * - 参数校验：recipeId 必填
 * - 查询 favorites 表
 * - 返回是否已收藏
 *
 * 数据库操作：
 * - 查询 favorites 表
 *
 * 参数：
 * @param {string} event.recipeId - 菜谱ID（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: { isFavorite: true/false } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-09
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { success, error, checkRequired } = require('./utils');

exports.main = async (event, context) => {
  const { recipeId } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 参数校验
    const requiredError = checkRequired({ recipeId }, ['recipeId']);
    if (requiredError) {
      return error('INVALID_PARAMS', requiredError);
    }

    // 2. 查询收藏记录
    const result = await db.collection('favorites')
      .where({
        _openid: OPENID,
        recipeId: recipeId
      })
      .limit(1)
      .get();

    return success({
      isFavorite: result.data.length > 0
    });

  } catch (err) {
    console.error('[favorite/checkFavoriteStatus] 查询收藏状态失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
