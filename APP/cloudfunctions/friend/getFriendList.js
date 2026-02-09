/**
 * 获取好友列表
 *
 * 功能描述：
 * 1. 获取当前用户的所有好友
 * 2. 关联查询好友的用户信息
 *
 * 业务逻辑：
 * - 查询 friends 表，status = 1（已同意）
 * - fromOpenid = 当前用户 OR toOpenid = 当前用户
 * - 提取好友的 openid
 * - 关联查询用户信息（昵称、头像、菜谱数量等）
 *
 * 数据库操作：
 * - 查询 friends 表
 * - 查询 users 表（关联查询用户信息）
 *
 * 参数：
 * 无
 *
 * 返回：
 * @returns {Object} { success: true, data: { friends: [...] } }
 *
 * 错误码：
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
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 查询好友关系
    const friendsResult = await db.collection('friends')
      .where({
        status: 1, // 已同意
        _: _.or([
          { fromOpenid: OPENID },
          { toOpenid: OPENID }
        ])
      })
      .get();

    const relations = friendsResult.data;

    // 2. 提取好友的 openid
    const friendOpenids = relations.map(relation => {
      return relation.fromOpenid === OPENID ? relation.toOpenid : relation.fromOpenid;
    });

    // 3. 如果没有好友，直接返回空列表
    if (friendOpenids.length === 0) {
      return success({
        friends: []
      });
    }

    // 4. 查询好友的用户信息
    const usersResult = await db.collection('users')
      .where({
        _openid: _.in(friendOpenids)
      })
      .field({
        _openid: true,
        nickname: true,
        avatarUrl: true,
        bio: true,
        identityCode: true,
        recipeCount: true,
        friendCount: true
      })
      .get();

    // 5. 构建好友列表（包含关系创建时间）
    const userMap = {};
    usersResult.data.forEach(user => {
      userMap[user._openid] = user;
    });

    const friends = relations.map(relation => {
      const friendOpenid = relation.fromOpenid === OPENID ? relation.toOpenid : relation.fromOpenid;
      return {
        ...userMap[friendOpenid],
        relationId: relation._id,
        createTime: relation.createTime
      };
    });

    // 6. 按创建时间降序排列
    friends.sort((a, b) => {
      return new Date(b.createTime) - new Date(a.createTime);
    });

    return success({
      friends
    });

  } catch (err) {
    console.error('[friend/getFriendList] 获取好友列表失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
