/**
 * 收藏菜谱
 *
 * 功能描述：
 * 1. 校验菜谱是否存在、是否已发布
 * 2. 校验权限（好友关系或自己的菜谱）
 * 3. 检查是否已收藏（避免重复）
 * 4. 创建 favorites 记录
 * 5. 原子操作更新 favoriteCount（菜谱 + 创建者）
 *
 * 业务逻辑：
 * - 参数校验：recipeId 必填
 * - 查询菜谱信息，校验状态（status=1, isDeleted=false）
 * - 权限校验：
 *   - 自己的菜谱：可以收藏
 *   - 好友的菜谱：必须是公开的（isPublic=1）且是好友关系
 * - 检查是否已收藏
 * - 创建收藏记录
 * - 更新计数（菜谱的 favoriteCount 和创建者的 favoriteCount）
 *
 * 数据库操作：
 * - 查询 recipes 表
 * - 查询 friends 表（校验好友关系）
 * - 查询 favorites 表（检查是否已收藏）
 * - 插入 favorites 表
 * - 更新 recipes 表的 favoriteCount
 * - 更新 users 表的 favoriteCount
 *
 * 参数：
 * @param {string} event.recipeId - 菜谱ID（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: { favoriteId } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - RECIPE_NOT_FOUND: 菜谱不存在
 * - RECIPE_NOT_PUBLISHED: 菜谱未发布
 * - PERMISSION_DENIED: 权限不足
 * - ALREADY_FAVORITED: 已收藏
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

    // 2. 查询菜谱信息
    const recipeResult = await db.collection('recipes')
      .doc(recipeId)
      .get();

    if (!recipeResult.data) {
      return error('RECIPE_NOT_FOUND', '菜谱不存在');
    }

    const recipe = recipeResult.data;

    // 3. 校验菜谱状态
    if (recipe.isDeleted) {
      return error('RECIPE_NOT_FOUND', '菜谱已被删除');
    }

    if (recipe.status !== 1) {
      return error('RECIPE_NOT_PUBLISHED', '菜谱未发布');
    }

    // 4. 权限校验
    const recipeOpenid = recipe._openid;

    // 如果不是自己的菜谱，需要校验权限
    if (recipeOpenid !== OPENID) {
      // 必须是公开的菜谱
      if (recipe.isPublic !== 1) {
        return error('PERMISSION_DENIED', '该菜谱为私密，无法收藏');
      }

      // 校验好友关系
      const friendResult = await db.collection('friends')
        .where(_.or([
          { fromOpenid: OPENID, toOpenid: recipeOpenid, status: 1 },
          { fromOpenid: recipeOpenid, toOpenid: OPENID, status: 1 }
        ]))
        .limit(1)
        .get();

      if (friendResult.data.length === 0) {
        return error('PERMISSION_DENIED', '只能收藏好友的菜谱');
      }
    }

    // 5. 检查是否已收藏
    const existResult = await db.collection('favorites')
      .where({
        _openid: OPENID,
        recipeId: recipeId
      })
      .limit(1)
      .get();

    if (existResult.data.length > 0) {
      return error('ALREADY_FAVORITED', '已收藏该菜谱');
    }

    // 6. 创建收藏记录
    const addResult = await db.collection('favorites').add({
      data: {
        _openid: OPENID,
        recipeId: recipeId,
        recipeOpenid: recipeOpenid,
        createTime: new Date()
      }
    });

    // 7. 更新菜谱的 favoriteCount
    await db.collection('recipes')
      .doc(recipeId)
      .update({
        data: {
          favoriteCount: _.inc(1)
        }
      });

    // 8. 更新创建者的 favoriteCount
    await db.collection('users')
      .where({ _openid: recipeOpenid })
      .update({
        data: {
          favoriteCount: _.inc(1)
        }
      });

    return success({ favoriteId: addResult._id });

  } catch (err) {
    console.error('[favorite/addFavorite] 收藏菜谱失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
