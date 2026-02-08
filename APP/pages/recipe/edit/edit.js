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
      links: [],
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
  async loadEnums() {
    try {
      // 缓存过期时间：24小时（单位：毫秒）
      const CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000

      // 先尝试从缓存读取
      const cachedData = wx.getStorageSync('enumsCache')
      if (cachedData && cachedData.enums && cachedData.timestamp) {
        const now = Date.now()
        const cacheAge = now - cachedData.timestamp

        // 缓存未过期，直接使用
        if (cacheAge < CACHE_EXPIRE_TIME) {
          this.setEnumsData(cachedData.enums)
          return
        }
      }

      // 缓存不存在或已过期，调用云函数获取
      const res = await wx.cloud.callFunction({
        name: 'enum',
        data: {
          action: 'getEnums'
        }
      })

      if (res.result.success) {
        const enums = res.result.data.enums

        // 缓存到本地，带时间戳
        wx.setStorageSync('enumsCache', {
          enums,
          timestamp: Date.now()
        })

        this.setEnumsData(enums)
      } else {
        wx.showToast({
          title: '加载枚举失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('加载枚举失败:', err)
      wx.showToast({
        title: '加载枚举失败',
        icon: 'none'
      })
    }
  },

  // 设置枚举数据
  setEnumsData(enums) {
    const categories = enums.filter(e => e.type === 'category' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    const tastes = enums.filter(e => e.type === 'taste' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    const cookingMethods = enums.filter(e => e.type === 'cookingMethod' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    const cookingTimes = enums.filter(e => e.type === 'cookingTime' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    const difficulties = enums.filter(e => e.type === 'difficulty' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    const servings = enums.filter(e => e.type === 'servings' && e.isActive)
      .sort((a, b) => a.sort - b.sort)
      .map(e => ({ label: e.label, value: e.value }))

    this.setData({
      categories,
      tastes,
      cookingMethods,
      cookingTimes,
      difficulties,
      servings
    })
  },

  // 加载菜谱数据（编辑模式）
  async loadRecipe(recipeId) {
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
        this.setData({
          formData: {
            name: recipe.name,
            description: recipe.description,
            images: recipe.images,
            category: recipe.category,
            taste: recipe.taste,
            cookingMethod: recipe.cookingMethod,
            cookingTime: recipe.cookingTime,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            ingredients: recipe.ingredients,
            seasonings: recipe.seasonings,
            steps: recipe.steps,
            tips: recipe.tips,
            notes: recipe.notes,
            isPublic: recipe.isPublic
          }
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
  async uploadImages(tempFilePaths) {
    wx.showLoading({ title: '上传中...' })

    try {
      const uploadPromises = tempFilePaths.map(filePath => {
        // 生成唯一文件名
        const timestamp = Date.now()
        const random = Math.floor(Math.random() * 10000)
        const ext = filePath.match(/\.\w+$/)[0]
        const cloudPath = `recipe-images/${timestamp}-${random}${ext}`

        return wx.cloud.uploadFile({
          cloudPath,
          filePath
        })
      })

      const results = await Promise.all(uploadPromises)
      const urls = results.map(res => res.fileID)

      const images = [...this.data.formData.images, ...urls]
      this.setData({
        'formData.images': images
      })

      wx.hideLoading()
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      })
    } catch (err) {
      wx.hideLoading()
      console.error('上传图片失败:', err)
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      })
    }
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

  // 基本信息输入
  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value })
  },

  onDescriptionInput(e) {
    this.setData({ 'formData.description': e.detail.value })
  },

  onTipsInput(e) {
    this.setData({ 'formData.tips': e.detail.value })
  },

  onNotesInput(e) {
    this.setData({ 'formData.notes': e.detail.value })
  },

  // 是否公开切换
  onPublicChange(e) {
    this.setData({ 'formData.isPublic': e.detail.value ? 1 : 0 })
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
    const ingredients = [...this.data.formData.ingredients, { name: '', amount: '' }]
    this.setData({ 'formData.ingredients': ingredients })
  },

  // 删除食材
  deleteIngredient(e) {
    const index = e.currentTarget.dataset.index
    const ingredients = [...this.data.formData.ingredients]
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
    const seasonings = [...this.data.formData.seasonings, { name: '', amount: '' }]
    this.setData({ 'formData.seasonings': seasonings })
  },

  // 删除调料
  deleteSeasoning(e) {
    const index = e.currentTarget.dataset.index
    const seasonings = [...this.data.formData.seasonings]
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
    const steps = [...this.data.formData.steps]
    const order = steps.length + 1
    steps.push({ order, content: '', image: '' })
    this.setData({ 'formData.steps': steps })
  },

  // 删除步骤
  deleteStep(e) {
    const index = e.currentTarget.dataset.index
    const steps = [...this.data.formData.steps]
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

  // 添加外部链接
  addLink() {
    const links = [...this.data.formData.links, '']
    this.setData({ 'formData.links': links })
  },

  // 删除外部链接
  deleteLink(e) {
    const index = e.currentTarget.dataset.index
    const links = [...this.data.formData.links]
    links.splice(index, 1)
    this.setData({ 'formData.links': links })
  },

  // 外部链接输入
  onLinkInput(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({
      [`formData.links[${index}]`]: value
    })
  },

  // 选择步骤图片
  async chooseStepImage(e) {
    const index = e.currentTarget.dataset.index
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        wx.showLoading({ title: '上传中...' })

        try {
          // 生成唯一文件名
          const timestamp = Date.now()
          const random = Math.floor(Math.random() * 10000)
          const ext = res.tempFilePaths[0].match(/\.\w+$/)[0]
          const cloudPath = `recipe-steps/${timestamp}-${random}${ext}`

          const uploadRes = await wx.cloud.uploadFile({
            cloudPath,
            filePath: res.tempFilePaths[0]
          })

          this.setData({
            [`formData.steps[${index}].image`]: uploadRes.fileID
          })

          wx.hideLoading()
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          })
        } catch (err) {
          wx.hideLoading()
          console.error('上传步骤图片失败:', err)
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          })
        }
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
  async saveRecipe(status) {
    const formData = this.data.formData

    // 验证必填项
    if (!formData.name) {
      wx.showToast({
        title: '请输入菜名',
        icon: 'none'
      })
      return
    }

    // 如果是发布状态，验证更多必填项
    if (status === 1) {
      if (!formData.description) {
        wx.showToast({
          title: '请输入菜谱描述',
          icon: 'none'
        })
        return
      }

      if (formData.images.length === 0) {
        wx.showToast({
          title: '请至少上传一张图片',
          icon: 'none'
        })
        return
      }

      if (formData.steps.length === 0) {
        wx.showToast({
          title: '请至少添加一个步骤',
          icon: 'none'
        })
        return
      }
    }

    wx.showLoading({ title: '保存中...' })

    try {
      const data = {
        ...formData,
        status
      }

      let res
      if (this.data.isEdit) {
        // 编辑模式：调用 updateRecipe
        res = await wx.cloud.callFunction({
          name: 'recipe',
          data: {
            action: 'updateRecipe',
            recipeId: this.data.recipeId,
            ...data
          }
        })
      } else {
        // 新建模式：调用 createRecipe
        res = await wx.cloud.callFunction({
          name: 'recipe',
          data: {
            action: 'createRecipe',
            ...data
          }
        })
      }

      wx.hideLoading()

      if (res.result.success) {
        wx.showToast({
          title: status === 0 ? '草稿已保存' : '发布成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: res.result.errorMessage || '保存失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('保存菜谱失败:', err)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }
})

