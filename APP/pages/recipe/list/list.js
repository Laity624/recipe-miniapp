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
    console.log('onload====');
    
    // 首次加载时同时获取列表和数量统计
    // this.loadCounts()
    // this.loadRecipes()
  },

  onShow() {
    console.log('onshow====');

    // 每次显示时刷新列表和数量统计
    this.loadCounts()
    this.loadRecipes()
  },

  // 加载菜谱列表
  async loadRecipes() {
    wx.showLoading({ title: '加载中...' })

    try {
      // 根据 activeTab 确定 status 参数
      let status = null
      if (this.data.activeTab === 1) {
        status = 1 // 已发布
      } else if (this.data.activeTab === 2) {
        status = 0 // 草稿
      }

      const res = await wx.cloud.callFunction({
        name: 'recipe',
        data: {
          action: 'searchRecipes',
          scene: 'mine',
          status: status,
          page: 1,
          pageSize: 30
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        const recipes = res.result.data.recipes

        this.setData({
          list: recipes
        })

        this.updateEmptyText()
      } else {
        wx.showToast({
          title: res.result.errorMessage || '加载失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('加载菜谱列表失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 加载数量统计
  async loadCounts() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'recipe',
        data: {
          action: 'getRecipeCounts',
          scene: 'mine'
        }
      })

      if (res.result.success) {
        this.setData({
          counts: res.result.data
        })
      }
    } catch (err) {
      console.error('加载数量统计失败:', err)
    }
  },

  // 获取指定状态的菜谱数量（已废弃，保留用于兼容）
  async getRecipeCount(status) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'recipe',
        data: {
          action: 'searchRecipes',
          scene: 'mine',
          status: status,
          page: 1,
          pageSize: 1
        }
      })

      if (res.result.success) {
        return res.result.data.total
      }
      return 0
    } catch (err) {
      console.error('获取菜谱数量失败:', err)
      return 0
    }
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
          this.editRecipe(item._id)
        } else if (itemList[index] === '删除') {
          this.deleteRecipe(item._id)
        } else if (itemList[index] === '发布') {
          this.publishRecipe(item._id)
        } else if (itemList[index].includes('设为')) {
          this.togglePublic(item._id, item.isPublic)
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
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })

          try {
            const result = await wx.cloud.callFunction({
              name: 'recipe',
              data: {
                action: 'deleteRecipe',
                recipeId: id
              }
            })

            wx.hideLoading()

            if (result.result.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              // 刷新列表和数量统计
              this.loadCounts()
              this.loadRecipes()
            } else {
              wx.showToast({
                title: result.result.errorMessage || '删除失败',
                icon: 'none'
              })
            }
          } catch (err) {
            wx.hideLoading()
            console.error('删除菜谱失败:', err)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 发布菜谱
  async publishRecipe(id) {
    wx.showLoading({ title: '发布中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'recipe',
        data: {
          action: 'publishRecipe',
          recipeId: id
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        })
        // 刷新列表和数量统计
        this.loadCounts()
        this.loadRecipes()
      } else {
        wx.showToast({
          title: res.result.errorMessage || '发布失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('发布菜谱失败:', err)
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      })
    }
  },

  // 切换公开/私密
  async togglePublic(id, currentPublic) {
    const newPublic = currentPublic === 1 ? 0 : 1
    wx.showLoading({ title: '更新中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'recipe',
        data: {
          action: 'updateRecipe',
          recipeId: id,
          isPublic: newPublic
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        wx.showToast({
          title: newPublic === 1 ? '已设为公开' : '已设为私密',
          icon: 'success'
        })
        this.loadRecipes()
      } else {
        wx.showToast({
          title: res.result.errorMessage || '更新失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('更新菜谱失败:', err)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 创建菜谱
  createRecipe() {
    wx.navigateTo({
      url: '/pages/recipe/edit/edit'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    // 刷新列表和数量统计
    this.loadCounts()
    this.loadRecipes()
    wx.stopPullDownRefresh()
  }
})