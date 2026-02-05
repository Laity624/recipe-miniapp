// pages/recipe/detail/detail.js
const app = getApp()

Page({
  data: {
    recipeId: '',
    recipe: {
      name: '',
      description: '',
      images: [],
      categoryText: '',
      tasteText: '',
      difficultyText: '',
      cookingTimeText: '',
      ingredients: [],
      seasonings: [],
      steps: [],
      tips: '',
      notes: '',
      links: [],
      authorName: '',
      authorAvatar: '',
      createTime: ''
    },
    isFavorite: false,
    isOwner: false
  },

  onLoad(options) {
    const recipeId = options.id
    if (recipeId) {
      this.setData({ recipeId })
      this.loadRecipeDetail(recipeId)
    }
  },

  // 加载菜谱详情
  loadRecipeDetail(recipeId) {
    wx.showLoading({ title: '加载中...' })

    // TODO: 调用云函数获取菜谱详情
    // wx.cloud.callFunction({
    //   name: 'getRecipeDetail',
    //   data: { recipeId },
    //   success: res => {
    //     this.setData({
    //       recipe: res.result.recipe,
    //       isFavorite: res.result.isFavorite,
    //       isOwner: res.result.isOwner
    //     })
    //   },
    //   complete: () => {
    //     wx.hideLoading()
    //   }
    // })

    // 模拟数据
    setTimeout(() => {
      this.setData({
        recipe: {
          name: '家常红烧肉',
          description: '色泽红亮，肥而不腻，入口即化的经典家常菜',
          images: [
            'https://picsum.photos/750/500?random=1',
            'https://picsum.photos/750/500?random=2'
          ],
          categoryText: '家常菜',
          tasteText: '微辣',
          difficultyText: '中等',
          cookingTimeText: '60分钟',
          ingredients: [
            { name: '五花肉', amount: '500g' },
            { name: '冰糖', amount: '30g' },
            { name: '葱姜蒜', amount: '适量' }
          ],
          seasonings: [
            { name: '生抽', amount: '2勺' },
            { name: '老抽', amount: '1勺' },
            { name: '料酒', amount: '2勺' }
          ],
          steps: [
            { order: 1, content: '五花肉切块，冷水下锅焯水去腥', image: '' },
            { order: 2, content: '锅中放少许油，加入冰糖炒糖色', image: '' },
            { order: 3, content: '放入五花肉翻炒上色', image: '' },
            { order: 4, content: '加入调料和热水，大火烧开转小火炖40分钟', image: '' },
            { order: 5, content: '大火收汁即可', image: '' }
          ],
          tips: '炒糖色时火候要掌握好，不要炒糊了',
          notes: '五花肉要选择肥瘦相间的',
          links: [],
          authorName: '美食家',
          authorAvatar: 'https://picsum.photos/100?random=1',
          createTime: '2026-02-04'
        },
        isOwner: true
      })
      wx.hideLoading()
    }, 500)
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const images = this.data.recipe.images
    wx.previewImage({
      current: url,
      urls: images
    })
  },

  // 切换收藏
  toggleFavorite() {
    const isFavorite = !this.data.isFavorite
    this.setData({ isFavorite })

    // TODO: 调用云函数
    wx.showToast({
      title: isFavorite ? '收藏成功' : '取消收藏',
      icon: 'success'
    })
  },

  // 编辑菜谱
  editRecipe() {
    wx.navigateTo({
      url: `/pages/recipe/edit/edit?id=${this.data.recipeId}`
    })
  },

  // 删除菜谱
  deleteRecipe() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个菜谱吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用云函数删除
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            success: () => {
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            }
          })
        }
      }
    })
  },

  // 分享菜谱
  shareRecipe() {
    // 触发分享
  },

  // 复制链接
  copyLink(e) {
    const link = e.currentTarget.dataset.link
    wx.setClipboardData({
      data: link,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        })
      }
    })
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: this.data.recipe.name,
      path: `/pages/recipe/detail/detail?id=${this.data.recipeId}`,
      imageUrl: this.data.recipe.images[0]
    }
  }
})

