/**
 * 好友模块云函数
 *
 * 功能列表：
 * - searchUserByCode: 根据身份码搜索用户
 * - sendFriendRequest: 发送好友请求
 * - getFriendRequests: 获取好友请求列表
 * - handleFriendRequest: 处理好友请求（接受/拒绝）
 * - getFriendList: 获取好友列表
 * - deleteFriend: 删除好友
 *
 * 调用方式：
 * wx.cloud.callFunction({
 *   name: 'friend',
 *   data: {
 *     action: 'sendFriendRequest',
 *     identityCode: 'ABC123',
 *     ...
 *   }
 * })
 *
 * @module cloudfunctions/friend
 * @author Claude
 * @date 2026-02-08
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 动态路由映射
const handlers = {
  searchUserByCode: require('./searchUserByCode'),
  sendFriendRequest: require('./sendFriendRequest'),
  getFriendRequests: require('./getFriendRequests'),
  handleFriendRequest: require('./handleFriendRequest'),
  getFriendList: require('./getFriendList'),
  deleteFriend: require('./deleteFriend')
};

exports.main = async (event, context) => {
  const { action } = event;

  // 验证 action
  if (!action || !handlers[action]) {
    return {
      success: false,
      errorCode: 'INVALID_ACTION',
      errorMessage: `无效的操作: ${action}`
    };
  }

  try {
    // 调用对应的处理函数
    return await handlers[action].main(event, context);
  } catch (err) {
    console.error(`[friend/${action}] 执行失败:`, err);
    return {
      success: false,
      errorCode: 'SYSTEM_ERROR',
      errorMessage: '系统错误'
    };
  }
};
