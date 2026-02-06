/**
 * 删除枚举值
 *
 * 功能描述：
 * 管理员删除枚举值（软删除，设置 isActive=false）
 *
 * 业务逻辑：
 * 1. 校验管理员权限
 * 2. 校验必填参数（enumId）
 * 3. 软删除枚举记录（设置 isActive=false）
 *
 * 数据库操作：
 * - 查询 users 表（校验管理员权限）
 * - 更新 enums 表（软删除）
 *
 * 参数：
 * @param {string} event.enumId - 枚举ID（必填）
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
  const { enumId } = event;
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

    // 3. 软删除枚举记录
    const result = await db.collection('enums')
      .doc(enumId)
      .update({
        data: {
          isActive: false,
          deleteTime: new Date()
        }
      });

    if (result.stats.updated === 0) {
      return error('NOT_FOUND', '枚举不存在');
    }

    return success({});

  } catch (err) {
    console.error('[enum/deleteEnum] 删除失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
