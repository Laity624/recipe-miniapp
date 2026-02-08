/**
 * 删除菜谱（软删除）
 *
 * 功能描述：
 * 1. 软删除菜谱（设置 isDeleted = true）
 * 2. 如果是已发布状态，减少用户的 recipeCount
 *
 * 业务逻辑：
 * - 权限校验：只能删除自己的菜谱
 * - 参数校验：recipeId 必填
 * - 软删除：设置 isDeleted = true
 * - 如果 status=1（已发布），减少用户的 recipeCount
 *
 * 数据库操作：
 * - 查询 recipes 表（校验权限）
 * - 更新 recipes 表（设置 isDeleted）
 * - 更新 users 表的 recipeCount（如果是发布状态）
 *
 * 参数：
 * @param {string} event.recipeId - 菜谱ID（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: {} }
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

    // 2. 查询菜谱，校验权限
    const recipeResult = await db.collection('recipes')
      .doc(recipeId)
      .get();

    if (!recipeResult.data) {
      return error('NOT_FOUND', '菜谱不存在');
    }

    const recipe = recipeResult.data;

    // 校验是否为创建者
    if (recipe._openid !== OPENID) {
      return error('PERMISSION_DENIED', '无权限删除此菜谱');
    }

    // 校验是否已删除
    if (recipe.isDeleted) {
      return error('NOT_FOUND', '菜谱已被删除');
    }

    // 3. 软删除菜谱
    await db.collection('recipes')
      .doc(recipeId)
      .update({
        data: {
          isDeleted: true,
          updateTime: new Date()
        }
      });

    // 4. 如果是已发布状态，减少用户的 recipeCount
    if (recipe.status === 1) {
      await db.collection('users')
        .where({ _openid: OPENID })
        .update({
          data: {
            recipeCount: db.command.inc(-1)
          }
        });
    }

    return success({});

  } catch (err) {
    console.error('[recipe/deleteRecipe] 删除菜谱失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
