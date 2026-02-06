/**
 * 枚举模块工具函数
 *
 * @module cloudfunctions/enum/utils
 * @author Claude
 * @date 2026-02-05
 */

const cloud = require('wx-server-sdk');
const db = cloud.database();

/**
 * 成功响应
 * @param {*} data - 返回的数据
 * @returns {Object} { success: true, data }
 */
exports.success = (data) => ({ success: true, data });

/**
 * 错误响应
 * @param {string} errorCode - 错误码
 * @param {string} errorMessage - 错误信息
 * @returns {Object} { success: false, errorCode, errorMessage }
 */
exports.error = (errorCode, errorMessage) => ({
  success: false,
  errorCode,
  errorMessage
});

/**
 * 校验必填参数
 * @param {Object} params - 参数对象
 * @param {Array<string>} fields - 必填字段数组
 * @returns {string|null} 错误信息，无错误返回 null
 */
exports.checkRequired = (params, fields) => {
  for (const field of fields) {
    if (params[field] === undefined || params[field] === null || params[field] === '') {
      return `缺少参数: ${field}`;
    }
  }
  return null;
};

/**
 * 校验用户是否为管理员
 * @param {string} openid - 用户 openid
 * @returns {Promise<boolean>} 是否为管理员
 */
exports.checkAdmin = async (openid) => {
  const userResult = await db.collection('users')
    .where({ _openid: openid })
    .field({ isAdmin: true })
    .get();

  if (userResult.data.length === 0) {
    return false;
  }

  return userResult.data[0].isAdmin === true;
};

/**
 * 枚举类型列表
 */
exports.ENUM_TYPES = [
  'category',      // 分类
  'taste',         // 口味
  'cookingMethod', // 烹饪方式
  'cookingTime',   // 烹饪时间
  'difficulty',    // 难度
  'servings'       // 人数
];
