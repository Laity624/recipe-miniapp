// pages/mine/mine.js
const app = getApp()

Page({
  data: {
    userInfo: null
  },

  onLoad(options) {
    this.loadUserInfo();
  },

  onShow() {
    // 每次显示时刷新用户信息
    this.loadUserInfo();

    // 更新自定义 tab 栏选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  // 加载用户信息
  loadUserInfo() {
    // 从全局数据或缓存中获取用户信息
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');

    if (userInfo && userInfo._openid) {
      this.setData({
        userInfo
      });

      // 同步到全局数据
      app.globalData.userInfo = userInfo;
    } else {
      // 未登录，引导登录
      this.showLoginTip();
    }
  },

  // 获取用户统计数据
  getUserStats() {
    // 统计数据已经在用户信息中，暂时不需要单独获取
    // 后续如果需要实时更新统计数据，可以在这里调用云函数
  },

  // 页面跳转
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    if (!url) return
    
    wx.navigateTo({
      url
    })
  },

  // 编辑资料
  editProfile() {
    wx.navigateTo({
      url: '/pages/mine/edit/edit'
    })
  },

  // 显示关于
  showAbout() {
    wx.showModal({
      title: '关于',
      content: '个人菜谱管理小程序 v1.0.0\n\n一个温暖的美食分享平台',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 显示登录提示
  showLoginTip() {
    wx.showModal({
      title: '提示',
      content: '您还未登录，是否立即登录？',
      success: (res) => {
        if (res.confirm) {
          this.login()
        }
      }
    })
  },

  // 登录
  login() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadUserInfo()
    wx.stopPullDownRefresh()
  }
})

