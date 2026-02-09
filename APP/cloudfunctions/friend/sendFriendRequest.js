/**
 * 发送好友请求
 *
 * 功能描述：
 * 1. 根据身份码查找目标用户
 * 2. 创建好友请求记录
 *
 * 业务逻辑：
 * - 参数校验：identityCode 必填
 * - 根据 identityCode 查询目标用户
 * - 校验不能添加自己为好友
 * - 校验是否已经是好友
 * - 校验是否已经发送过请求（待确认状态）
 * - 创建好友关系记录（status=0）
 *
 * 数据库操作：
 * - 查询 users 表（根据 identityCode 查找用户）
 * - 查询 friends 表（检查是否已存在关系）
 * - 插入 friends 表（创建新请求）
 *
 * 参数：
 * @param {string} event.identityCode - 对方的身份码（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: {} }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - USER_NOT_FOUND: 用户不存在
 * - CANNOT_ADD_SELF: 不能添加自己为好友
 * - ALREADY_FRIENDS: 已经是好友
 * - REQUEST_EXISTS: 已发送过请求
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-08
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const { success, error, checkRequired } = require('./utils');

exports.main = async (event, context) => {
  const { identityCode } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 参数校验
    const requiredError = checkRequired({ identityCode }, ['identityCode']);
    if (requiredError) {
      return error('INVALID_PARAMS', requiredError);
    }

    // 2. 查询目标用户
    const userResult = await db.collection('users')
      .where({
        identityCode: identityCode.trim().toUpperCase()
      })
      .get();

    if (!userResult.data || userResult.data.length === 0) {
      return error('USER_NOT_FOUND', '未找到该用户');
    }

    const targetUser = userResult.data[0];
    const targetOpenid = targetUser._openid;

    // 3. 校验不能添加自己
    if (targetOpenid === OPENID) {
      return error('CANNOT_ADD_SELF', '不能添加自己为好友');
    }

    // 4. 检查是否已存在好友关系
    const existingRelation = await db.collection('friends')
      .where({
        _: _.or([
          {
            fromOpenid: OPENID,
            toOpenid: targetOpenid
          },
          {
            fromOpenid: targetOpenid,
            toOpenid: OPENID
          }
        ])
      })
      .get();

    if (existingRelation.data && existingRelation.data.length > 0) {
      const relation = existingRelation.data[0];

      if (relation.status === 1) {
        return error('ALREADY_FRIENDS', '你们已经是好友了');
      } else if (relation.status === 0) {
        return error('REQUEST_EXISTS', '已发送过好友请求，请等待对方确认');
      } else if (relation.status === 2) {
        // 如果之前被拒绝，可以重新发送，更新状态为待确认
        await db.collection('friends')
          .doc(relation._id)
          .update({
            data: {
              status: 0,
              fromOpenid: OPENID,
              toOpenid: targetOpenid,
              updateTime: new Date()
            }
          });
        return success({});
      }
    }

    // 5. 创建好友请求
    await db.collection('friends').add({
      data: {
        fromOpenid: OPENID,
        toOpenid: targetOpenid,
        status: 0, // 待确认
        createTime: new Date(),
        updateTime: new Date()
      }
    });

    return success({});

  } catch (err) {
    console.error('[friend/sendFriendRequest] 发送好友请求失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
