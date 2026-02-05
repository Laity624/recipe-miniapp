// pages/recipe/list/list.js
Page({
  data: {
    activeTab: 0,
    list: [],
    counts: {
      all: 0,
      published: 0,
      draft: 0
    },
    emptyText: '暂无菜谱'
  },

  onLoad(options) {
    this.loadRecipes()
  },

  onShow() {
    // 每次显示时刷新列表
    this.loadRecipes()
  },

  // 加载菜谱列表
  loadRecipes() {
    wx.showLoading({ title: '加载中...' })

    // TODO: 调用云函数获取菜谱列表
    // 根据 activeTab 筛选
    const status = this.data.activeTab === 1 ? 1 : (this.data.activeTab === 2 ? 0 : null)

    // 模拟数据
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          name: '家常红烧肉',
          description: '色泽红亮，肥而不腻',
          images: ['https://picsum.photos/200/200?random=1'],
          status: 1,
          isPublic: 1,
          viewCount: 128,
          favoriteCount: 45
        },
        {
          id: 2,
          name: '番茄炒蛋',
          description: '简单快手的家常菜',
          images: ['https://picsum.photos/200/200?random=2'],
          status: 0,
          isPublic: 0,
          viewCount: 0,
          favoriteCount: 0
        }
      ]

      let filteredList = mockData
      if (status !== null) {
        filteredList = mockData.filter(item => item.status === status)
      }

      this.setData({
        list: filteredList,
        counts: {
          all: mockData.length,
          published: mockData.filter(item => item.status === 1).length,
          draft: mockData.filter(item => item.status === 0).length
        }
      })

      this.updateEmptyText()
      wx.hideLoading()
    }, 500)
  },

  // 更新空状态文案
  updateEmptyText() {
    const texts = ['暂无菜谱', '暂无已发布的菜谱', '暂无草稿']
    this.setData({
      emptyText: texts[this.data.activeTab]
    })
  },

  // 切换 Tab
  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab)
    this.setData({
      activeTab: tab
    })
    this.loadRecipes()
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/recipe/detail/detail?id=${id}`
    })
  },

  // 显示操作菜单
  showActionSheet(e) {
    const item = e.currentTarget.dataset.item
    const itemList = ['编辑', '删除']
    
    if (item.status === 0) {
      itemList.unshift('发布')
    } else {
      itemList.unshift(item.isPublic === 1 ? '设为私密' : '设为公开')
    }

    wx.showActionSheet({
      itemList,
      success: (res) => {
        const index = res.tapIndex
        if (itemList[index] === '编辑') {
          this.editRecipe(item.id)
        } else if (itemList[index] === '删除') {
          this.deleteRecipe(item.id)
        } else if (itemList[index] === '发布') {
          this.publishRecipe(item.id)
        } else if (itemList[index].includes('设为')) {
          this.togglePublic(item.id, item.isPublic)
        }
      }
    })
  },

  // 编辑菜谱
  editRecipe(id) {
    wx.navigateTo({
      url: `/pages/recipe/edit/edit?id=${id}`
    })
  },

  // 删除菜谱
  deleteRecipe(id) {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用云函数删除
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          this.loadRecipes()
        }
      }
    })
  },

  // 发布菜谱
  publishRecipe(id) {
    // TODO: 调用云函数发布
    wx.showToast({
      title: '发布成功',
      icon: 'success'
    })
    this.loadRecipes()
  },

  // 切换公开/私密
  togglePublic(id, currentPublic) {
    const newPublic = currentPublic === 1 ? 0 : 1
    // TODO: 调用云函数更新
    wx.showToast({
      title: newPublic === 1 ? '已设为公开' : '已设为私密',
      icon: 'success'
    })
    this.loadRecipes()
  },

  // 创建菜谱
  createRecipe() {
    wx.navigateTo({
      url: '/pages/recipe/edit/edit'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecipes()
    wx.stopPullDownRefresh()
  }
})

