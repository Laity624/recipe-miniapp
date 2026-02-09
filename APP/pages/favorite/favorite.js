// pages/favorite/favorite.js
const { callFunction } = require('../../utils/request.js')
const { formatFriendlyTime, showToast, showConfirm } = require('../../utils/util.js')
const { getEnumsByType, getEnumLabel, ENUM_TYPES } = require('../../utils/enum.js')

Page({
  data: {
    // 列表数据
    list: [],
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,

    // 搜索关键词
    keyword: '',

    // 筛选条件
    filterCategory: null,
    filterTaste: null,
    filterMethod: null,

    // 筛选选项
    categoryOptions: [],
    tasteOptions: [],
    methodOptions: [],

    // 空状态文本
    emptyText: '还没有收藏任何菜谱',
    hasFilter: false
  },

  onLoad(options) {
    this.initFilters()
    this.loadFavorites(true)
  },

  onShow() {
    // 从详情页返回时刷新列表
    if (this.data.list.length > 0) {
      this.loadFavorites(true)
    }
  },

  /**
   * 初始化筛选选项
   */
  async initFilters() {
    try {
      // 获取枚举值
      const [categories, tastes, methods] = await Promise.all([
        getEnumsByType(ENUM_TYPES.CATEGORY),
        getEnumsByType(ENUM_TYPES.TASTE),
        getEnumsByType(ENUM_TYPES.COOKING_METHOD)
      ])

      // 转换为 vant dropdown 格式
      const categoryOptions = [
        { text: '全部分类', value: null },
        ...categories.map(item => ({ text: item.label, value: item.value }))
      ]

      const tasteOptions = [
        { text: '全部口味', value: null },
        ...tastes.map(item => ({ text: item.label, value: item.value }))
      ]

      const methodOptions = [
        { text: '全部方式', value: null },
        ...methods.map(item => ({ text: item.label, value: item.value }))
      ]

      this.setData({
        categoryOptions,
        tasteOptions,
        methodOptions
      })
    } catch (err) {
      console.error('初始化筛选选项失败:', err)
    }
  },

  /**
   * 加载收藏列表
   * @param {Boolean} refresh 是否刷新（重置页码）
   */
  async loadFavorites(refresh = false) {
    if (this.data.loading) return

    // 如果是刷新，重置页码
    if (refresh) {
      this.setData({
        page: 1,
        list: [],
        hasMore: true
      })
    }

    // 如果没有更多数据，不再加载
    if (!refresh && !this.data.hasMore) {
      return
    }

    this.setData({ loading: true })

    try {
      const { page, pageSize, keyword, filterCategory, filterTaste, filterMethod } = this.data

      // 构建请求参数
      const params = {
        action: 'getFavoriteList',
        page,
        pageSize
      }

      // 添加搜索关键词
      if (keyword) {
        params.keyword = keyword
      }

      // 添加筛选条件
      if (filterCategory !== null) {
        params.category = filterCategory
      }
      if (filterTaste !== null) {
        params.taste = filterTaste
      }
      if (filterMethod !== null) {
        params.cookingMethod = filterMethod
      }

      // 调用云函数
      const result = await callFunction('favorite', params)

      const { list, total, hasMore } = result

      // 处理列表数据
      const processedList = await this.processList(list)

      this.setData({
        list: refresh ? processedList : [...this.data.list, ...processedList],
        total,
        hasMore,
        page: page + 1,
        loading: false,
        emptyText: this.getEmptyText()
      })
    } catch (err) {
      console.error('加载收藏列表失败:', err)
      showToast('加载失败，请重试')
      this.setData({ loading: false })
    }
  },

  /**
   * 处理列表数据
   * @param {Array} list 原始列表
   * @returns {Array} 处理后的列表
   */
  async processList(list) {
    return Promise.all(list.map(async item => {
      // 格式化时间
      item.createTimeText = formatFriendlyTime(item.createTime)

      // 获取枚举标签
      item.categoryLabel = await getEnumLabel(ENUM_TYPES.CATEGORY, item.category)
      item.tasteLabel = await getEnumLabel(ENUM_TYPES.TASTE, item.taste)

      return item
    }))
  },

  /**
   * 获取空状态文本
   */
  getEmptyText() {
    const { keyword, filterCategory, filterTaste, filterMethod } = this.data
    const hasFilter = keyword || filterCategory !== null || filterTaste !== null || filterMethod !== null

    this.setData({ hasFilter })

    if (hasFilter) {
      return '没有找到符合条件的菜谱'
    }
    return '还没有收藏任何菜谱'
  },

  /**
   * 搜索框输入
   */
  onSearchChange(e) {
    this.setData({ keyword: e.detail })
  },

  /**
   * 搜索
   */
  onSearch() {
    this.loadFavorites(true)
  },

  /**
   * 清空搜索
   */
  onSearchClear() {
    this.setData({ keyword: '' })
    this.loadFavorites(true)
  },

  /**
   * 分类筛选
   */
  onCategoryChange(e) {
    this.setData({ filterCategory: e.detail })
    this.loadFavorites(true)
  },

  /**
   * 口味筛选
   */
  onTasteChange(e) {
    this.setData({ filterTaste: e.detail })
    this.loadFavorites(true)
  },

  /**
   * 烹饪方式筛选
   */
  onMethodChange(e) {
    this.setData({ filterMethod: e.detail })
    this.loadFavorites(true)
  },

  /**
   * 重置筛选
   */
  resetFilter() {
    this.setData({
      keyword: '',
      filterCategory: null,
      filterTaste: null,
      filterMethod: null
    })
    this.loadFavorites(true)
  },

  /**
   * 跳转到详情
   */
  goToDetail(e) {
    const { id, deleted, private: isPrivate } = e.currentTarget.dataset

    // 如果菜谱已删除或私密，给出提示
    if (deleted) {
      showToast('该菜谱已被删除')
      return
    }

    if (isPrivate) {
      showToast('该菜谱已设为私密')
      return
    }

    wx.navigateTo({
      url: `/pages/recipe/detail/detail?id=${id}`
    })
  },

  /**
   * 取消收藏
   */
  async cancelFavorite(e) {
    const recipeId = e.currentTarget.dataset.id

    const confirmed = await showConfirm('确定要取消收藏这个菜谱吗？', '确认取消')
    if (!confirmed) return

    try {
      wx.showLoading({ title: '处理中...' })

      await callFunction('favorite', {
        action: 'removeFavorite',
        recipeId
      })

      wx.hideLoading()
      showToast('已取消收藏', 'success')
      // 刷新列表
      this.loadFavorites(true)
    } catch (err) {
      wx.hideLoading()
      console.error('取消收藏失败:', err)
      showToast('取消失败，请重试')
    }
  },

  /**
   * 去首页
   */
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadFavorites(true)
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    this.loadFavorites(false)
  }
})
