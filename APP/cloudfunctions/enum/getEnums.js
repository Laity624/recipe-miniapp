/**
 * 获取枚举值
 *
 * 功能描述：
 * 获取所有枚举值，支持按类型筛选
 *
 * 业务逻辑：
 * 1. 如果指定了 type，只返回该类型的枚举值
 * 2. 如果没有指定 type，返回所有类型的枚举值
 * 3. 只返回启用的枚举值（isActive=true）
 * 4. 按 sort 字段排序
 *
 * 数据库操作：
 * - 查询 enums 表
 *
 * 参数：
 * @param {string} event.type - 枚举类型（可选）
 *
 * 返回：
 * @returns {Object} { success: true, data: { enums } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-05
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { success, error, ENUM_TYPES } = require('./utils');

exports.main = async (event, context) => {
  const { type } = event;

  try {
    // 构建查询条件
    const where = { isActive: true };

    // 如果指定了类型，添加类型筛选
    if (type) {
      // 校验类型是否有效
      if (!ENUM_TYPES.includes(type)) {
        return error('INVALID_PARAMS', `无效的枚举类型: ${type}`);
      }
      where.type = type;
    }

    // 查询枚举值
    const result = await db.collection('enums')
      .where(where)
      .orderBy('sort', 'asc')
      .orderBy('value', 'asc')
      .get();

    return success({
      enums: result.data
    });

  } catch (err) {
    console.error('[enum/getEnums] 查询失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
