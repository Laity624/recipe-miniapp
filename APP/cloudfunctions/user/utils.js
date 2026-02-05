/**
 * 用户模块工具函数
 *
 * @module cloudfunctions/user/utils
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
 * 生成身份码（6-8位大写字母+数字）
 * @returns {string} 身份码
 */
exports.generateIdentityCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = Math.floor(Math.random() * 3) + 6; // 6-8位
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
