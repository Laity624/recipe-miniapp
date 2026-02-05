// pages/enum/list/list.js
Page({
  data: {
    enumTypes: []
  },

  onLoad(options) {
    this.loadEnumTypes();
  },

  /**
   * 加载枚举类型列表
   */
  loadEnumTypes() {
    // 模拟数据，后续替换为云函数调用
    const enumTypes = [
      {
        type: 'category',
        name: '菜谱分类',
        count: 8
      },
      {
        type: 'taste',
        name: '口味',
        count: 6
      },
      {
        type: 'cookingMethod',
        name: '烹饪方式',
        count: 10
      },
      {
        type: 'cookingTime',
        name: '烹饪时间',
        count: 5
      },
      {
        type: 'difficulty',
        name: '难度',
        count: 3
      },
      {
        type: 'servings',
        name: '人数',
        count: 6
      }
    ];

    this.setData({
      enumTypes
    });
  },

  /**
   * 跳转到枚举管理页面
   */
  goToManage(e) {
    const { type } = e.currentTarget.dataset;
    const enumType = this.data.enumTypes.find(item => item.type === type);

    wx.navigateTo({
      url: `/pages/enum/manage/manage?type=${type}&name=${enumType.name}`
    });
  }
});
