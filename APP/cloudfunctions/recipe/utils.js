/**
 * 菜谱模块工具函数
 *
 * @module cloudfunctions/recipe/utils
 * @author Claude
 * @date 2026-02-06
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
 * 校验菜谱权限
 * @param {string} recipeOpenid - 菜谱创建者的 openid
 * @param {string} currentOpenid - 当前用户的 openid
 * @param {number} status - 菜谱状态（0=草稿, 1=已发布）
 * @param {number} isPublic - 是否公开（0=私密, 1=公开）
 * @param {boolean} isDeleted - 是否已删除
 * @param {boolean} isFriend - 是否为好友
 * @returns {Object} { canView: boolean, canEdit: boolean, message: string }
 */
exports.checkRecipePermission = (recipeOpenid, currentOpenid, status, isPublic, isDeleted, isFriend = false) => {
  // 已删除的菜谱任何人都不可见
  if (isDeleted) {
    return { canView: false, canEdit: false, message: '该菜谱已被删除' };
  }

  const isOwner = recipeOpenid === currentOpenid;

  // 编辑权限：只有创建者可以编辑
  const canEdit = isOwner;

  // 查看权限
  let canView = false;
  let message = '';

  if (isOwner) {
    // 创建者可以查看自己的所有菜谱
    canView = true;
  } else if (status === 0) {
    // 草稿状态：仅创建者可见
    canView = false;
    message = '该菜谱为草稿状态';
  } else if (status === 1 && isPublic === 0) {
    // 已发布但私密：仅创建者可见
    canView = false;
    message = '该菜谱已设为私密';
  } else if (status === 1 && isPublic === 1) {
    // 已发布且公开：好友可见
    canView = isFriend;
    if (!canView) {
      message = '需要添加好友才能查看';
    }
  }

  return { canView, canEdit, message };
};

/**
 * 校验是否为好友关系
 * @param {string} openid1 - 用户1的 openid
 * @param {string} openid2 - 用户2的 openid
 * @returns {Promise<boolean>} 是否为好友
 */
exports.checkFriendship = async (openid1, openid2) => {
  // 如果是同一个人，返回 true
  if (openid1 === openid2) {
    return true;
  }

  try {
    const result = await db.collection('friends')
      .where({
        status: 1, // 已同意
        _: db.command.or([
          { fromOpenid: openid1, toOpenid: openid2 },
          { fromOpenid: openid2, toOpenid: openid1 }
        ])
      })
      .count();

    return result.total > 0;
  } catch (err) {
    console.error('[utils/checkFriendship] 查询好友关系失败:', err);
    return false;
  }
};
