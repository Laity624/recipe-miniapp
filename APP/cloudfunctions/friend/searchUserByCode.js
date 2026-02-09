/**
 * 根据身份码搜索用户
 *
 * 功能描述：
 * 1. 根据用户的身份码（identityCode）搜索用户
 * 2. 返回用户基本信息（昵称、头像、简介等）
 * 3. 不返回敏感信息（手机号等）
 *
 * 业务逻辑：
 * - 参数校验：identityCode 必填
 * - 查询 users 表
 * - 返回用户基本信息
 *
 * 数据库操作：
 * - 查询 users 表
 *
 * 参数：
 * @param {string} event.identityCode - 身份码（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: { user } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - USER_NOT_FOUND: 用户不存在
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-08
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { success, error, checkRequired } = require('./utils');

exports.main = async (event, context) => {
  const { identityCode } = event;

  try {
    // 1. 参数校验
    const requiredError = checkRequired({ identityCode }, ['identityCode']);
    if (requiredError) {
      return error('INVALID_PARAMS', requiredError);
    }

    // 2. 查询用户
    const userResult = await db.collection('users')
      .where({
        identityCode: identityCode.trim().toUpperCase()
      })
      .field({
        _openid: true,
        nickname: true,
        avatarUrl: true,
        bio: true,
        identityCode: true,
        recipeCount: true,
        friendCount: true
      })
      .get();

    if (!userResult.data || userResult.data.length === 0) {
      return error('USER_NOT_FOUND', '未找到该用户');
    }

    // 3. 返回用户信息
    return success({
      user: userResult.data[0]
    });

  } catch (err) {
    console.error('[friend/searchUserByCode] 搜索用户失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
