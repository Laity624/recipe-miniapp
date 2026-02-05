// pages/recipe/edit/edit.js
Page({
  data: {
    recipeId: '',
    isEdit: false,
    formData: {
      name: '',
      description: '',
      images: [],
      category: 0,
      taste: 0,
      cookingMethod: 0,
      cookingTime: 0,
      difficulty: 0,
      servings: 0,
      ingredients: [],
      seasonings: [],
      steps: [],
      tips: '',
      notes: '',
      isPublic: 0
    },
    // 枚举数据
    categories: [{ label: '家常菜', value: 0 }, { label: '川菜', value: 1 }],
    tastes: [{ label: '清淡', value: 0 }, { label: '微辣', value: 1 }],
    cookingMethods: [{ label: '炒', value: 0 }, { label: '炖', value: 1 }],
    cookingTimes: [{ label: '10分钟内', value: 0 }, { label: '10-30分钟', value: 1 }],
    difficulties: [{ label: '简单', value: 0 }, { label: '中等', value: 1 }],
    servings: [{ label: '1人份', value: 0 }, { label: '2人份', value: 1 }]
  },

  onLoad(options) {
    const recipeId = options.id
    if (recipeId) {
      this.setData({ recipeId, isEdit: true })
      this.loadRecipe(recipeId)
    }
    this.loadEnums()
  },

  // 加载枚举数据
  loadEnums() {
    // TODO: 从云数据库或缓存加载枚举
  },

  // 加载菜谱数据（编辑模式）
  loadRecipe(recipeId) {
    wx.showLoading({ title: '加载中...' })
    // TODO: 调用云函数获取菜谱数据
    wx.hideLoading()
  },

  // 选择图片
  chooseImage() {
    const maxCount = 5 - this.data.formData.images.length
    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadImages(res.tempFilePaths)
      }
    })
  },

  // 上传图片
  uploadImages(tempFilePaths) {
    wx.showLoading({ title: '上传中...' })
    const uploadPromises = tempFilePaths.map(filePath => {
      return new Promise((resolve, reject) => {
        // TODO: 上传到云存储
        // 模拟上传
        setTimeout(() => {
          resolve(filePath)
        }, 500)
      })
    })

    Promise.all(uploadPromises).then(urls => {
      const images = [...this.data.formData.images, ...urls]
      this.setData({
        'formData.images': images
      })
      wx.hideLoading()
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.formData.images
    images.splice(index, 1)
    this.setData({
      'formData.images': images
    })
  },

  // Picker 变化事件
  onCategoryChange(e) {
    this.setData({ 'formData.category': parseInt(e.detail.value) })
  },
  onTasteChange(e) {
    this.setData({ 'formData.taste': parseInt(e.detail.value) })
  },
  onCookingMethodChange(e) {
    this.setData({ 'formData.cookingMethod': parseInt(e.detail.value) })
  },
  onCookingTimeChange(e) {
    this.setData({ 'formData.cookingTime': parseInt(e.detail.value) })
  },
  onDifficultyChange(e) {
    this.setData({ 'formData.difficulty': parseInt(e.detail.value) })
  },
  onServingsChange(e) {
    this.setData({ 'formData.servings': parseInt(e.detail.value) })
  },

  // 添加食材
  addIngredient() {
    const ingredients = this.data.formData.ingredients
    ingredients.push({ name: '', amount: '' })
    this.setData({ 'formData.ingredients': ingredients })
  },

  // 删除食材
  deleteIngredient(e) {
    const index = e.currentTarget.dataset.index
    const ingredients = this.data.formData.ingredients
    ingredients.splice(index, 1)
    this.setData({ 'formData.ingredients': ingredients })
  },

  // 食材输入
  onIngredientNameInput(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({
      [`formData.ingredients[${index}].name`]: value
    })
  },

  onIngredientAmountInput(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({
      [`formData.ingredients[${index}].amount`]: value
    })
  },

  // 添加调料
  addSeasoning() {
    const seasonings = this.data.formData.seasonings
    seasonings.push({ name: '', amount: '' })
    this.setData({ 'formData.seasonings': seasonings })
  },

  // 删除调料
  deleteSeasoning(e) {
    const index = e.currentTarget.dataset.index
    const seasonings = this.data.formData.seasonings
    seasonings.splice(index, 1)
    this.setData({ 'formData.seasonings': seasonings })
  },

  // 调料输入
  onSeasoningNameInput(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({
      [`formData.seasonings[${index}].name`]: value
    })
  },

  onSeasoningAmountInput(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({
      [`formData.seasonings[${index}].amount`]: value
    })
  },

  // 添加步骤
  addStep() {
    const steps = this.data.formData.steps
    const order = steps.length + 1
    steps.push({ order, content: '', image: '' })
    this.setData({ 'formData.steps': steps })
  },

  // 删除步骤
  deleteStep(e) {
    const index = e.currentTarget.dataset.index
    const steps = this.data.formData.steps
    steps.splice(index, 1)
    // 重新排序
    steps.forEach((step, i) => {
      step.order = i + 1
    })
    this.setData({ 'formData.steps': steps })
  },

  // 步骤内容输入
  onStepContentInput(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({
      [`formData.steps[${index}].content`]: value
    })
  },

  // 选择步骤图片
  chooseStepImage(e) {
    const index = e.currentTarget.dataset.index
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // TODO: 上传到云存储
        this.setData({
          [`formData.steps[${index}].image`]: res.tempFilePaths[0]
        })
      }
    })
  },

  // 删除步骤图片
  deleteStepImage(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      [`formData.steps[${index}].image`]: ''
    })
  },

  // 保存草稿
  saveDraft() {
    this.saveRecipe(0)
  },

  // 提交表单（发布）
  onSubmit(e) {
    this.saveRecipe(1)
  },

  // 保存菜谱
  saveRecipe(status) {
    const formData = this.data.formData

    // 验证必填项
    if (!formData.name) {
      wx.showToast({
        title: '请输入菜名',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '保存中...' })

    const data = {
      ...formData,
      status
    }

    // TODO: 调用云函数保存
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: status === 0 ? '草稿已保存' : '发布成功',
        icon: 'success',
        success: () => {
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      })
    }, 1000)
  }
})

