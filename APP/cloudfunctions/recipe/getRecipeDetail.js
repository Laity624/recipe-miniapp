/**
 * 获取菜谱详情
 *
 * 功能描述：
 * 1. 获取菜谱的完整信息
 * 2. 进行权限校验（草稿/私密/公开的访问权限）
 * 3. 查询收藏状态
 * 4. 查询作者信息
 *
 * 业务逻辑：
 * - 参数校验：recipeId 必填
 * - 查询菜谱信息
 * - 权限校验：
 *   - 草稿状态（status=0）：仅创建者可见
 *   - 已发布+私密（status=1, isPublic=0）：仅创建者可见
 *   - 已发布+公开（status=1, isPublic=1）：所有好友可见
 *   - 软删除（isDeleted=true）：任何人都不可见
 * - 查询收藏状态
 * - 查询作者信息
 * - 返回完整菜谱信息
 *
 * 数据库操作：
 * - 查询 recipes 表
 * - 查询 friends 表（校验好友关系）
 * - 查询 favorites 表（查询收藏状态）
 * - 查询 users 表（查询作者信息）
 *
 * 参数：
 * @param {string} event.recipeId - 菜谱ID（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: { recipe, canEdit, isFavorite, author } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - NOT_FOUND: 菜谱不存在
 * - PERMISSION_DENIED: 权限不足
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-06
 * @updated 2026-02-09 添加收藏状态查询和作者信息查询
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

    // 5. 查询收藏状态
    const favoriteResult = await db.collection('favorites')
      .where({
        _openid: OPENID,
        recipeId: recipeId
      })
      .limit(1)
      .get();

    const isFavorite = favoriteResult.data.length > 0;

    // 6. 查询作者信息
    const authorResult = await db.collection('users')
      .where({
        _openid: recipe._openid
      })
      .field({
        nickName: true,
        avatarUrl: true
      })
      .limit(1)
      .get();

    const author = authorResult.data[0] || {};

    // 7. 返回菜谱信息（包含收藏状态和作者信息）
    return success({
      recipe,
      canEdit: permission.canEdit,
      isFavorite,
      author: {
        nickname: author.nickName || '未知用户',
        avatarUrl: author.avatarUrl || ''
      }
    });

  } catch (err) {
    console.error('[recipe/getRecipeDetail] 获取菜谱详情失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
