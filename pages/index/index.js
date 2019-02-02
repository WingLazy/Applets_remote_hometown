import { PIG_TAG_SRC, USER_DRAWLOTS_KEY } from '../../common/constants.js'

//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    drawing: false, // 是否在抽签中
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad() {
    if (app.globalData.userInfo) {
      this.judgeHasTag()
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.judgeHasTag()
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo

          this.judgeHasTag()
        }
      })
    }
  },
  judgeHasTag() {
    let userTagIndex = wx.getStorageSync(USER_DRAWLOTS_KEY)

    userTagIndex !== undefined && wx.redirectTo({
      url: '/pages/pigs/index',
    })
  },
  getUserInfo(e) {
    const { detail } = e

    if (detail.errMsg !== 'getUserInfo:ok') return

    app.globalData.userInfo = detail.userInfo

    this.drawLots()
  },
  drawLots() {
    this.setData({
      drawing: true
    })

    setTimeout(() => {
      let tagIndex = Math.floor(Math.random() * (PIG_TAG_SRC.length - 1))
      
      wx.setStorageSync(USER_DRAWLOTS_KEY, tagIndex)

      this.setData({
        drawing: false
      })

      wx.redirectTo({
        url: '/pages/pigs/index?isNew=1',
      })
    }, 2000)
  }
})
