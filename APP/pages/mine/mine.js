// pages/mine/mine.js
const app = getApp()

Page({
  data: {
    userInfo: {
      nickname: '美食家',
      avatarUrl: '',
      identityCode: 'ABC123',
      bio: '热爱烹饪，分享美食',
      recipeCount: 0,
      friendCount: 0,
      favoriteCount: 0,
      isAdmin: true  // 测试用，设置为管理员
    }
  },

  onLoad(options) {
    // this.loadUserInfo()
  },

  onShow() {
    // 每次显示时刷新用户信息
    // this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    // 从全局数据或缓存中获取用户信息
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    
    if (userInfo) {
      this.setData({
        userInfo
      })
    } else {
      // 未登录，引导登录
      this.showLoginTip()
    }

    // TODO: 调用云函数获取最新的用户统计数据
    this.getUserStats()
  },

  // 获取用户统计数据
  getUserStats() {
    // TODO: 调用云函数
    // wx.cloud.callFunction({
    //   name: 'getUserStats',
    //   success: res => {
    //     this.setData({
    //       'userInfo.recipeCount': res.result.recipeCount,
    //       'userInfo.friendCount': res.result.friendCount,
    //       'userInfo.favoriteCount': res.result.favoriteCount
    //     })
    //   }
    // })
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

