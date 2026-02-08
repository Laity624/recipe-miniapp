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
      servingsText: '',
      cookingMethodText: '',
      ingredients: [],
      seasonings: [],
      steps: [],
      tips: '',
      notes: '',
      links: [],
      authorName: '作者',
      authorAvatar: '',
      createTime: ''
    },
    isFavorite: false,
    isOwner: false,
    // 枚举数据
    enums: {
      categories: [],
      tastes: [],
      difficulties: [],
      cookingTimes: [],
      servings: [],
      cookingMethods: []
    }
  },

  onLoad(options) {
    const recipeId = options.id
    if (recipeId) {
      this.setData({ recipeId })
      this.loadEnums().then(() => {
        this.loadRecipeDetail(recipeId)
      })
    }
  },

  // 加载枚举数据
  async loadEnums() {
    try {
      // 缓存过期时间：24小时（单位：毫秒）
      const CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000

      // 先尝试从缓存读取
      const cachedData = wx.getStorageSync('enumsCache')
      if (cachedData && cachedData.enums && cachedData.timestamp) {
        const now = Date.now()
        const cacheAge = now - cachedData.timestamp

        // 缓存未过期，直接使用
        if (cacheAge < CACHE_EXPIRE_TIME) {
          this.setEnumsData(cachedData.enums)
          return
        }
      }

      // 缓存不存在或已过期，调用云函数获取
      const res = await wx.cloud.callFunction({
        name: 'enum',
        data: {
          action: 'getEnums'
        }
      })

      if (res.result.success) {
        const enums = res.result.data.enums

        // 缓存到本地，带时间戳
        wx.setStorageSync('enumsCache', {
          enums,
          timestamp: Date.now()
        })

        this.setEnumsData(enums)
      }
    } catch (err) {
      console.error('加载枚举失败:', err)
    }
  },

  // 设置枚举数据
  setEnumsData(enums) {
    const categories = enums.filter(e => e.type === 'category' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    const tastes = enums.filter(e => e.type === 'taste' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    const cookingMethods = enums.filter(e => e.type === 'cookingMethod' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    const cookingTimes = enums.filter(e => e.type === 'cookingTime' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    const difficulties = enums.filter(e => e.type === 'difficulty' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    const servings = enums.filter(e => e.type === 'servings' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    this.setData({
      'enums.categories': categories,
      'enums.tastes': tastes,
      'enums.cookingMethods': cookingMethods,
      'enums.cookingTimes': cookingTimes,
      'enums.difficulties': difficulties,
      'enums.servings': servings
    })
  },

  // 枚举值转文本
  getEnumLabel(type, value) {
    const enumList = this.data.enums[type]
    if (!enumList || enumList.length === 0) {
      return ''
    }
    const item = enumList.find(e => e.value === value)
    return item ? item.label : ''
  },

  // 加载菜谱详情
  async loadRecipeDetail(recipeId) {
    wx.showLoading({ title: '加载中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'recipe',
        data: {
          action: 'getRecipeDetail',
          recipeId
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        const recipe = res.result.data.recipe
        const canEdit = res.result.data.canEdit

        // 枚举值转文本
        const categoryText = this.getEnumLabel('categories', recipe.category)
        const tasteText = this.getEnumLabel('tastes', recipe.taste)
        const difficultyText = this.getEnumLabel('difficulties', recipe.difficulty)
        const cookingTimeText = this.getEnumLabel('cookingTimes', recipe.cookingTime)
        const servingsText = this.getEnumLabel('servings', recipe.servings)
        const cookingMethodText = this.getEnumLabel('cookingMethods', recipe.cookingMethod)

        // 格式化创建时间
        const createTime = this.formatDate(recipe.createTime)

        this.setData({
          recipe: {
            ...recipe,
            categoryText,
            tasteText,
            difficultyText,
            cookingTimeText,
            servingsText,
            cookingMethodText,
            createTime
          },
          isOwner: canEdit
        })
      } else {
        wx.showToast({
          title: res.result.errorMessage || '加载失败',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (err) {
      wx.hideLoading()
      console.error('加载菜谱失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })

          try {
            const result = await wx.cloud.callFunction({
              name: 'recipe',
              data: {
                action: 'deleteRecipe',
                recipeId: this.data.recipeId
              }
            })

            wx.hideLoading()

            if (result.result.success) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
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
