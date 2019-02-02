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
    switch(true) {
      case !!app.globalData.userInfo:
        this.judgeHasTag()
        break
      case !!this.data.canIUse:
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = () => this.judgeHasTag()
        break
      default:
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo

            this.judgeHasTag()
          }
        })
    }
  },
  // 判断是否已存在用户数据，每个用户只允许抽一次
  judgeHasTag() {
    let userTagIndex = wx.getStorageSync(USER_DRAWLOTS_KEY)

    if (userTagIndex === undefined || userTagIndex === '') return
    
    wx.redirectTo({
      url: '/pages/pigs/index',
    })
  },
  // 获取用户信息
  getUserInfo(e) {
    const { detail } = e

    if (detail.errMsg !== 'getUserInfo:ok') return

    app.globalData.userInfo = detail.userInfo

    this.drawLots()
  },
  // 抽签
  drawLots() {
    this.setData({
      drawing: true
    })

    setTimeout(() => {
      let tagIndex = this.probabilityIndex()
      
      wx.setStorageSync(USER_DRAWLOTS_KEY, tagIndex)

      this.setData({
        drawing: false
      })

      wx.redirectTo({
        url: '/pages/pigs/index?isNew=1',
      })
    }, 2000)
  },

  // 随机概率 一共8只猪 5只普通，3只special，1只superSp 普通 & special & superSp 概率是 70 : 25 : 5
  probabilityIndex() {
    let normal = 5, 
      special = 3,
      superSp = 1

    // 乘以一个比较大的数 后取余 能保证概率准确，让就算不够准确也可以缩小误差
    let random = Math.floor(Math.random() * 10000 % 10), tagIndex = -1
    switch(true) {
      case (Math.floor(Math.random() * 10000 % 10) < 7):
        tagIndex = Math.floor(Math.random() * 10000 % normal)
        break
      case (Math.floor(Math.random() * 10000 % 6) < 5):
        tagIndex = normal + Math.floor(Math.random() * 10000 % special)
        break
      default: 
        tagIndex = normal + special
    }

    return tagIndex
  }
})
