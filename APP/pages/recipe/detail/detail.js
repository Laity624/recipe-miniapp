// pages/recipe/detail/detail.js
const app = getApp()
const { getEnumsByType, ENUM_TYPES } = require('../../../utils/enum.js')

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

  async onLoad(options) {
    const recipeId = options.id
    if (recipeId) {
      this.setData({ recipeId })
      await this.loadEnums()
      this.loadRecipeDetail(recipeId)
    }
  },

  // 加载枚举数据
  async loadEnums() {
    try {
      // 使用 enum.js 工具类获取枚举
      const [categories, tastes, cookingMethods, cookingTimes, difficulties, servings] = await Promise.all([
        getEnumsByType(ENUM_TYPES.CATEGORY),
        getEnumsByType(ENUM_TYPES.TASTE),
        getEnumsByType(ENUM_TYPES.COOKING_METHOD),
        getEnumsByType(ENUM_TYPES.COOKING_TIME),
        getEnumsByType(ENUM_TYPES.DIFFICULTY),
        getEnumsByType(ENUM_TYPES.SERVINGS)
      ])

      this.setData({
        'enums.categories': categories,
        'enums.tastes': tastes,
        'enums.cookingMethods': cookingMethods,
        'enums.cookingTimes': cookingTimes,
        'enums.difficulties': difficulties,
        'enums.servings': servings
      })
    } catch (err) {
      console.error('加载枚举失败:', err)
    }
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
        const isFavorite = res.result.data.isFavorite
        const author = res.result.data.author

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
            createTime,
            authorName: author.nickname,
            authorAvatar: author.avatarUrl
          },
          isOwner: canEdit,
          isFavorite
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
  async toggleFavorite() {
    const { isFavorite, recipeId } = this.data

    // 防止重复点击
    if (this.favoriteLoading) return
    this.favoriteLoading = true

    wx.showLoading({ title: isFavorite ? '取消中...' : '收藏中...' })

    try {
      const res = await wx.cloud.callFunction({
        name: 'favorite',
        data: {
          action: isFavorite ? 'removeFavorite' : 'addFavorite',
          recipeId
        }
      })

      wx.hideLoading()
      this.favoriteLoading = false

      if (res.result.success) {
        this.setData({
          isFavorite: !isFavorite
        })

        wx.showToast({
          title: isFavorite ? '已取消收藏' : '收藏成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: res.result.errorMessage || '操作失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      this.favoriteLoading = false
      console.error('收藏操作失败:', err)
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      })
    }
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
