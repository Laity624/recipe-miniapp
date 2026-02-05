// pages/enum/manage/manage.js
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    type: '',
    typeName: '',
    enumList: [],
    showDialog: false,
    dialogTitle: '',
    isEdit: false,
    currentIndex: -1,
    formData: {
      label: '',
      value: ''
    },
    showActionSheet: false,
    actions: [
      { name: '编辑', color: '#333333' },
      { name: '上移', color: '#333333' },
      { name: '下移', color: '#333333' },
      { name: '删除', color: '#FF6B6B' }
    ]
  },

  onLoad(options) {
    const { type, name } = options;
    this.setData({
      type,
      typeName: name
    });
    this.loadEnumList();
  },

  /**
   * 加载枚举值列表
   */
  loadEnumList() {
    // 模拟数据，后续替换为云函数调用
    const mockData = this.getMockData(this.data.type);
    this.setData({
      enumList: mockData
    });
  },

  /**
   * 获取模拟数据
   */
  getMockData(type) {
    const dataMap = {
      category: [
        { type: 'category', value: 0, label: '家常菜', sort: 0, isActive: true },
        { type: 'category', value: 1, label: '川菜', sort: 1, isActive: true },
        { type: 'category', value: 2, label: '粤菜', sort: 2, isActive: true },
        { type: 'category', value: 3, label: '湘菜', sort: 3, isActive: true },
        { type: 'category', value: 4, label: '鲁菜', sort: 4, isActive: false }
      ],
      taste: [
        { type: 'taste', value: 0, label: '清淡', sort: 0, isActive: true },
        { type: 'taste', value: 1, label: '微辣', sort: 1, isActive: true },
        { type: 'taste', value: 2, label: '中辣', sort: 2, isActive: true }
      ]
    };
    return dataMap[type] || [];
  },

  /**
   * 显示新增弹窗
   */
  showAddDialog() {
    this.setData({
      showDialog: true,
      dialogTitle: '新增枚举值',
      isEdit: false,
      currentIndex: -1,
      formData: {
        label: '',
        value: this.getNextValue()
      }
    });
  },

  /**
   * 获取下一个可用的枚举值
   */
  getNextValue() {
    if (this.data.enumList.length === 0) {
      return 0;
    }
    const maxValue = Math.max(...this.data.enumList.map(item => item.value));
    return maxValue + 1;
  },

  /**
   * 显示编辑弹窗
   */
  showEditDialog(index) {
    const item = this.data.enumList[index];
    this.setData({
      showDialog: true,
      dialogTitle: '编辑枚举值',
      isEdit: true,
      currentIndex: index,
      formData: {
        label: item.label,
        value: item.value
      }
    });
  },

  /**
   * 输入框变化
   */
  onLabelInput(e) {
    this.setData({
      'formData.label': e.detail.value
    });
  },

  onValueInput(e) {
    this.setData({
      'formData.value': e.detail.value
    });
  },

  /**
   * 弹窗确认
   */
  handleDialogConfirm() {
    const { label, value } = this.data.formData;

    // 验证
    if (!label || !label.trim()) {
      wx.showToast({
        title: '请输入显示文本',
        icon: 'none'
      });
      return;
    }

    if (value === '' || value === null) {
      wx.showToast({
        title: '请输入枚举值',
        icon: 'none'
      });
      return;
    }

    // 检查枚举值是否重复（新增时）
    if (!this.data.isEdit) {
      const exists = this.data.enumList.some(item => item.value === parseInt(value));
      if (exists) {
        wx.showToast({
          title: '枚举值已存在',
          icon: 'none'
        });
        return;
      }
    }

    if (this.data.isEdit) {
      // 编辑
      this.updateEnum();
    } else {
      // 新增
      this.addEnum();
    }
  },

  /**
   * 新增枚举值
   */
  addEnum() {
    const newItem = {
      type: this.data.type,
      value: parseInt(this.data.formData.value),
      label: this.data.formData.label.trim(),
      sort: this.data.enumList.length,
      isActive: true
    };

    const enumList = [...this.data.enumList, newItem];
    this.setData({
      enumList,
      showDialog: false
    });

    wx.showToast({
      title: '新增成功',
      icon: 'success'
    });

    // TODO: 调用云函数保存到数据库
  },

  /**
   * 更新枚举值
   */
  updateEnum() {
    const enumList = [...this.data.enumList];
    enumList[this.data.currentIndex].label = this.data.formData.label.trim();

    this.setData({
      enumList,
      showDialog: false
    });

    wx.showToast({
      title: '更新成功',
      icon: 'success'
    });

    // TODO: 调用云函数更新数据库
  },

  /**
   * 弹窗取消
   */
  handleDialogCancel() {
    this.setData({
      showDialog: false
    });
  },

  /**
   * 切换启用状态
   */
  toggleActive(e) {
    const { index } = e.currentTarget.dataset;
    const enumList = [...this.data.enumList];
    enumList[index].isActive = !enumList[index].isActive;

    this.setData({
      enumList
    });

    wx.showToast({
      title: enumList[index].isActive ? '已启用' : '已禁用',
      icon: 'success'
    });

    // TODO: 调用云函数更新数据库
  },

  /**
   * 显示操作菜单
   */
  showActions(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      showActionSheet: true,
      currentIndex: index
    });
  },

  /**
   * 操作菜单选择
   */
  onActionSelect(e) {
    const { name } = e.detail;
    const index = this.data.currentIndex;

    switch (name) {
      case '编辑':
        this.showEditDialog(index);
        break;
      case '上移':
        this.moveUp(index);
        break;
      case '下移':
        this.moveDown(index);
        break;
      case '删除':
        this.confirmDelete(index);
        break;
    }

    this.setData({
      showActionSheet: false
    });
  },

  /**
   * 关闭操作菜单
   */
  onActionClose() {
    this.setData({
      showActionSheet: false
    });
  },

  /**
   * 上移
   */
  moveUp(index) {
    if (index === 0) {
      wx.showToast({
        title: '已经是第一个了',
        icon: 'none'
      });
      return;
    }

    const enumList = [...this.data.enumList];
    [enumList[index], enumList[index - 1]] = [enumList[index - 1], enumList[index]];

    // 更新 sort 值
    enumList.forEach((item, i) => {
      item.sort = i;
    });

    this.setData({
      enumList
    });

    wx.showToast({
      title: '上移成功',
      icon: 'success'
    });

    // TODO: 调用云函数更新排序
  },

  /**
   * 下移
   */
  moveDown(index) {
    if (index === this.data.enumList.length - 1) {
      wx.showToast({
        title: '已经是最后一个了',
        icon: 'none'
      });
      return;
    }

    const enumList = [...this.data.enumList];
    [enumList[index], enumList[index + 1]] = [enumList[index + 1], enumList[index]];

    // 更新 sort 值
    enumList.forEach((item, i) => {
      item.sort = i;
    });

    this.setData({
      enumList
    });

    wx.showToast({
      title: '下移成功',
      icon: 'success'
    });

    // TODO: 调用云函数更新排序
  },

  /**
   * 确认删除
   */
  confirmDelete(index) {
    const item = this.data.enumList[index];

    Dialog.confirm({
      title: '确认删除',
      message: `确定要删除"${item.label}"吗？`,
    }).then(() => {
      this.deleteEnum(index);
    }).catch(() => {
      // 取消删除
    });
  },

  /**
   * 删除枚举值
   */
  deleteEnum(index) {
    const enumList = [...this.data.enumList];
    enumList.splice(index, 1);

    // 更新 sort 值
    enumList.forEach((item, i) => {
      item.sort = i;
    });

    this.setData({
      enumList
    });

    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });

    // TODO: 调用云函数删除数据库记录
  }
});

