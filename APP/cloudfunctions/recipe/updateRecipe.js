/**
 * 更新菜谱
 *
 * 功能描述：
 * 1. 更新菜谱信息
 * 2. 草稿和已发布状态都可编辑
 * 3. 更新 updateTime
 *
 * 业务逻辑：
 * - 权限校验：只能更新自己的菜谱
 * - 参数校验：recipeId 必填
 * - 更新菜谱信息，自动更新 updateTime
 *
 * 数据库操作：
 * - 查询 recipes 表（校验权限）
 * - 更新 recipes 表
 *
 * 参数：
 * @param {string} event.recipeId - 菜谱ID（必填）
 * @param {string} event.name - 菜名
 * @param {string} event.description - 描述
 * @param {Array<string>} event.images - 图片URL数组
 * @param {number} event.category - 分类枚举值
 * @param {number} event.taste - 口味枚举值
 * @param {number} event.cookingMethod - 烹饪方式枚举值
 * @param {number} event.cookingTime - 烹饪时间枚举值
 * @param {number} event.difficulty - 难度枚举值
 * @param {number} event.servings - 人数枚举值
 * @param {Array<Object>} event.ingredients - 食材列表
 * @param {Array<Object>} event.seasonings - 调料列表
 * @param {Array<Object>} event.steps - 步骤列表
 * @param {string} event.tips - 小技巧
 * @param {string} event.notes - 注意事项
 * @param {Array<string>} event.links - 外部链接数组
 * @param {number} event.isPublic - 是否公开
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
  const { recipeId, ...updateData } = event;
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
      return error('PERMISSION_DENIED', '无权限编辑此菜谱');
    }

    // 校验是否已删除
    if (recipe.isDeleted) {
      return error('NOT_FOUND', '菜谱已被删除');
    }

    // 3. 构建更新数据
    const updateFields = {};

    // 只更新传入的字段
    if (updateData.name !== undefined) {
      if (updateData.name.trim().length === 0 || updateData.name.length > 50) {
        return error('INVALID_PARAMS', '菜名长度必须在 1-50 个字符之间');
      }
      updateFields.name = updateData.name.trim();
    }

    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.images !== undefined) {
      if (updateData.images.length > 5) {
        return error('INVALID_PARAMS', '最多只能上传 5 张图片');
      }
      updateFields.images = updateData.images;
    }
    if (updateData.category !== undefined) updateFields.category = updateData.category;
    if (updateData.taste !== undefined) updateFields.taste = updateData.taste;
    if (updateData.cookingMethod !== undefined) updateFields.cookingMethod = updateData.cookingMethod;
    if (updateData.cookingTime !== undefined) updateFields.cookingTime = updateData.cookingTime;
    if (updateData.difficulty !== undefined) updateFields.difficulty = updateData.difficulty;
    if (updateData.servings !== undefined) updateFields.servings = updateData.servings;
    if (updateData.ingredients !== undefined) updateFields.ingredients = updateData.ingredients;
    if (updateData.seasonings !== undefined) updateFields.seasonings = updateData.seasonings;
    if (updateData.steps !== undefined) updateFields.steps = updateData.steps;
    if (updateData.tips !== undefined) updateFields.tips = updateData.tips;
    if (updateData.notes !== undefined) updateFields.notes = updateData.notes;
    if (updateData.links !== undefined) updateFields.links = updateData.links;
    if (updateData.isPublic !== undefined) updateFields.isPublic = updateData.isPublic;

    // 更新时间
    updateFields.updateTime = new Date();

    // 4. 更新菜谱
    await db.collection('recipes')
      .doc(recipeId)
      .update({
        data: updateFields
      });

    return success({});

  } catch (err) {
    console.error('[recipe/updateRecipe] 更新菜谱失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
