// pages/login/login.js
Page({
  data: {
    // 页面数据
  },

  onLoad(options) {
    // 检查是否已登录
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.nickName) {
      // 已登录，跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  /**
   * 处理登录
   */
  async handleLogin() {
    try {
      // 1. 调用微信授权获取用户信息
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });

      console.log('获取用户信息成功:', userInfo);

      // 显示加载提示
      wx.showLoading({
        title: '登录中...',
        mask: true
      });

      // 2. 调用云函数进行登录
      const result = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'login',
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      });

      console.log('云函数返回:', result);

      // 3. 检查登录结果
      if (!result.result.success) {
        throw new Error(result.result.errorMessage || '登录失败');
      }

      // 4. 保存完整的用户信息到本地
      const userData = result.result.data.user;
      wx.setStorageSync('userInfo', userData);

      wx.hideLoading();

      // 5. 根据是否首次登录显示不同提示
      const isFirstLogin = result.result.data.isFirstLogin;
      wx.showToast({
        title: isFirstLogin ? '欢迎加入！' : '欢迎回来！',
        icon: 'success',
        duration: 1500
      });

      // 6. 延迟跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);

    } catch (error) {
      console.error('登录失败:', error);

      wx.hideLoading();

      // 用户拒绝授权
      if (error.errMsg && error.errMsg.includes('getUserProfile:fail auth deny')) {
        wx.showToast({
          title: '您取消了授权',
          icon: 'none',
          duration: 2000
        });
      } else {
        wx.showToast({
          title: error.message || '登录失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  }
});

