/**
 * 获取菜谱数量统计
 *
 * 功能描述：
 * 1. 统计各状态的菜谱数量（全部、已发布、草稿）
 * 2. 支持两种场景：公共搜索、我的菜谱
 *
 * 业务逻辑：
 * - 场景一：公共搜索（scene='public'）
 *   - 统计范围：自己的已发布菜谱（包括私密和公开）+ 所有好友的已发布且公开的菜谱
 * - 场景二：我的菜谱（scene='mine'）
 *   - 统计范围：自己的所有菜谱（草稿+已发布）
 * - 一次查询获取所有菜谱，在内存中按状态分组统计
 *
 * 数据库操作：
 * - 查询 friends 表（获取好友列表，仅 scene='public' 时）
 * - 查询 recipes 表（获取菜谱列表）
 *
 * 参数：
 * @param {string} event.scene - 搜索场景（'public'=公共搜索, 'mine'=我的菜谱），默认 'mine'
 *
 * 返回：
 * @returns {Object} { success: true, data: { all, published, draft } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-08
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const { success, error } = require('./utils');

exports.main = async (event, context) => {
  const { scene = 'mine' } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 参数校验
    if (scene !== 'mine' && scene !== 'public') {
      return error('INVALID_PARAMS', '无效的搜索场景');
    }

    // 2. 构建查询条件
    const where = {
      isDeleted: false // 排除已删除的菜谱
    };

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
    }

    // 3. 查询所有菜谱（只需要 status 字段）
    const recipesResult = await db.collection('recipes')
      .where(where)
      .field({
        status: true
      })
      .get();

    // 4. 在内存中统计各状态数量
    const recipes = recipesResult.data;
    const counts = {
      all: recipes.length,
      published: recipes.filter(r => r.status === 1).length,
      draft: recipes.filter(r => r.status === 0).length
    };

    // 5. 返回统计结果
    return success(counts);

  } catch (err) {
    console.error('[recipe/getRecipeCounts] 获取菜谱数量统计失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
