/**
 * 搜索菜谱
 *
 * 功能描述：
 * 1. 支持两种搜索场景：公共搜索、我的菜谱
 * 2. 支持多种筛选条件：菜名、分类、口味、烹饪方式、状态
 * 3. 支持分页加载
 *
 * 业务逻辑：
 * - 场景一：公共搜索（scene='public'）
 *   - 搜索范围：自己的已发布菜谱（包括私密和公开）+ 所有好友的已发布且公开的菜谱
 *   - 筛选条件：菜名、分类、口味、烹饪方式
 * - 场景二：我的菜谱（scene='mine'）
 *   - 搜索范围：自己的所有菜谱（草稿+已发布）
 *   - 筛选条件：菜名、分类、口味、烹饪方式、状态（全部/已发布/草稿）
 * - 分页加载：使用 skip 和 limit
 * - 排序：按 updateTime 降序
 *
 * 数据库操作：
 * - 查询 friends 表（获取好友列表）
 * - 查询 recipes 表（根据条件筛选）
 *
 * 参数：
 * @param {string} event.scene - 搜索场景（'public'=公共搜索, 'mine'=我的菜谱），默认 'public'
 * @param {string} event.keyword - 菜名关键词（模糊搜索）
 * @param {number} event.category - 分类枚举值
 * @param {number} event.taste - 口味枚举值
 * @param {number} event.cookingMethod - 烹饪方式枚举值
 * @param {number} event.status - 状态（0=草稿, 1=已发布），仅在 scene='mine' 时有效
 * @param {number} event.page - 页码（从1开始），默认1
 * @param {number} event.pageSize - 每页数量，默认20
 *
 * 返回：
 * @returns {Object} { success: true, data: { recipes, total, hasMore } }
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
const _ = db.command;
const { success, error } = require('./utils');

exports.main = async (event, context) => {
  const {
    scene = 'public',
    keyword,
    category,
    taste,
    cookingMethod,
    status,
    page = 1,
    pageSize = 20
  } = event;

  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 参数校验
    if (page < 1) {
      return error('INVALID_PARAMS', '页码必须大于0');
    }

    if (pageSize < 1 || pageSize > 100) {
      return error('INVALID_PARAMS', '每页数量必须在 1-100 之间');
    }

    // 2. 构建查询条件
    const where = {
      isDeleted: false // 排除已删除的菜谱
    };

    // 场景筛选
    if (scene === 'public') {
      // 公共搜索：自己的已发布菜谱 + 好友的已发布且公开的菜谱

      // 2.1 获取好友列表
      const friendsResult = await db.collection('friends')
        .where({
          status: 1, // 已同意
          _: _.or([
            { fromOpenid: OPENID },
            { toOpenid: OPENID }
          ])
        })
        .get();

      // 提取好友的 openid
      const friendOpenids = friendsResult.data.map(friend => {
        return friend.fromOpenid === OPENID ? friend.toOpenid : friend.fromOpenid;
      });

      // 2.2 构建查询条件
      where.status = 1; // 已发布
      where._ = _.or([
        // 自己的已发布菜谱（包括私密和公开）
        { _openid: OPENID },
        // 好友的已发布且公开的菜谱
        {
          _openid: _.in(friendOpenids),
          isPublic: 1
        }
      ]);

    } else if (scene === 'mine') {
      // 我的菜谱：自己的所有菜谱
      where._openid = OPENID;

      // 状态筛选（仅在 scene='mine' 时有效）
      if (status !== undefined && status !== null && status !== '') {
        where.status = status;
      }
    } else {
      return error('INVALID_PARAMS', '无效的搜索场景');
    }

    // 菜名关键词搜索
    if (keyword && keyword.trim().length > 0) {
      where.name = db.RegExp({
        regexp: keyword.trim(),
        options: 'i' // 不区分大小写
      });
    }

    // 分类筛选
    if (category !== undefined && category !== null && category !== '') {
      where.category = category;
    }

    // 口味筛选
    if (taste !== undefined && taste !== null && taste !== '') {
      where.taste = taste;
    }

    // 烹饪方式筛选
    if (cookingMethod !== undefined && cookingMethod !== null && cookingMethod !== '') {
      where.cookingMethod = cookingMethod;
    }

    // 3. 查询总数
    const countResult = await db.collection('recipes')
      .where(where)
      .count();

    const total = countResult.total;

    // 4. 分页查询
    const skip = (page - 1) * pageSize;
    const recipesResult = await db.collection('recipes')
      .where(where)
      .field({
        _id: true,
        _openid: true,
        name: true,
        description: true,
        images: true,
        category: true,
        taste: true,
        cookingMethod: true,
        cookingTime: true,
        difficulty: true,
        status: true,
        isPublic: true,
        favoriteCount: true,
        createTime: true,
        updateTime: true
      })
      .orderBy('updateTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    // 5. 批量查询作者信息
    const authorOpenids = [...new Set(recipesResult.data.map(r => r._openid))];

    let authorMap = {};
    if (authorOpenids.length > 0) {
      const authorsResult = await db.collection('users')
        .where({
          _openid: _.in(authorOpenids)
        })
        .field({
          _openid: true,
          nickName: true,
          avatarUrl: true
        })
        .get();

      // 创建作者映射表
      authorsResult.data.forEach(author => {
        authorMap[author._openid] = author;
      });
    }

    // 6. 组合数据（添加作者信息）
    const recipesWithAuthor = recipesResult.data.map(recipe => ({
      ...recipe,
      authorName: authorMap[recipe._openid]?.nickName || '未知用户',
      authorAvatar: authorMap[recipe._openid]?.avatarUrl || ''
    }));

    // 7. 返回结果
    return success({
      recipes: recipesWithAuthor,
      total,
      hasMore: skip + recipesResult.data.length < total
    });

  } catch (err) {
    console.error('[recipe/searchRecipes] 搜索菜谱失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
