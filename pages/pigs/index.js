import {
  PIG_TAG_SRC,
  APPLET_QRCODE,
  USER_DRAWLOTS_KEY
} from '../../common/constants.js'

const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userTagIndex: -1,
    nickName: '',
    scaleRpxWid: 700, // rpx 自适应
    rpxScale: 1, // windowWidth / 750 每一个 rpx 代表的 px
    imgScale: 1,
    initImgWid: 882,
    initImgHei: 1064,
    netWorkFilePath: null,
    qrcodeFilePath: null,
    tempFilePath: null,
    context: null
  },

  onLoad() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    try {
      const userTagIndex = wx.getStorageSync(USER_DRAWLOTS_KEY),
        res = wx.getSystemInfoSync(),
        rpxScale = res.windowWidth / 750,
        imgScale = rpxScale * this.data.scaleRpxWid / this.data.initImgWid

      this.setData({
        rpxScale,
        imgScale,
        userTagIndex,
        nickName: app.globalData.userInfo.nickName
      })
    } catch(err) {
      console.error('错误: ', err)
    }
  },

  onReady() {
    // 获取背景图
    wx.getImageInfo({
      src: PIG_TAG_SRC[this.data.userTagIndex].src,
      success: res => {
        this.setData({
          netWorkFilePath: res.path
        })

        const context = this.initCanvas('J-pig-canvas', this.data.imgScale)

        context.draw()

        wx.hideLoading()
      }
    })

    // 获取 qrcode
    wx.getImageInfo({
      src: APPLET_QRCODE,
      success: res => {
        this.setData({
          qrcodeFilePath: res.path
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.nickName} 抽中了 ${PIG_TAG_SRC[this.data.userTagIndex].tag}, 快来看看你的吧`,
      path: 'pages/index/index'
    }
  },

  initCanvas(canvasId, scale = 1) {
    const context = wx.createCanvasContext(canvasId)

    context.drawImage(
      this.data.netWorkFilePath,
      0,
      0,
      882 * scale,
      1064 * scale
    )

    context.setFillStyle('#B18F7C')
    context.setFontSize(40 * scale)
    context.fillText(
      '@' + this.data.nickName,
      90 * scale,
      740 * scale
    )

    return context
  },

  // 生成图片
  generateImage() {
    // 如果已经生成过了就不用再次生成啦
    if (!!this.data.tempFilePath) {
      this.saveImage(this.data.tempFilePath)
      return
    }

    // 首次保存全新绘制
    const context = this.initCanvas('J-genarate-canvas')

    // 生成的时候把二维码加上
    context.drawImage(
      this.data.qrcodeFilePath,
      703,
      895,
      112,
      112
    )

    context.draw(true, () => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        fileType: 'jpg',
        canvasId: 'J-genarate-canvas',
        success: (res) => {
          this.setData({
            tempFilePath: res.tempFilePath
          })

          this.saveImage(res.tempFilePath)
        },
        fail(err) {
          console.log(err)
        }
      })
    })
  },

  // 保存图片
  saveImage(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath, //canvasToTempFilePath返回的tempFilePath
      success(res) {
        wx.showToast({
          title: '',
          icon: 'success'
        })
      },
      fail(err) {
        console.log('跪了', err)
      }
    })
  }
})