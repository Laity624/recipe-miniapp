// pages/friend/search/search.js
Page({
  data: {
    keyword: '',
    hasSearched: false,
    userInfo: null,
    historyList: []
  },

  onLoad(options) {
    this.loadHistory()
  },

  // 加载搜索历史
  loadHistory() {
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({
      historyList: history
    })
  },

  // 保存搜索历史
  saveHistory(keyword) {
    let history = wx.getStorageSync('searchHistory') || []
    // 去重
    history = history.filter(item => item !== keyword)
    // 添加到开头
    history.unshift(keyword)
    // 最多保存10条
    if (history.length > 10) {
      history = history.slice(0, 10)
    }
    wx.setStorageSync('searchHistory', history)
    this.setData({
      historyList: history
    })
  },

  // 输入事件
  onInput(e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  // 清空输入
  clearInput() {
    this.setData({
      keyword: '',
      hasSearched: false,
      userInfo: null
    })
  },

  // 搜索
  onSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '搜索中...' })

    // TODO: 调用云函数搜索用户
    setTimeout(() => {
      // 模拟搜索结果
      const mockUser = {
        id: 1,
        nickname: '美食达人',
        avatarUrl: 'https://picsum.photos/100?random=1',
        identityCode: 'ABC123',
        bio: '热爱烹饪，分享美食',
        recipeCount: 25,
        friendCount: 10,
        isFriend: false,
        isPending: false
      }

      this.setData({
        hasSearched: true,
        userInfo: keyword === 'ABC123' ? mockUser : null
      })

      if (keyword === 'ABC123') {
        this.saveHistory(keyword)
      }

      wx.hideLoading()
    }, 500)
  },

  // 点击历史记录
  searchHistory(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({
      keyword
    })
    this.onSearch()
  },

  // 清空历史
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          this.setData({
            historyList: []
          })
        }
      }
    })
  },

  // 发送好友申请
  sendRequest() {
    wx.showLoading({ title: '发送中...' })

    // TODO: 调用云函数发送好友申请
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '申请已发送',
        icon: 'success'
      })

      this.setData({
        'userInfo.isPending': true
      })
    }, 500)
  }
})

