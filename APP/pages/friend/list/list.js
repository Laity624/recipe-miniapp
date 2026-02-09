// pages/friend/list/list.js
Page({
  data: {
    activeTab: 0,
    friendList: [],
    requestList: [],
    friendCount: 0,
    requestCount: 0
  },

  onLoad(options) {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  // 加载数据
  loadData() {
    if (this.data.activeTab === 0) {
      this.loadFriendList()
    } else {
      this.loadRequestList()
    }
  },

  // 加载好友列表
  async loadFriendList() {
    wx.showLoading({ title: '加载中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'friend',
        data: {
          action: 'getFriendList'
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        const friends = res.result.data.friends

        this.setData({
          friendList: friends,
          friendCount: friends.length
        })
      } else {
        wx.showToast({
          title: res.result.errorMessage || '加载失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('加载好友列表失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 加载好友申请列表
  async loadRequestList() {
    wx.showLoading({ title: '加载中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'friend',
        data: {
          action: 'getFriendRequests',
          type: 'received'
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        const requests = res.result.data.requests

        // 格式化时间
        requests.forEach(req => {
          req.createTimeText = this.formatTime(req.createTime)
        })

        this.setData({
          requestList: requests,
          requestCount: requests.length
        })
      } else {
        wx.showToast({
          title: res.result.errorMessage || '加载失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('加载好友申请列表失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 格式化时间
  formatTime(date) {
    if (!date) return ''
    const now = new Date()
    const time = new Date(date)
    const diff = now - time
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return time.toLocaleDateString()
  },

  // 切换 Tab
  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab)
    this.setData({
      activeTab: tab
    })
    this.loadData()
  },

  // 查看好友的菜谱
  viewFriendRecipes(e) {
    const friend = e.currentTarget.dataset.friend
    // TODO: 跳转到好友的菜谱列表页
    wx.showToast({
      title: `查看 ${friend.nickname} 的菜谱`,
      icon: 'none'
    })
  },

  // 显示好友操作菜单
  showFriendAction(e) {
    const friend = e.currentTarget.dataset.friend
    wx.showActionSheet({
      itemList: ['查看菜谱', '删除好友'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.viewFriendRecipes({ currentTarget: { dataset: { friend } } })
        } else if (res.tapIndex === 1) {
          this.deleteFriend(friend)
        }
      }
    })
  },

  // 删除好友
  deleteFriend(friend) {
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法查看对方的公开菜谱',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })

          try {
            const result = await wx.cloud.callFunction({
              name: 'friend',
              data: {
                action: 'deleteFriend',
                friendOpenid: friend._openid
              }
            })

            wx.hideLoading()

            if (result.result.success) {
              wx.showToast({
                title: '已删除',
                icon: 'success'
              })
              this.loadFriendList()
            } else {
              wx.showToast({
                title: result.result.errorMessage || '删除失败',
                icon: 'none'
              })
            }
          } catch (err) {
            wx.hideLoading()
            console.error('删除好友失败:', err)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 处理好友申请
  async handleRequest(e) {
    const request = e.currentTarget.dataset.request
    const action = e.currentTarget.dataset.action
    const isAccept = action === 'accept'

    wx.showLoading({ title: '处理中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'friend',
        data: {
          action: 'handleFriendRequest',
          requestId: request._id,
          action: action
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        wx.showToast({
          title: isAccept ? '已同意' : '已拒绝',
          icon: 'success'
        })
        this.loadRequestList()
      } else {
        wx.showToast({
          title: res.result.errorMessage || '处理失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('处理好友申请失败:', err)
      wx.showToast({
        title: '处理失败',
        icon: 'none'
      })
    }
  },

  // 搜索好友
  searchFriend() {
    wx.navigateTo({
      url: '/pages/friend/search/search'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  }
})

