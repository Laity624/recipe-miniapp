/**
 * 获取好友请求列表
 *
 * 功能描述：
 * 1. 获取收到的好友请求列表
 * 2. 获取发出的好友请求列表
 * 3. 关联查询用户信息
 *
 * 业务逻辑：
 * - 参数校验：type 必填（'received' 或 'sent'）
 * - received: 查询 toOpenid = 当前用户 且 status = 0 的记录
 * - sent: 查询 fromOpenid = 当前用户 且 status = 0 的记录
 * - 关联查询用户信息（昵称、头像）
 *
 * 数据库操作：
 * - 查询 friends 表
 * - 查询 users 表（关联查询用户信息）
 *
 * 参数：
 * @param {string} event.type - 请求类型（'received'=收到的, 'sent'=发出的）（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: { requests: [...] } }
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
const { success, error, checkRequired } = require('./utils');

exports.main = async (event, context) => {
  const { type } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 参数校验
    const requiredError = checkRequired({ type }, ['type']);
    if (requiredError) {
      return error('INVALID_PARAMS', requiredError);
    }

    if (type !== 'received' && type !== 'sent') {
      return error('INVALID_PARAMS', 'type 必须是 received 或 sent');
    }

    // 2. 构建查询条件
    const where = {
      status: 0 // 待确认
    };

    if (type === 'received') {
      where.toOpenid = OPENID;
    } else {
      where.fromOpenid = OPENID;
    }

    // 3. 查询好友请求
    const requestsResult = await db.collection('friends')
      .where(where)
      .orderBy('createTime', 'desc')
      .get();

    const requests = requestsResult.data;

    // 4. 关联查询用户信息
    if (requests.length > 0) {
      // 提取需要查询的 openid
      const openids = requests.map(req => {
        return type === 'received' ? req.fromOpenid : req.toOpenid;
      });

      // 查询用户信息
      const usersResult = await db.collection('users')
        .where({
          _openid: db.command.in(openids)
        })
        .field({
          _openid: true,
          nickname: true,
          avatarUrl: true,
          bio: true,
          recipeCount: true
        })
        .get();

      // 构建 openid 到用户信息的映射
      const userMap = {};
      usersResult.data.forEach(user => {
        userMap[user._openid] = user;
      });

      // 合并用户信息到请求列表
      requests.forEach(req => {
        const targetOpenid = type === 'received' ? req.fromOpenid : req.toOpenid;
        req.userInfo = userMap[targetOpenid] || null;
      });
    }

    // 5. 返回结果
    return success({
      requests
    });

  } catch (err) {
    console.error('[friend/getFriendRequests] 获取好友请求列表失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
