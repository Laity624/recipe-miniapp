/**
 * 工具函数模块
 * 提供统一的响应格式、参数校验等公共方法
 */

/**
 * 成功响应
 * @param {Object} data - 返回的数据
 * @returns {Object} 统一格式的成功响应
 */
function success(data = {}) {
  return {
    success: true,
    data
  };
}

/**
 * 错误响应
 * @param {string} errorCode - 错误码
 * @param {string} errorMessage - 错误信息
 * @returns {Object} 统一格式的错误响应
 */
function error(errorCode, errorMessage) {
  return {
    success: false,
    errorCode,
    errorMessage
  };
}

/**
 * 校验必填参数
 * @param {Object} params - 参数对象
 * @param {Array} fields - 必填字段数组
 * @returns {string|null} 错误信息或 null
 */
function checkRequired(params, fields) {
  for (const field of fields) {
    if (params[field] === undefined || params[field] === null || params[field] === '') {
      return `缺少必填参数: ${field}`;
    }
  }
  return null;
}

module.exports = {
  success,
  error,
  checkRequired
};
