/**
 * 发布菜谱
 *
 * 功能描述：
 * 1. 将菜谱状态从草稿（status=0）改为已发布（status=1）
 * 2. 增加用户的 recipeCount
 *
 * 业务逻辑：
 * - 权限校验：只能发布自己的菜谱
 * - 参数校验：recipeId 必填
 * - 状态校验：只有草稿状态才能发布
 * - 内容校验：发布时必须填写完整信息（菜名、描述、至少一张图片、至少一个步骤）
 * - 更新 status = 1
 * - 增加用户的 recipeCount
 *
 * 数据库操作：
 * - 查询 recipes 表（校验权限和状态）
 * - 更新 recipes 表（设置 status）
 * - 更新 users 表的 recipeCount
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
 * - INVALID_STATUS: 状态错误（已发布的菜谱不能重复发布）
 * - INCOMPLETE_INFO: 信息不完整（发布时必须填写完整信息）
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
      return error('PERMISSION_DENIED', '无权限发布此菜谱');
    }

    // 校验是否已删除
    if (recipe.isDeleted) {
      return error('NOT_FOUND', '菜谱已被删除');
    }

    // 校验状态：只有草稿状态才能发布
    if (recipe.status === 1) {
      return error('INVALID_STATUS', '该菜谱已发布');
    }

    // 3. 内容完整性校验
    if (!recipe.name || recipe.name.trim().length === 0) {
      return error('INCOMPLETE_INFO', '请填写菜名');
    }

    if (!recipe.description || recipe.description.trim().length === 0) {
      return error('INCOMPLETE_INFO', '请填写菜谱描述');
    }

    if (!recipe.images || recipe.images.length === 0) {
      return error('INCOMPLETE_INFO', '请至少上传一张图片');
    }

    if (!recipe.steps || recipe.steps.length === 0) {
      return error('INCOMPLETE_INFO', '请至少添加一个步骤');
    }

    // 4. 更新菜谱状态
    await db.collection('recipes')
      .doc(recipeId)
      .update({
        data: {
          status: 1,
          updateTime: new Date()
        }
      });

    // 5. 增加用户的 recipeCount
    await db.collection('users')
      .where({ _openid: OPENID })
      .update({
        data: {
          recipeCount: db.command.inc(1)
        }
      });

    return success({});

  } catch (err) {
    console.error('[recipe/publishRecipe] 发布菜谱失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
