// pages/favorite/favorite.js
Page({
  data: {
    list: []
  },

  onLoad(options) {
    this.loadFavorites()
  },

  onShow() {
    this.loadFavorites()
  },

  // 加载收藏列表
  loadFavorites() {
    wx.showLoading({ title: '加载中...' })

    // TODO: 调用云函数获取收藏列表
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          recipeId: 1,
          recipeName: '家常红烧肉',
          recipeDesc: '色泽红亮，肥而不腻',
          recipeImage: 'https://picsum.photos/200/200?random=1',
          authorName: '美食达人',
          authorAvatar: 'https://picsum.photos/50?random=1',
          createTime: '2天前'
        },
        {
          id: 2,
          recipeId: 2,
          recipeName: '番茄炒蛋',
          recipeDesc: '简单快手的家常菜',
          recipeImage: 'https://picsum.photos/200/200?random=2',
          authorName: '厨房小白',
          authorAvatar: 'https://picsum.photos/50?random=2',
          createTime: '5天前'
        }
      ]

      this.setData({
        list: mockData
      })
      wx.hideLoading()
    }, 500)
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/recipe/detail/detail?id=${id}`
    })
  },

  // 取消收藏
  cancelFavorite(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消收藏这个菜谱吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })

          // TODO: 调用云函数取消收藏
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '已取消收藏',
              icon: 'success'
            })
            this.loadFavorites()
          }, 500)
        }
      }
    })
  },

  // 去首页
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadFavorites()
    wx.stopPullDownRefresh()
  }
})

