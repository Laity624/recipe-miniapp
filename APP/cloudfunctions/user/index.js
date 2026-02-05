/**
 * 用户模块云函数
 *
 * 功能列表：
 * - login: 用户登录（获取或创建用户信息）
 * - updateInfo: 更新用户信息（昵称、个人简介、手机号）
 * - search: 搜索用户（通过身份码或昵称）
 *
 * 调用方式：
 * wx.cloud.callFunction({
 *   name: 'user',
 *   data: {
 *     action: 'login',
 *     nickName: '张三',
 *     avatarUrl: 'https://...'
 *   }
 * })
 *
 * @module cloudfunctions/user
 * @author Claude
 * @date 2026-02-05
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 动态路由映射
const handlers = {
  login: require('./login'),
  updateInfo: require('./updateInfo'),
  search: require('./search')
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
    console.error(`[user/${action}] 执行失败:`, err);
    return {
      success: false,
      errorCode: 'SYSTEM_ERROR',
      errorMessage: '系统错误'
    };
  }
};
