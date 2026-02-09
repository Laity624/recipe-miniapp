// pages/index/index.js
const { getEnumsByType, getEnumLabel, ENUM_TYPES } = require('../../utils/enum.js')

Page({
  data: {
    currentTag: 0,
    tags: [], // 动态从枚举加载
    leftList: [],
    rightList: [],
    searchKeyword: '',
    // 分页相关
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    // 枚举数据
    enums: {
      categories: [],
      cookingTimes: [],
      difficulties: []
    }
  },

  async onLoad(options) {
    await this.loadEnums()
    this.loadRecipes()
  },

  onShow() {
    // 页面显示时刷新数据
    // 更新自定义 tab 栏选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  },

  // 加载枚举数据
  async loadEnums() {
    try {
      // 使用 enum.js 工具类获取枚举
      const [categories, cookingTimes, difficulties] = await Promise.all([
        getEnumsByType(ENUM_TYPES.CATEGORY),
        getEnumsByType(ENUM_TYPES.COOKING_TIME),
        getEnumsByType(ENUM_TYPES.DIFFICULTY)
      ])

      // 构建标签列表：在分类前面添加"全部"
      const tags = [
        { label: '全部', value: null },
        ...categories
      ]

      this.setData({
        'enums.categories': categories,
        'enums.cookingTimes': cookingTimes,
        'enums.difficulties': difficulties,
        tags
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

  // 加载菜谱数据
  async loadRecipes(isLoadMore = false) {
    // 如果是加载更多，但没有更多数据了，直接返回
    if (isLoadMore && !this.data.hasMore) {
      return
    }

    wx.showLoading({ title: '加载中...' })

    try {
      // 确定当前页码
      const page = isLoadMore ? this.data.currentPage + 1 : 1

      // 获取当前选中的标签
      const currentTag = this.data.tags[this.data.currentTag]
      const category = currentTag ? currentTag.value : null

      const res = await wx.cloud.callFunction({
        name: 'recipe',
        data: {
          action: 'searchRecipes',
          scene: 'public',
          keyword: this.data.searchKeyword || undefined,
          category: category,
          page: page,
          pageSize: this.data.pageSize
        }
      })

      wx.hideLoading()

      if (res.result.success) {
        const recipes = res.result.data.recipes
        const hasMore = res.result.data.hasMore

        // 转换数据格式
        const formattedList = recipes.map(recipe => this.formatRecipeData(recipe))

        if (isLoadMore) {
          // 加载更多：追加数据
          const allList = [...this.data.leftList, ...this.data.rightList, ...formattedList]
          this.distributeData(allList)
          this.setData({
            currentPage: page,
            hasMore: hasMore
          })
        } else {
          // 首次加载或刷新：替换数据
          this.distributeData(formattedList)
          this.setData({
            currentPage: page,
            hasMore: hasMore
          })
        }
      } else {
        wx.showToast({
          title: res.result.errorMessage || '加载失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('加载菜谱失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 格式化菜谱数据
  formatRecipeData(recipe) {
    return {
      id: recipe._id,
      title: recipe.name,
      image: recipe.images && recipe.images.length > 0 ? recipe.images[0] : '',
      time: this.getEnumLabel('cookingTimes', recipe.cookingTime) || '未知',
      difficulty: this.getEnumLabel('difficulties', recipe.difficulty) || '未知',
      author: recipe.authorName || '未知用户',
      avatar: recipe.authorAvatar || '',
      likes: recipe.favoriteCount || 0
    }
  },

  // 将数据分配给左右两列
  distributeData(list) {
    const leftList = []
    const rightList = []

    list.forEach((item, index) => {
      if (index % 2 === 0) {
        leftList.push(item)
      } else {
        rightList.push(item)
      }
    })

    this.setData({
      leftList,
      rightList
    })
  },

  // 选择标签
  selectTag(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentTag: index,
      searchKeyword: '' // 切换标签时清空搜索关键词
    })
    // 重新加载数据
    this.loadRecipes()
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 搜索确认
  onSearchConfirm(e) {
    const keyword = e.detail.value.trim()
    this.setData({
      searchKeyword: keyword,
      currentTag: 0 // 搜索时重置到"全部"标签
    })
    // 重新加载数据
    this.loadRecipes()
  },

  // 跳转到详情页
  goToDetail(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/recipe/detail/detail?id=${item.id}`
    })
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
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore) {
      this.loadRecipes(true)
    }
  }
})