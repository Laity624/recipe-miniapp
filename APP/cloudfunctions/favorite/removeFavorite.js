/**
 * 取消收藏
 *
 * 功能描述：
 * 1. 校验收藏记录是否存在
 * 2. 删除收藏记录
 * 3. 原子操作减少 favoriteCount（菜谱 + 创建者）
 *
 * 业务逻辑：
 * - 参数校验：recipeId 必填
 * - 查询收藏记录
 * - 校验权限：只能取消自己的收藏
 * - 删除收藏记录
 * - 更新计数（菜谱的 favoriteCount 和创建者的 favoriteCount）
 *
 * 数据库操作：
 * - 查询 favorites 表
 * - 删除 favorites 表
 * - 更新 recipes 表的 favoriteCount
 * - 更新 users 表的 favoriteCount
 *
 * 参数：
 * @param {string} event.recipeId - 菜谱ID（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: {} }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - FAVORITE_NOT_FOUND: 收藏记录不存在
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-09
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
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
    const favoriteResult = await db.collection('favorites')
      .where({
        _openid: OPENID,
        recipeId: recipeId
      })
      .limit(1)
      .get();

    if (favoriteResult.data.length === 0) {
      return error('FAVORITE_NOT_FOUND', '收藏记录不存在');
    }

    const favorite = favoriteResult.data[0];

    // 3. 删除收藏记录
    await db.collection('favorites')
      .doc(favorite._id)
      .remove();

    // 4. 更新菜谱的 favoriteCount
    await db.collection('recipes')
      .doc(recipeId)
      .update({
        data: {
          favoriteCount: _.inc(-1)
        }
      });

    // 5. 更新创建者的 favoriteCount
    await db.collection('users')
      .where({ _openid: favorite.recipeOpenid })
      .update({
        data: {
          favoriteCount: _.inc(-1)
        }
      });

    return success({});

  } catch (err) {
    console.error('[favorite/removeFavorite] 取消收藏失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
