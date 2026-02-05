/**
 * 表单验证工具
 */

/**
 * 验证是否为空
 * @param {*} value 要验证的值
 * @returns {Boolean}
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

/**
 * 验证手机号
 * @param {String} phone 手机号
 * @returns {Boolean}
 */
function isPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证身份码格式（6-8位字母数字组合）
 * @param {String} code 身份码
 * @returns {Boolean}
 */
function isIdentityCode(code) {
  return /^[A-Z0-9]{6,8}$/.test(code)
}

/**
 * 验证菜谱名称
 * @param {String} name 菜谱名称
 * @returns {Object} {valid: Boolean, message: String}
 */
function validateRecipeName(name) {
  if (isEmpty(name)) {
    return { valid: false, message: '请输入菜名' }
  }
  if (name.length > 30) {
    return { valid: false, message: '菜名不能超过30个字符' }
  }
  return { valid: true, message: '' }
}

/**
 * 验证描述
 * @param {String} desc 描述
 * @param {Number} maxLength 最大长度
 * @returns {Object} {valid: Boolean, message: String}
 */
function validateDescription(desc, maxLength = 200) {
  if (desc && desc.length > maxLength) {
    return { valid: false, message: `描述不能超过${maxLength}个字符` }
  }
  return { valid: true, message: '' }
}

/**
 * 验证食材/调料
 * @param {Array} items 食材或调料数组
 * @returns {Object} {valid: Boolean, message: String}
 */
function validateIngredients(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, message: '请至少添加一项' }
  }
  
  for (let item of items) {
    if (isEmpty(item.name)) {
      return { valid: false, message: '名称不能为空' }
    }
    if (isEmpty(item.amount)) {
      return { valid: false, message: '用量不能为空' }
    }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证步骤
 * @param {Array} steps 步骤数组
 * @returns {Object} {valid: Boolean, message: String}
 */
function validateSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return { valid: false, message: '请至少添加一个步骤' }
  }
  
  for (let step of steps) {
    if (isEmpty(step.content)) {
      return { valid: false, message: '步骤描述不能为空' }
    }
  }
  
  return { valid: true, message: '' }
}

module.exports = {
  isEmpty,
  isPhone,
  isIdentityCode,
  validateRecipeName,
  validateDescription,
  validateIngredients,
  validateSteps
}

