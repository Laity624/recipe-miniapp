/**
 * 用户登录
 *
 * 功能描述：
 * 1. 获取用户的 openid
 * 2. 查询用户是否已注册
 * 3. 首次登录时创建用户记录，生成唯一身份码
 * 4. 返回用户信息和是否首次登录标识
 *
 * 业务逻辑：
 * - 首次登录：创建用户记录，生成 6-8 位身份码（大写字母+数字），初始化计数字段
 * - 已注册用户：直接返回用户信息
 * - 身份码生成规则：大写字母+数字，需保证唯一性（循环生成直到不重复，最多尝试 10 次）
 *
 * 数据库操作：
 * - 查询 users 表（根据 _openid）
 * - 插入 users 表（首次登录）
 *
 * 参数：
 * @param {string} event.nickName - 用户昵称（首次登录必填，1-20字符）
 * @param {string} event.avatarUrl - 用户头像（首次登录必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: { user, isFirstLogin } }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误（首次登录缺少昵称或头像）
 * - SYSTEM_ERROR: 系统错误（数据库操作失败、身份码生成失败等）
 *
 * @author Claude
 * @date 2026-02-05
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const { success, error, generateIdentityCode } = require('./utils');

exports.main = async (event, context) => {
  const { nickName, avatarUrl } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 查询用户是否已存在
    const userResult = await db.collection('users')
      .where({ _openid: OPENID })
      .get();

    // 2. 已注册用户，直接返回
    if (userResult.data.length > 0) {
      return success({
        user: userResult.data[0],
        isFirstLogin: false
      });
    }

    // 3. 首次登录，参数校验
    if (!nickName || !avatarUrl) {
      return error('INVALID_PARAMS', '首次登录需要提供昵称和头像');
    }

    // 校验昵称长度
    if (nickName.trim().length === 0 || nickName.length > 20) {
      return error('INVALID_PARAMS', '昵称长度必须在 1-20 个字符之间');
    }

    // 4. 生成唯一身份码（最多尝试 10 次）
    let identityCode = '';
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (attempts < MAX_ATTEMPTS) {
      identityCode = generateIdentityCode();

      // 检查身份码是否已存在
      const existingUser = await db.collection('users')
        .where({ identityCode })
        .get();

      if (existingUser.data.length === 0) {
        break; // 身份码唯一，跳出循环
      }

      attempts++;
    }

    if (attempts >= MAX_ATTEMPTS) {
      return error('SYSTEM_ERROR', '生成身份码失败，请稍后重试');
    }

    // 5. 创建用户记录
    const createResult = await db.collection('users').add({
      data: {
        _openid: OPENID,
        nickName: nickName.trim(),
        avatarUrl,
        identityCode,
        bio: '',
        phone: '',
        isAdmin: false,
        recipeCount: 0,
        friendCount: 0,
        favoriteCount: 0,
        createTime: new Date()
      }
    });

    // 6. 查询并返回新用户信息
    const newUser = await db.collection('users')
      .doc(createResult._id)
      .get();

    return success({
      user: newUser.data,
      isFirstLogin: true
    });

  } catch (err) {
    console.error('[user/login] 登录失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
