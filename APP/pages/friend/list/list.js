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
  loadFriendList() {
    wx.showLoading({ title: '加载中...' })

    // TODO: 调用云函数获取好友列表
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          nickname: '美食达人',
          avatarUrl: 'https://picsum.photos/100?random=1',
          bio: '热爱烹饪，分享美食',
          recipeCount: 25,
          favoriteCount: 128
        },
        {
          id: 2,
          nickname: '厨房小白',
          avatarUrl: 'https://picsum.photos/100?random=2',
          bio: '正在学习做菜',
          recipeCount: 5,
          favoriteCount: 12
        }
      ]

      this.setData({
        friendList: mockData,
        friendCount: mockData.length
      })
      wx.hideLoading()
    }, 500)
  },

  // 加载好友申请列表
  loadRequestList() {
    wx.showLoading({ title: '加载中...' })

    // TODO: 调用云函数获取申请列表
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          nickname: '新朋友',
          avatarUrl: 'https://picsum.photos/100?random=3',
          createTime: '2小时前',
          status: 0
        }
      ]

      this.setData({
        requestList: mockData,
        requestCount: mockData.filter(item => item.status === 0).length
      })
      wx.hideLoading()
    }, 500)
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
          this.deleteFriend(friend.id)
        }
      }
    })
  },

  // 删除好友
  deleteFriend(friendId) {
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法查看对方的公开菜谱',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用云函数删除好友
          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
          this.loadFriendList()
        }
      }
    })
  },

  // 处理好友申请
  handleRequest(e) {
    const id = e.currentTarget.dataset.id
    const action = e.currentTarget.dataset.action
    const isAccept = action === 'accept'

    wx.showLoading({ title: '处理中...' })

    // TODO: 调用云函数处理申请
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: isAccept ? '已同意' : '已拒绝',
        icon: 'success'
      })
      this.loadRequestList()
    }, 500)
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

