/**
 * 获取菜谱详情
 *
 * 功能描述：
 * 1. 获取菜谱的完整信息
 * 2. 进行权限校验（草稿/私密/公开的访问权限）
 *
 * 业务逻辑：
 * - 参数校验：recipeId 必填
 * - 查询菜谱信息
 * - 权限校验：
 *   - 草稿状态（status=0）：仅创建者可见
 *   - 已发布+私密（status=1, isPublic=0）：仅创建者可见
 *   - 已发布+公开（status=1, isPublic=1）：所有好友可见
 *   - 软删除（isDeleted=true）：任何人都不可见
 * - 返回完整菜谱信息
 *
 * 数据库操作：
 * - 查询 recipes 表
 * - 查询 friends 表（校验好友关系）
 *
 * 参数：
 * @param {string} event.recipeId - 菜谱ID（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: { recipe } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - NOT_FOUND: 菜谱不存在
 * - PERMISSION_DENIED: 权限不足
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-06
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { success, error, checkRequired, checkRecipePermission, checkFriendship } = require('./utils');

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
      return error('NOT_FOUND', '菜谱不存在');
    }

    const recipe = recipeResult.data;

    // 3. 校验好友关系
    const isFriend = await checkFriendship(recipe._openid, OPENID);

    // 4. 权限校验
    const permission = checkRecipePermission(
      recipe._openid,
      OPENID,
      recipe.status,
      recipe.isPublic,
      recipe.isDeleted,
      isFriend
    );

    if (!permission.canView) {
      return error('PERMISSION_DENIED', permission.message);
    }

    // 5. 返回菜谱信息
    return success({
      recipe,
      canEdit: permission.canEdit
    });

  } catch (err) {
    console.error('[recipe/getRecipeDetail] 获取菜谱详情失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
