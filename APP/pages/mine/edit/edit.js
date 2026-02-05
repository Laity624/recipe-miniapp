/**
 * 编辑个人资料页面
 *
 * 功能：
 * - 更换头像（选择图片并上传到云存储）
 * - 编辑昵称（1-20字符）
 * - 编辑个人简介（最多200字符）
 *
 * @author Claude
 * @date 2026-02-05
 */

const app = getApp();

Page({
  data: {
    avatarUrl: '',
    nickName: '',
    bio: '',
    saving: false
  },

  onLoad(options) {
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        avatarUrl: userInfo.avatarUrl || '',
        nickName: userInfo.nickName || '',
        bio: userInfo.bio || ''
      });
    }
  },

  /**
   * 选择并上传头像
   */
  async chooseAvatar() {
    try {
      // 1. 选择图片
      const { tempFiles } = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'], // 压缩图片
        sourceType: ['album', 'camera']
      });

      const tempFilePath = tempFiles[0].tempFilePath;

      // 显示加载提示
      wx.showLoading({
        title: '上传中...',
        mask: true
      });

      // 2. 上传到云存储
      const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      });

      wx.hideLoading();

      // 3. 更新页面显示
      this.setData({
        avatarUrl: uploadResult.fileID
      });

      wx.showToast({
        title: '头像已更换',
        icon: 'success'
      });

    } catch (error) {
      console.error('上传头像失败:', error);
      wx.hideLoading();

      // 用户取消选择
      if (error.errMsg && error.errMsg.includes('chooseMedia:fail cancel')) {
        return;
      }

      wx.showToast({
        title: '上传失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 昵称输入变化
   */
  onNickNameChange(e) {
    this.setData({
      nickName: e.detail
    });
  },

  /**
   * 个人简介输入变化
   */
  onBioChange(e) {
    this.setData({
      bio: e.detail
    });
  },

  /**
   * 保存用户信息
   */
  async saveUserInfo() {
    const { avatarUrl, nickName, bio } = this.data;

    // 参数校验
    if (!nickName || nickName.trim().length === 0) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    if (nickName.length > 20) {
      wx.showToast({
        title: '昵称不能超过20个字符',
        icon: 'none'
      });
      return;
    }

    if (bio.length > 200) {
      wx.showToast({
        title: '个人简介不能超过200个字符',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ saving: true });

      // 调用云函数更新用户信息
      const result = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'updateInfo',
          avatarUrl,
          nickName: nickName.trim(),
          bio: bio.trim()
        }
      });

      if (!result.result.success) {
        throw new Error(result.result.errorMessage || '更新失败');
      }

      // 更新本地存储
      const updatedUser = result.result.data.user;
      wx.setStorageSync('userInfo', updatedUser);

      // 同步到全局数据
      app.globalData.userInfo = updatedUser;

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('保存失败:', error);

      wx.showToast({
        title: error.message || '保存失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ saving: false });
    }
  }
});

