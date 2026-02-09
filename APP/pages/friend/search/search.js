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
  async onSearch() {
    const keyword = this.data.keyword.trim().toUpperCase()
    if (!keyword) {
      wx.showToast({
        title: '请输入身份码',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '搜索中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'friend',
        data: {
          action: 'searchUserByCode',
          identityCode: keyword
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        const user = res.result.data.user

        // 检查是否已经是好友或有待处理的请求
        const isFriend = await this.checkFriendStatus(user._openid)

        this.setData({
          hasSearched: true,
          userInfo: {
            ...user,
            isFriend: isFriend.isFriend,
            isPending: isFriend.isPending
          }
        })

        this.saveHistory(keyword)
      } else {
        this.setData({
          hasSearched: true,
          userInfo: null
        })

        if (res.result.errorCode === 'USER_NOT_FOUND') {
          wx.showToast({
            title: '未找到该用户',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: res.result.errorMessage || '搜索失败',
            icon: 'none'
          })
        }
      }
    } catch (err) {
      wx.hideLoading()
      console.error('搜索用户失败:', err)
      wx.showToast({
        title: '搜索失败',
        icon: 'none'
      })
    }
  },

  // 检查好友状态
  async checkFriendStatus(targetOpenid) {
    try {
      // 获取好友列表
      const friendsRes = await wx.cloud.callFunction({
        name: 'friend',
        data: {
          action: 'getFriendList'
        }
      })

      if (friendsRes.result.success) {
        const friends = friendsRes.result.data.friends
        const isFriend = friends.some(f => f._openid === targetOpenid)
        if (isFriend) {
          return { isFriend: true, isPending: false }
        }
      }

      // 获取发出的好友请求
      const requestsRes = await wx.cloud.callFunction({
        name: 'friend',
        data: {
          action: 'getFriendRequests',
          type: 'sent'
        }
      })

      if (requestsRes.result.success) {
        const requests = requestsRes.result.data.requests
        const isPending = requests.some(r => r.toOpenid === targetOpenid)
        return { isFriend: false, isPending }
      }

      return { isFriend: false, isPending: false }
    } catch (err) {
      console.error('检查好友状态失败:', err)
      return { isFriend: false, isPending: false }
    }
  },

  // 发送好友申请
  async sendRequest() {
    if (!this.data.userInfo) {
      return
    }

    wx.showLoading({ title: '发送中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'friend',
        data: {
          action: 'sendFriendRequest',
          identityCode: this.data.userInfo.identityCode
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        wx.showToast({
          title: '申请已发送',
          icon: 'success'
        })

        this.setData({
          'userInfo.isPending': true
        })
      } else {
        wx.showToast({
          title: res.result.errorMessage || '发送失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('发送好友申请失败:', err)
      wx.showToast({
        title: '发送失败',
        icon: 'none'
      })
    }
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
  async sendRequest() {
    if (!this.data.userInfo) {
      return
    }

    wx.showLoading({ title: '发送中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'friend',
        data: {
          action: 'sendFriendRequest',
          identityCode: this.data.userInfo.identityCode
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        wx.showToast({
          title: '申请已发送',
          icon: 'success'
        })

        this.setData({
          'userInfo.isPending': true
        })
      } else {
        wx.showToast({
          title: res.result.errorMessage || '发送失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('发送好友申请失败:', err)
      wx.showToast({
        title: '发送失败',
        icon: 'none'
      })
    }
  }
})

