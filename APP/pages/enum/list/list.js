// pages/enum/list/list.js
Page({
  data: {
    enumTypes: [],
    loading: true
  },

  onLoad(options) {
    // 页面加载时不立即加载数据，等待 onShow
  },

  onShow() {
    // 每次页面显示时都刷新数据（包括首次加载和从其他页面返回）
    this.loadEnumTypes();
  },

  /**
   * 加载枚举类型列表
   */
  async loadEnumTypes() {
    try {
      wx.showLoading({ title: '加载中...', mask: true });

      // 定义所有枚举类型
      const enumTypeConfigs = [
        { type: 'category', name: '菜谱分类' },
        { type: 'taste', name: '口味' },
        { type: 'cookingMethod', name: '烹饪方式' },
        { type: 'cookingTime', name: '烹饪时间' },
        { type: 'difficulty', name: '难度' },
        { type: 'servings', name: '人数' }
      ];

      // 并行获取所有枚举类型的数据
      const promises = enumTypeConfigs.map(config =>
        wx.cloud.callFunction({
          name: 'enum',
          data: {
            action: 'getEnums',
            type: config.type
          }
        }).then(result => ({
          ...config,
          count: result.result.success ? result.result.data.enums.length : 0
        }))
      );

      const enumTypes = await Promise.all(promises);

      this.setData({
        enumTypes,
        loading: false
      });

      wx.hideLoading();

    } catch (error) {
      console.error('加载枚举类型失败:', error);
      wx.hideLoading();

      this.setData({
        loading: false
      });

      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
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
