// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '菜谱',
        iconPath: '/assets/icons/recipe.svg',
        selectedIconPath: '/assets/icons/recipe-active.svg'
      },
      {
        pagePath: '/pages/mine/mine',
        text: '我的',
        iconPath: '/assets/icons/mine.svg',
        selectedIconPath: '/assets/icons/mine-active.svg'
      }
    ]
  },

  methods: {
    /**
     * 切换 tab
     */
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset;

      // 更新选中状态
      this.setData({
        selected: index
      });

      // 切换页面
      wx.switchTab({
        url: path
      });
    },

    /**
     * 初始化选中状态
     */
    init() {
      const page = getCurrentPages().pop();
      const route = page ? `/${page.route}` : '';

      const index = this.data.list.findIndex(item => item.pagePath === route);

      if (index !== -1) {
        this.setData({
          selected: index
        });
      }
    }
  }
});
