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
      // 调用微信授权获取用户信息
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });

      console.log('获取用户信息成功:', userInfo);

      // 显示加载提示
      wx.showLoading({
        title: '登录中...',
        mask: true
      });

      // 模拟登录延迟
      await this.simulateLogin(userInfo);

      // 保存用户信息到本地
      wx.setStorageSync('userInfo', userInfo);

      wx.hideLoading();

      // 显示成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });

      // 延迟跳转到首页
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
          title: '登录失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  },

  /**
   * 模拟登录过程（后续替换为真实的云函数调用）
   */
  simulateLogin(userInfo) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // TODO: 这里后续需要调用云函数
        // 1. 调用 wx.login() 获取 code
        // 2. 调用云函数换取 openid
        // 3. 创建或更新用户信息
        // 4. 生成身份码
        resolve();
      }, 1000);
    });
  }
});

