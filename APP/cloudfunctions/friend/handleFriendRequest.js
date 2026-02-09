/**
 * 处理好友请求
 *
 * 功能描述：
 * 1. 接受或拒绝好友请求
 * 2. 更新好友关系状态
 * 3. 如果接受，更新双方的 friendCount
 *
 * 业务逻辑：
 * - 参数校验：requestId 和 action 必填
 * - 查询好友请求记录
 * - 校验请求是否存在且状态为待确认
 * - 校验当前用户是接收者（toOpenid）
 * - 更新 status（1=已同意, 2=已拒绝）
 * - 如果接受，更新双方的 friendCount
 *
 * 数据库操作：
 * - 查询 friends 表
 * - 更新 friends 表
 * - 更新 users 表的 friendCount（如果接受）
 *
 * 参数：
 * @param {string} event.requestId - 请求ID（必填）
 * @param {string} event.action - 操作（'accept'=接受, 'reject'=拒绝）（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: {} }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - REQUEST_NOT_FOUND: 请求不存在
 * - INVALID_STATUS: 请求状态无效
 * - PERMISSION_DENIED: 权限不足
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
  const { requestId, action } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 参数校验
    const requiredError = checkRequired({ requestId, action }, ['requestId', 'action']);
    if (requiredError) {
      return error('INVALID_PARAMS', requiredError);
    }

    if (action !== 'accept' && action !== 'reject') {
      return error('INVALID_PARAMS', 'action 必须是 accept 或 reject');
    }

    // 2. 查询好友请求
    const requestResult = await db.collection('friends')
      .doc(requestId)
      .get();

    if (!requestResult.data) {
      return error('REQUEST_NOT_FOUND', '好友请求不存在');
    }

    const request = requestResult.data;

    // 3. 校验请求状态
    if (request.status !== 0) {
      return error('INVALID_STATUS', '该请求已被处理');
    }

    // 4. 校验权限：只能处理发给自己的请求
    if (request.toOpenid !== OPENID) {
      return error('PERMISSION_DENIED', '无权限处理此请求');
    }

    // 5. 更新请求状态
    const newStatus = action === 'accept' ? 1 : 2;

    await db.collection('friends')
      .doc(requestId)
      .update({
        data: {
          status: newStatus,
          updateTime: new Date()
        }
      });

    // 6. 如果接受，更新双方的 friendCount
    if (action === 'accept') {
      // 更新发送者的 friendCount
      await db.collection('users')
        .where({ _openid: request.fromOpenid })
        .update({
          data: {
            friendCount: db.command.inc(1)
          }
        });

      // 更新接收者的 friendCount
      await db.collection('users')
        .where({ _openid: request.toOpenid })
        .update({
          data: {
            friendCount: db.command.inc(1)
          }
        });
    }

    return success({});

  } catch (err) {
    console.error('[friend/handleFriendRequest] 处理好友请求失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
