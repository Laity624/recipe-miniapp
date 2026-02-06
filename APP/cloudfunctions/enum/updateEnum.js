/**
 * 更新枚举值
 *
 * 功能描述：
 * 管理员更新枚举值的 label 或 sort
 *
 * 业务逻辑：
 * 1. 校验管理员权限
 * 2. 校验必填参数（enumId）
 * 3. 至少提供 label 或 sort 之一
 * 4. 更新枚举记录
 *
 * 数据库操作：
 * - 查询 users 表（校验管理员权限）
 * - 更新 enums 表
 *
 * 参数：
 * @param {string} event.enumId - 枚举ID（必填）
 * @param {string} event.label - 显示文本（可选）
 * @param {number} event.sort - 排序值（可选）
 *
 * 返回：
 * @returns {Object} { success: true, data: {} }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - PERMISSION_DENIED: 权限不足
 * - NOT_FOUND: 枚举不存在
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-05
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { success, error, checkRequired, checkAdmin } = require('./utils');

exports.main = async (event, context) => {
  const { enumId, label, sort } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 校验管理员权限
    const isAdmin = await checkAdmin(OPENID);
    if (!isAdmin) {
      return error('PERMISSION_DENIED', '权限不足，仅管理员可操作');
    }

    // 2. 校验必填参数
    const err = checkRequired(event, ['enumId']);
    if (err) return error('INVALID_PARAMS', err);

    // 3. 构建更新数据
    const updateData = {};

    if (label !== undefined) {
      if (label.trim().length === 0) {
        return error('INVALID_PARAMS', '显示文本不能为空');
      }
      updateData.label = label.trim();
    }

    if (sort !== undefined) {
      if (typeof sort !== 'number' || sort < 0) {
        return error('INVALID_PARAMS', '排序值必须为非负整数');
      }
      updateData.sort = sort;
    }

    // 检查是否有需要更新的字段
    if (Object.keys(updateData).length === 0) {
      return error('INVALID_PARAMS', '没有需要更新的字段');
    }

    // 4. 更新枚举记录
    const result = await db.collection('enums')
      .doc(enumId)
      .update({
        data: updateData
      });

    if (result.stats.updated === 0) {
      return error('NOT_FOUND', '枚举不存在');
    }

    return success({});

  } catch (err) {
    console.error('[enum/updateEnum] 更新失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
