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
  async loadEnumList() {
    try {
      wx.showLoading({ title: '加载中...', mask: true });

      // 调用云函数获取枚举值
      const result = await wx.cloud.callFunction({
        name: 'enum',
        data: {
          action: 'getEnums',
          type: this.data.type
        }
      });

      wx.hideLoading();

      if (!result.result.success) {
        throw new Error(result.result.errorMessage || '加载失败');
      }

      this.setData({
        enumList: result.result.data.enums
      });

    } catch (error) {
      console.error('加载枚举值失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 显示新增弹窗
   */
  showAddDialog() {
    console.log('[showAddDialog] 方法被调用');
    console.log('[showAddDialog] 当前 enumList:', this.data.enumList);

    const nextValue = this.getNextValue();
    console.log('[showAddDialog] 下一个枚举值:', nextValue);

    this.setData({
      showDialog: true,
      dialogTitle: '新增枚举值',
      isEdit: false,
      currentIndex: -1,
      formData: {
        label: '',
        value: nextValue
      }
    }, () => {
      console.log('[showAddDialog] setData 完成, showDialog:', this.data.showDialog);
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
  async addEnum() {
    try {
      wx.showLoading({ title: '保存中...', mask: true });

      // 调用云函数新增枚举值
      const result = await wx.cloud.callFunction({
        name: 'enum',
        data: {
          action: 'addEnum',
          type: this.data.type,
          value: parseInt(this.data.formData.value),
          label: this.data.formData.label.trim(),
          sort: this.data.enumList.length
        }
      });

      wx.hideLoading();

      if (!result.result.success) {
        throw new Error(result.result.errorMessage || '新增失败');
      }

      this.setData({
        showDialog: false
      });

      wx.showToast({
        title: '新增成功',
        icon: 'success'
      });

      // 重新加载列表
      this.loadEnumList();

    } catch (error) {
      console.error('新增枚举值失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '新增失败',
        icon: 'none'
      });
    }
  },

  /**
   * 更新枚举值
   */
  async updateEnum() {
    try {
      wx.showLoading({ title: '保存中...', mask: true });

      const item = this.data.enumList[this.data.currentIndex];

      // 调用云函数更新枚举值
      const result = await wx.cloud.callFunction({
        name: 'enum',
        data: {
          action: 'updateEnum',
          enumId: item._id,
          label: this.data.formData.label.trim()
        }
      });

      wx.hideLoading();

      if (!result.result.success) {
        throw new Error(result.result.errorMessage || '更新失败');
      }

      this.setData({
        showDialog: false
      });

      wx.showToast({
        title: '更新成功',
        icon: 'success'
      });

      // 重新加载列表
      this.loadEnumList();

    } catch (error) {
      console.error('更新枚举值失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '更新失败',
        icon: 'none'
      });
    }
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
  async toggleActive(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.enumList[index];
    const newStatus = !item.isActive;

    try {
      wx.showLoading({ title: '处理中...', mask: true });

      // 如果是禁用，调用删除接口（软删除）
      if (!newStatus) {
        const result = await wx.cloud.callFunction({
          name: 'enum',
          data: {
            action: 'deleteEnum',
            enumId: item._id
          }
        });

        if (!result.result.success) {
          throw new Error(result.result.errorMessage || '操作失败');
        }
      }

      wx.hideLoading();

      wx.showToast({
        title: newStatus ? '已启用' : '已禁用',
        icon: 'success'
      });

      // 重新加载列表
      this.loadEnumList();

    } catch (error) {
      console.error('切换状态失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      });
    }
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
  async moveUp(index) {
    if (index === 0) {
      wx.showToast({
        title: '已经是第一个了',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '处理中...', mask: true });

      const currentItem = this.data.enumList[index];
      const prevItem = this.data.enumList[index - 1];

      // 交换 sort 值
      await Promise.all([
        wx.cloud.callFunction({
          name: 'enum',
          data: {
            action: 'updateEnum',
            enumId: currentItem._id,
            sort: prevItem.sort
          }
        }),
        wx.cloud.callFunction({
          name: 'enum',
          data: {
            action: 'updateEnum',
            enumId: prevItem._id,
            sort: currentItem.sort
          }
        })
      ]);

      wx.hideLoading();

      wx.showToast({
        title: '上移成功',
        icon: 'success'
      });

      // 重新加载列表
      this.loadEnumList();

    } catch (error) {
      console.error('上移失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '上移失败',
        icon: 'none'
      });
    }
  },

  /**
   * 下移
   */
  async moveDown(index) {
    if (index === this.data.enumList.length - 1) {
      wx.showToast({
        title: '已经是最后一个了',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '处理中...', mask: true });

      const currentItem = this.data.enumList[index];
      const nextItem = this.data.enumList[index + 1];

      // 交换 sort 值
      await Promise.all([
        wx.cloud.callFunction({
          name: 'enum',
          data: {
            action: 'updateEnum',
            enumId: currentItem._id,
            sort: nextItem.sort
          }
        }),
        wx.cloud.callFunction({
          name: 'enum',
          data: {
            action: 'updateEnum',
            enumId: nextItem._id,
            sort: currentItem.sort
          }
        })
      ]);

      wx.hideLoading();

      wx.showToast({
        title: '下移成功',
        icon: 'success'
      });

      // 重新加载列表
      this.loadEnumList();

    } catch (error) {
      console.error('下移失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '下移失败',
        icon: 'none'
      });
    }
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
  async deleteEnum(index) {
    try {
      wx.showLoading({ title: '删除中...', mask: true });

      const item = this.data.enumList[index];

      // 调用云函数删除枚举值
      const result = await wx.cloud.callFunction({
        name: 'enum',
        data: {
          action: 'deleteEnum',
          enumId: item._id
        }
      });

      wx.hideLoading();

      if (!result.result.success) {
        throw new Error(result.result.errorMessage || '删除失败');
      }

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });

      // 重新加载列表
      this.loadEnumList();

    } catch (error) {
      console.error('删除枚举值失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      });
    }
  }
});

