// pages/index/index.js
Page({
  data: {
    currentTag: 0,
    tags: ['全部', '家常菜', '快手餐', '减脂餐', '烘焙', '汤羹', '川菜', '粤菜'],
    leftList: [],
    rightList: [],
    searchKeyword: ''
  },

  onLoad(options) {
    this.loadRecipes()
  },

  onShow() {
    // 页面显示时刷新数据
  },

  // 加载菜谱数据
  loadRecipes() {
    // 模拟数据，实际应该调用云函数
    const rawList = [
      { id: 1, title: '家常红烧肉', image: 'https://picsum.photos/300/400?random=1', time: '60分钟', difficulty: '中等', author: '美食家', avatar: 'https://picsum.photos/50?random=1', likes: 128 },
      { id: 2, title: '番茄炒蛋', image: 'https://picsum.photos/300/320?random=2', time: '15分钟', difficulty: '简单', author: '小白', avatar: 'https://picsum.photos/50?random=2', likes: 89 },
      { id: 3, title: '麻辣香锅', image: 'https://picsum.photos/300/380?random=3', time: '45分钟', difficulty: '中等', author: '川菜大师', avatar: 'https://picsum.photos/50?random=3', likes: 256 },
      { id: 4, title: '清爽解腻的凉拌黄瓜', image: 'https://picsum.photos/300/350?random=4', time: '5分钟', difficulty: '简单', author: '阿强', avatar: 'https://picsum.photos/50?random=4', likes: 45 },
      { id: 5, title: '红烧肉', image: 'https://picsum.photos/300/420?random=5', time: '90分钟', difficulty: '中等', author: '姥姥的味道', avatar: 'https://picsum.photos/50?random=5', likes: 999 },
      { id: 6, title: '减脂沙拉', image: 'https://picsum.photos/300/280?random=6', time: '10分钟', difficulty: '简单', author: 'FitLife', avatar: 'https://picsum.photos/50?random=6', likes: 12 }
    ]

    this.distributeData(rawList)
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
      currentTag: index
    })
    // TODO: 根据标签筛选数据
    console.log('选择标签:', this.data.tags[index])
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 搜索确认
  onSearchConfirm(e) {
    const keyword = e.detail.value
    console.log('搜索:', keyword)
    // TODO: 调用搜索接口
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
    console.log('加载更多')
    // TODO: 加载更多数据
  }
})

