/**
 * 枚举模块云函数
 *
 * 功能列表：
 * - getEnums: 获取枚举值（支持按类型筛选）
 * - addEnum: 新增枚举值（需管理员权限）
 * - updateEnum: 更新枚举值（需管理员权限）
 * - deleteEnum: 删除枚举值（需管理员权限）
 *
 * 调用方式：
 * wx.cloud.callFunction({
 *   name: 'enum',
 *   data: {
 *     action: 'getEnums',
 *     type: 'category'
 *   }
 * })
 *
 * @module cloudfunctions/enum
 * @author Claude
 * @date 2026-02-05
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 动态路由映射
const handlers = {
  getEnums: require('./getEnums'),
  addEnum: require('./addEnum'),
  updateEnum: require('./updateEnum'),
  deleteEnum: require('./deleteEnum')
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
    console.error(`[enum/${action}] 执行失败:`, err);
    return {
      success: false,
      errorCode: 'SYSTEM_ERROR',
      errorMessage: '系统错误'
    };
  }
};
