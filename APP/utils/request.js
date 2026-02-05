/**
 * 云函数调用封装
 */

const { showToast, showLoading, hideLoading } = require('./util.js')

/**
 * 调用云函数
 * @param {String} name 云函数名称
 * @param {Object} data 传递的参数
 * @param {Boolean} showLoad 是否显示加载提示
 * @returns {Promise} 云函数返回结果
 */
function callFunction(name, data = {}, showLoad = true) {
  if (showLoad) {
    showLoading()
  }

  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success(res) {
        if (showLoad) {
          hideLoading()
        }

        if (res.result && res.result.success) {
          resolve(res.result.data)
        } else {
          const errMsg = res.result?.errorMessage || '请求失败'
          showToast(errMsg, 'none')
          reject(new Error(errMsg))
        }
      },
      fail(err) {
        if (showLoad) {
          hideLoading()
        }
        console.error('云函数调用失败:', name, err)
        showToast('网络请求失败', 'none')
        reject(err)
      }
    })
  })
}

/**
 * 上传文件到云存储
 * @param {String} filePath 本地文件路径
 * @param {String} cloudPath 云存储路径
 * @returns {Promise<String>} 文件的云存储 URL
 */
function uploadFile(filePath, cloudPath) {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success(res) {
        resolve(res.fileID)
      },
      fail(err) {
        console.error('文件上传失败:', err)
        showToast('文件上传失败', 'none')
        reject(err)
      }
    })
  })
}

/**
 * 删除云存储文件
 * @param {Array<String>} fileList 文件 ID 数组
 * @returns {Promise}
 */
function deleteFile(fileList) {
  return new Promise((resolve, reject) => {
    wx.cloud.deleteFile({
      fileList,
      success(res) {
        resolve(res.fileList)
      },
      fail(err) {
        console.error('文件删除失败:', err)
        reject(err)
      }
    })
  })
}

module.exports = {
  callFunction,
  uploadFile,
  deleteFile
}

