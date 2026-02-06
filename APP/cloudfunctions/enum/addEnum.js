/**
 * 新增枚举值
 *
 * 功能描述：
 * 管理员添加新的枚举值
 *
 * 业务逻辑：
 * 1. 校验管理员权限
 * 2. 校验必填参数（type、value、label）
 * 3. 校验枚举类型是否有效
 * 4. 检查该类型下的 value 是否已存在
 * 5. 如果没有指定 sort，自动设置为最大值+1
 * 6. 创建枚举记录
 *
 * 数据库操作：
 * - 查询 users 表（校验管理员权限）
 * - 查询 enums 表（检查 value 是否存在）
 * - 插入 enums 表
 *
 * 参数：
 * @param {string} event.type - 枚举类型（必填）
 * @param {number} event.value - 枚举值（必填）
 * @param {string} event.label - 显示文本（必填）
 * @param {number} event.sort - 排序值（可选，默认自动计算）
 *
 * 返回：
 * @returns {Object} { success: true, data: { enumId } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - PERMISSION_DENIED: 权限不足（非管理员）
 * - ALREADY_EXISTS: 枚举值已存在
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-05
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { success, error, checkRequired, checkAdmin, ENUM_TYPES } = require('./utils');

exports.main = async (event, context) => {
  const { type, value, label, sort } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 校验管理员权限
    const isAdmin = await checkAdmin(OPENID);
    if (!isAdmin) {
      return error('PERMISSION_DENIED', '权限不足，仅管理员可操作');
    }

    // 2. 校验必填参数
    const err = checkRequired(event, ['type', 'value', 'label']);
    if (err) return error('INVALID_PARAMS', err);

    // 3. 校验枚举类型
    if (!ENUM_TYPES.includes(type)) {
      return error('INVALID_PARAMS', `无效的枚举类型: ${type}`);
    }

    // 4. 检查 value 是否已存在
    const existingEnum = await db.collection('enums')
      .where({ type, value })
      .get();

    if (existingEnum.data.length > 0) {
      return error('ALREADY_EXISTS', `该枚举值已存在: ${value}`);
    }

    // 5. 如果没有指定 sort，自动计算
    let sortValue = sort;
    if (sortValue === undefined || sortValue === null) {
      const maxSortResult = await db.collection('enums')
        .where({ type })
        .orderBy('sort', 'desc')
        .limit(1)
        .get();

      sortValue = maxSortResult.data.length > 0
        ? maxSortResult.data[0].sort + 1
        : 0;
    }

    // 6. 创建枚举记录
    const result = await db.collection('enums').add({
      data: {
        type,
        value,
        label: label.trim(),
        sort: sortValue,
        isActive: true,
        createTime: new Date()
      }
    });

    return success({
      enumId: result._id
    });

  } catch (err) {
    console.error('[enum/addEnum] 添加失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
