/**
 * 创建菜谱
 *
 * 功能描述：
 * 1. 创建新的菜谱记录
 * 2. 默认状态为草稿（status=0），默认私密（isPublic=0）
 * 3. 如果创建时就是发布状态，更新用户的 recipeCount
 *
 * 业务逻辑：
 * - 参数校验：必填字段（name）
 * - 创建菜谱记录，自动添加 _openid、createTime、updateTime
 * - 如果 status=1（已发布），使用事务更新用户的 recipeCount
 *
 * 数据库操作：
 * - 插入 recipes 表
 * - 更新 users 表的 recipeCount（如果是发布状态）
 *
 * 参数：
 * @param {string} event.name - 菜名（必填）
 * @param {string} event.description - 描述
 * @param {Array<string>} event.images - 图片URL数组（最多5张）
 * @param {number} event.category - 分类枚举值
 * @param {number} event.taste - 口味枚举值
 * @param {number} event.cookingMethod - 烹饪方式枚举值
 * @param {number} event.cookingTime - 烹饪时间枚举值
 * @param {number} event.difficulty - 难度枚举值
 * @param {number} event.servings - 人数枚举值
 * @param {Array<Object>} event.ingredients - 食材列表 [{name, amount}]
 * @param {Array<Object>} event.seasonings - 调料列表 [{name, amount}]
 * @param {Array<Object>} event.steps - 步骤列表 [{order, content, image}]
 * @param {string} event.tips - 小技巧
 * @param {string} event.notes - 注意事项
 * @param {Array<string>} event.links - 外部链接数组
 * @param {number} event.status - 状态（0=草稿, 1=已发布），默认0
 * @param {number} event.isPublic - 是否公开（0=私密, 1=公开），默认0
 *
 * 返回：
 * @returns {Object} { success: true, data: { recipeId } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
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
  const {
    name,
    description = '',
    images = [],
    category,
    taste,
    cookingMethod,
    cookingTime,
    difficulty,
    servings,
    ingredients = [],
    seasonings = [],
    steps = [],
    tips = '',
    notes = '',
    links = [],
    status = 0,
    isPublic = 0
  } = event;

  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 参数校验
    const requiredError = checkRequired({ name }, ['name']);
    if (requiredError) {
      return error('INVALID_PARAMS', requiredError);
    }

    // 校验菜名长度
    if (name.trim().length === 0 || name.length > 50) {
      return error('INVALID_PARAMS', '菜名长度必须在 1-50 个字符之间');
    }

    // 校验图片数量
    if (images.length > 5) {
      return error('INVALID_PARAMS', '最多只能上传 5 张图片');
    }

    // 2. 创建菜谱记录
    const now = new Date();
    const recipeData = {
      _openid: OPENID,
      status,
      isPublic,
      isDeleted: false,
      name: name.trim(),
      description,
      images,
      category,
      taste,
      cookingMethod,
      cookingTime,
      difficulty,
      servings,
      ingredients,
      seasonings,
      steps,
      tips,
      notes,
      links,
      favoriteCount: 0,
      createTime: now,
      updateTime: now
    };

    const createResult = await db.collection('recipes').add({
      data: recipeData
    });

    // 3. 如果是发布状态，更新用户的 recipeCount
    if (status === 1) {
      await db.collection('users')
        .where({ _openid: OPENID })
        .update({
          data: {
            recipeCount: db.command.inc(1)
          }
        });
    }

    return success({
      recipeId: createResult._id
    });

  } catch (err) {
    console.error('[recipe/createRecipe] 创建菜谱失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
