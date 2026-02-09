/**
 * 删除好友
 *
 * 功能描述：
 * 1. 删除好友关系
 * 2. 更新双方的 friendCount
 *
 * 业务逻辑：
 * - 参数校验：friendOpenid 必填
 * - 查询好友关系记录
 * - 校验关系是否存在且状态为已同意
 * - 校验当前用户是关系的一方
 * - 删除好友关系记录
 * - 更新双方的 friendCount
 *
 * 数据库操作：
 * - 查询 friends 表
 * - 删除 friends 表记录
 * - 更新 users 表的 friendCount
 *
 * 参数：
 * @param {string} event.friendOpenid - 好友的 openid（必填）
 *
 * 返回：
 * @returns {Object} { success: true, data: {} }
 *
 * 错误码：
 * - INVALID_PARAMS: 参数错误
 * - RELATION_NOT_FOUND: 好友关系不存在
 * - SYSTEM_ERROR: 系统错误
 *
 * @author Claude
 * @date 2026-02-08
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const { success, error, checkRequired } = require('./utils');

exports.main = async (event, context) => {
  const { friendOpenid } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    // 1. 参数校验
    const requiredError = checkRequired({ friendOpenid }, ['friendOpenid']);
    if (requiredError) {
      return error('INVALID_PARAMS', requiredError);
    }

    // 2. 查询好友关系
    const relationResult = await db.collection('friends')
      .where({
        status: 1, // 已同意
        _: _.or([
          {
            fromOpenid: OPENID,
            toOpenid: friendOpenid
          },
          {
            fromOpenid: friendOpenid,
            toOpenid: OPENID
          }
        ])
      })
      .get();

    if (!relationResult.data || relationResult.data.length === 0) {
      return error('RELATION_NOT_FOUND', '好友关系不存在');
    }

    const relation = relationResult.data[0];

    // 3. 删除好友关系
    await db.collection('friends')
      .doc(relation._id)
      .remove();

    // 4. 更新双方的 friendCount
    // 更新当前用户的 friendCount
    await db.collection('users')
      .where({ _openid: OPENID })
      .update({
        data: {
          friendCount: db.command.inc(-1)
        }
      });

    // 更新好友的 friendCount
    await db.collection('users')
      .where({ _openid: friendOpenid })
      .update({
        data: {
          friendCount: db.command.inc(-1)
        }
      });

    return success({});

  } catch (err) {
    console.error('[friend/deleteFriend] 删除好友失败:', err);
    return error('SYSTEM_ERROR', '系统错误');
  }
};
