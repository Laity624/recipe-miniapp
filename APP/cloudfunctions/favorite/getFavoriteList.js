/**
 * 获取收藏列表
 *
 * 功能描述：
 * 1. 支持分页加载
 * 2. 支持筛选（分类、口味、烹饪方式、关键词）
 * 3. 按收藏时间排序（倒序）
 * 4. 联表查询菜谱详细信息
 * 5. 标记菜谱状态（已删除/私密）
 *
 * 业务逻辑：
 * - 参数校验：page, pageSize 可选（默认值：page=1, pageSize=20）
 * - 查询当前用户的收藏记录（带分页）
 * - 获取 recipeId 列表
 * - 批量查询菜谱信息（带筛选条件）
 * - 批量查询作者信息
 * - 组合数据并返回
 *
 * 数据库操作：
 * - 查询 favorites 表（分页、排序）
 * - 查询 recipes 表（批量、筛选）
 * - 查询 users 表（批量）
 *
 * 参数：
 * @param {number} event.page - 页码（可选，默认1）
 * @param {number} event.pageSize - 每页数量（可选，默认20）
 * @param {number} event.category - 分类（可选）
 * @param {number} event.taste - 口味（可选）
 * @param {number} event.cookingMethod - 烹饪方式（可选）
 * @param {string} event.keyword - 菜名关键词（可选）
 *
 * 返回：
 * @returns {Object} { success: true, data: { list, total, hasMore } }
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
  const {
    page = 1,
    pageSize = 20,
    category,
    taste,
    cookingMethod,
    keyword
  } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 参数处理
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSizeNum = Math.min(50, Math.max(1, parseInt(pageSize) || 20));
    const skip = (pageNum - 1) * pageSizeNum;

    // 2. 查询收藏记录总数
    const countResult = await db.collection('favorites')
      .where({ _openid: OPENID })
      .count();

    const total = countResult.total;

    if (total === 0) {
      return success({
        list: [],
        total: 0,
        hasMore: false
      });
    }

    // 3. 查询收藏记录（分页、按收藏时间倒序）
    const favoritesResult = await db.collection('favorites')
      .where({ _openid: OPENID })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSizeNum)
      .get();

    if (favoritesResult.data.length === 0) {
      return success({
        list: [],
        total,
        hasMore: false
      });
    }

    // 4. 获取 recipeId 列表
    const recipeIds = favoritesResult.data.map(item => item.recipeId);

    // 5. 构建菜谱查询条件
    const recipeWhere = {
      _id: _.in(recipeIds)
    };

    // 添加筛选条件
    if (category !== undefined && category !== null && category !== '') {
      recipeWhere.category = parseInt(category);
    }
    if (taste !== undefined && taste !== null && taste !== '') {
      recipeWhere.taste = parseInt(taste);
    }
    if (cookingMethod !== undefined && cookingMethod !== null && cookingMethod !== '') {
      recipeWhere.cookingMethod = parseInt(cookingMethod);
    }
    if (keyword) {
      recipeWhere.name = db.RegExp({
        regexp: keyword,
        options: 'i'
      });
    }

    // 6. 批量查询菜谱信息
    const recipesResult = await db.collection('recipes')
      .where(recipeWhere)
      .field({
        _id: true,
        _openid: true,
        name: true,
        images: true,
        category: true,
        taste: true,
        cookingMethod: true,
        favoriteCount: true,
        isDeleted: true,
        isPublic: true,
        status: true
      })
      .get();

    // 7. 创建菜谱映射表
    const recipeMap = {};
    recipesResult.data.forEach(recipe => {
      recipeMap[recipe._id] = recipe;
    });

    // 8. 获取作者 openid 列表
    const authorOpenids = [...new Set(recipesResult.data.map(r => r._openid))];

    // 9. 批量查询作者信息
    const usersResult = await db.collection('users')
      .where({
        _openid: _.in(authorOpenids)
      })
      .field({
        _openid: true,
        nickname: true,
        avatarUrl: true
      })
      .get();

    // 10. 创建作者映射表
    const userMap = {};
    usersResult.data.forEach(user => {
      userMap[user._openid] = user;
    });

    // 11. 组合数据
    const list = [];
    for (const favorite of favoritesResult.data) {
      const recipe = recipeMap[favorite.recipeId];

      // 如果菜谱不存在（可能被筛选掉了），跳过
      if (!recipe) {
        continue;
      }

      const author = userMap[recipe._openid] || {};

      list.push({
        favoriteId: favorite._id,
        recipeId: recipe._id,
        recipeName: recipe.name,
        recipeImages: recipe.images || [],
        category: recipe.category,
        taste: recipe.taste,
        cookingMethod: recipe.cookingMethod,
        favoriteCount: recipe.favoriteCount || 0,
        authorName: author.nickname || '未知用户',
        authorAvatar: author.avatarUrl || '',
        createTime: favorite.createTime,
        isDeleted: recipe.isDeleted || false,
        isPrivate: recipe.isPublic !== 1
      });
    }

    // 12. 计算是否还有更多数据
    const hasMore = skip + favoritesResult.data.length < total;

    return success({
      list,
      total,
      hasMore
    });

  } catch (err) {
    console.error('[favorite/getFavoriteList] 获取收藏列表失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
