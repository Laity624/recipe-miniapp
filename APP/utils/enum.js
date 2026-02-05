/**
 * 枚举工具类
 * 用于管理和获取枚举值
 */

const { callFunction } = require('./request.js')

/**
 * 枚举类型常量
 */
const ENUM_TYPES = {
  CATEGORY: 'category',        // 分类
  TASTE: 'taste',              // 口味
  COOKING_METHOD: 'cookingMethod',  // 烹饪方式
  COOKING_TIME: 'cookingTime',      // 烹饪时间
  DIFFICULTY: 'difficulty',         // 难度
  SERVINGS: 'servings'              // 人数
}

/**
 * 获取所有枚举值
 * @param {Boolean} forceRefresh 是否强制刷新
 * @returns {Promise<Object>} 枚举数据对象
 */
async function getAllEnums(forceRefresh = false) {
  const app = getApp()
  
  // 如果已缓存且不强制刷新，直接返回缓存
  if (!forceRefresh && app.globalData.enums) {
    return app.globalData.enums
  }

  try {
    const enums = await callFunction('getEnums', {}, false)
    
    // 按类型分组
    const enumsMap = {}
    Object.values(ENUM_TYPES).forEach(type => {
      enumsMap[type] = enums
        .filter(item => item.type === type && item.isActive)
        .sort((a, b) => a.sort - b.sort)
    })

    // 缓存到全局
    app.globalData.enums = enumsMap
    
    return enumsMap
  } catch (err) {
    console.error('获取枚举失败:', err)
    return {}
  }
}

/**
 * 根据类型获取枚举列表
 * @param {String} type 枚举类型
 * @returns {Promise<Array>} 枚举列表
 */
async function getEnumsByType(type) {
  const enums = await getAllEnums()
  return enums[type] || []
}

/**
 * 根据类型和值获取枚举标签
 * @param {String} type 枚举类型
 * @param {Number} value 枚举值
 * @returns {Promise<String>} 枚举标签
 */
async function getEnumLabel(type, value) {
  const enums = await getEnumsByType(type)
  const item = enums.find(e => e.value === value)
  return item ? item.label : ''
}

/**
 * 清除枚举缓存
 */
function clearEnumCache() {
  const app = getApp()
  app.globalData.enums = null
}

module.exports = {
  ENUM_TYPES,
  getAllEnums,
  getEnumsByType,
  getEnumLabel,
  clearEnumCache
}

