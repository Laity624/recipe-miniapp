/**
 * 更新用户信息
 *
 * 功能描述：
 * 更新用户的个人信息（头像、昵称、个人简介）
 *
 * 业务逻辑：
 * 1. 参数校验：昵称长度（1-20字符）、简介长度（最多200字符）、头像URL格式
 * 2. 只更新传入的字段（支持部分更新）
 * 3. 权限校验：只能更新自己的信息
 * 4. 返回更新后的用户信息
 *
 * 数据库操作：
 * - 更新 users 表（根据 _openid）
 * - 查询 users 表（返回更新后的数据）
 *
 * 参数：
 * @param {string} event.avatarUrl - 用户头像（可选，云存储URL）
 * @param {string} event.nickName - 用户昵称（可选，1-20字符）
 * @param {string} event.bio - 个人简介（可选，最多200字符）
 *
 * 返回：
 * @returns {Object} { success: true, data: { user } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误（格式不正确、长度超限等）
 * - NOT_FOUND: 用户不存在
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-05
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { success, error } = require('./utils');

exports.main = async (event, context) => {
  const { avatarUrl, nickName, bio } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 构建更新数据对象
    const updateData = {};

    // 2. 参数校验和处理
    if (avatarUrl !== undefined) {
      if (avatarUrl && avatarUrl.trim().length > 0) {
        updateData.avatarUrl = avatarUrl.trim();
      }
    }

    if (nickName !== undefined) {
      if (nickName.trim().length === 0 || nickName.length > 20) {
        return error('INVALID_PARAMS', '昵称长度必须在 1-20 个字符之间');
      }
      updateData.nickName = nickName.trim();
    }

    if (bio !== undefined) {
      if (bio.length > 200) {
        return error('INVALID_PARAMS', '个人简介不能超过 200 个字符');
      }
      updateData.bio = bio.trim();
    }

    // 3. 检查是否有需要更新的字段
    if (Object.keys(updateData).length === 0) {
      return error('INVALID_PARAMS', '没有需要更新的字段');
    }

    // 4. 更新用户信息
    const updateResult = await db.collection('users')
      .where({ _openid: OPENID })
      .update({
        data: updateData
      });

    if (updateResult.stats.updated === 0) {
      return error('NOT_FOUND', '用户不存在');
    }

    // 5. 查询并返回更新后的用户信息
    const userResult = await db.collection('users')
      .where({ _openid: OPENID })
      .get();

    return success({
      user: userResult.data[0]
    });

  } catch (err) {
    console.error('[user/updateInfo] 更新失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
