/**
 * 搜索用户
 *
 * 功能描述：
 * 根据身份码或昵称搜索用户，用于添加好友功能
 *
 * 业务逻辑：
 * 1. 参数校验：至少提供身份码或昵称之一
 * 2. 身份码精确匹配（优先级更高）
 * 3. 昵称模糊匹配（使用正则表达式）
 * 4. 排除自己
 * 5. 限制返回字段：只返回必要的公开信息
 * 6. 限制返回数量：最多 20 条
 *
 * 数据库操作：
 * - 查询 users 表（根据 identityCode 或 nickName）
 *
 * 参数：
 * @param {string} event.identityCode - 身份码（可选，精确匹配）
 * @param {string} event.nickName - 昵称（可选，模糊匹配）
 *
 * 返回：
 * @returns {Object} { success: true, data: { users: [...] } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误（未提供搜索条件）
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
  const { identityCode, nickName } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 参数校验：至少提供一个搜索条件
    if (!identityCode && !nickName) {
      return error('INVALID_PARAMS', '请提供身份码或昵称进行搜索');
    }

    let users = [];

    // 2. 优先使用身份码精确匹配
    if (identityCode) {
      const result = await db.collection('users')
        .where({
          identityCode: identityCode.trim().toUpperCase()
        })
        .field({
          _openid: true,
          nickName: true,
          avatarUrl: true,
          identityCode: true,
          bio: true
        })
        .limit(1)
        .get();

      users = result.data;
    }
    // 3. 如果身份码没找到，使用昵称模糊匹配
    else if (nickName) {
      const result = await db.collection('users')
        .where({
          nickName: db.RegExp({
            regexp: nickName.trim(),
            options: 'i' // 不区分大小写
          })
        })
        .field({
          _openid: true,
          nickName: true,
          avatarUrl: true,
          identityCode: true,
          bio: true
        })
        .limit(20)
        .get();

      users = result.data;
    }

    // 4. 排除自己
    users = users.filter(user => user._openid !== OPENID);

    return success({
      users
    });

  } catch (err) {
    console.error('[user/search] 搜索失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
