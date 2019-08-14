const app = getApp()
import util from '../../../utils/util'
import addr from '../../../utils/addr'
let clickStatus = false //重复点击判断，临时处理
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTime: false, //是否显示过期时间
    showEndTime: '',
    showJifen: false, //显示积分开关
    jifenBol: false, //积分开关
    totalPrice: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    const pageData = options
    let post = JSON.parse(pageData.post),
      payType = '' //支付类型
    post.openid = app.globalData.userInfo.openId
    const params = {
      host: addr.HOST,
      addr: 'apiQuery/GetPostChargeList',
      method: "GET",
      contentType: 'application/json',
      data: {
        cityInfoId: app.globalData.cityInfoId,
        openId: app.globalData.userInfo.openId,
        postId: pageData.postid,
        isReNew: false
      }
    }
    util.httpClient(params).then(res => {
      const resData = res
      console.log(resData)
      if (resData.success) {
        wx.showModal({
          title: '温馨提示',
          content: '付费续期一次，信息永久展示',
          confirmText: "我知道了",
          confirmColor: '#FF5A00',
          showCancel: false,
        })
        let showJifen = _this.data.showJifen
        if (resData.data.postDeductibleSwitch && resData.data.postTopDeductibleSwitch) {
          showJifen = true
        } else if (!resData.data.postDeductibleSwitch && !resData.data.postTopDeductibleSwitch) {
          showJifen = false
        } else if (!resData.data.postDeductibleSwitch && resData.data.postTopDeductibleSwitch) {
          showJifen = false
        } else if (!resData.data.postDeductibleSwitch && resData.data.postTopDeductibleSwitch) {
          showJifen = true
        }
        console.log(resData.data.time, resData.data.top)
        for (let i = 0; i < resData.data.time.length; i++) {
          resData.data.time[i].select = false
        }
        for (let i = 0; i < resData.data.top.length; i++) {
          resData.data.top[i].select = false
        }
        if (resData.data.time.length > 0) {
          resData.data.time[0].select = true
          payType = 201
        }
        if (resData.data.top.length > 0) {
          resData.data.top[0].select = true
        }
        if (resData.data.post.EndTime) {
          _this.setData({
            showTime: true,
            postId: pageData.postid,
            showEndTime: resData.data.post.EndTime,
            rspData: resData.data,
            payType: pageData.payType,
            showJifen
          })
          _this.totalPrice()
        } else {
          _this.setData({
            showTime: false,
            postId: pageData.postid,
            showEndTime: resData.data.post.EndTime,
            rspData: resData.data,
            payType: pageData.payType,
            showJifen
          })
          _this.totalPrice()
        }

      } else {
        app.ShowMsg(resData.msg)
      }
    })

  },
  //积分开关
  jifenStatus() {
    const jifenBol = this.data.jifenBol
    this.setData({
      jifenBol: !jifenBol
    })
    this.totalPrice()
  },

  totalPrice() {
    const resData = this.data.rspData
    let top = resData.top,
      time = resData.time,
      jifenBol = this.data.jifenBol,
      integral = resData.integral,
      totalPrice = 0,
      topId = null,
      timeId = null
    for (let i = 0; i < top.length; i++) {
      if (top[i].select) {
        totalPrice += top[i].Price
        topId = top[i].Id
      }
    }
    for (let i = 0; i < time.length; i++) {
      if (time[i].select) {
        totalPrice += time[i].Price
        timeId = time[i].Id
      }
    }
    if (jifenBol) { //开启积分的计算 
      totalPrice = (totalPrice - Number(integral) % 100) <= 0 ? 0 : totalPrice - Number(integral) % 100
    }
    this.setData({
      totalPrice,
      timeId,
      topId
    })
  },
  //付款成功后回调
  refun: function (state) {
    console.log(state)
    var that = this
    if (state == 0) {
      var msg = '您已取消付款'
      app.ShowMsg(msg)
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })

      }, 500)
    } else if (state == 1) {
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 2000,
      })
      wx.redirectTo({
        url: "pages/postNav/postSuccess/postSuccess?topStatus=" + topStatus
      })
    }
  },
  save() {
    const that = this
    const totalPrice = this.data.totalPrice
    if (!clickStatus) {
      clickStatus = true
      if (app.globalData.isIos) { //苹果用户可以免费发帖，需要支付>0，苹果不能发帖
        wx.showModal({
          content: '非苹果手机用户能发帖',
          showCancel: false,
          title: '提示',
          success(res) {
            wx.navigateBack({
              delta: 1
            })
          }
        })
        return
      } else {
        const payType = that.data.payType
        const params = {
          host: addr.HOST,
          addr: 'apiquery/AddPostOrder',
          method: "POST",
          contentType: 'application/json',
          data: {
            CityInfoId: app.globalData.cityInfoId,
            PostId: that.data.postId, //帖子id
            PayType: payType, //支付类型
            PostKey: that.data.PostKey || '',
            IsIntegral: that.data.jifenBol, //积分状态
            IsReNew: that.data.isRenew || false, //是否继续操作
            OpenId: app.globalData.userInfo.openId,
            AppId: app.globalData.appid,
            PostFee: (that.data.totalPrice * 100).toFixed(0)
          }
        }
        if (payType == 210) {
          params.data.TopChargeId = that.data.topId
          params.data.PostChargeId = that.data.timeId
        } else if (payType == 201) {
          params.data.TopChargeId = that.data.topId
        }
        console.log('支付参数')
        console.log(params)
        util.httpClient(params).then(res => {
          console.log(res)
          const resData = res
          clickStatus = false
          if (resData.code == 408) {
            wx.redirectTo({
              url: '/pages/postNav/resetEdit/resetEdit?postId=' + that.data.postId
            })
            return
          } else if (resData.code == 1) {
            const orderId = resData.data.orderId
            const param = {
              openId: app.globalData.userInfo.openId
            }
            if (orderId == 0) {
              wx.redirectTo({
                url: "/pages/postNav/postSuccess/postSuccess?postId=" + that.data.PostId + "&payType=201" + "&isReNew=false"
              })
              return
            } else {
              util.PayOrder(orderId, param, {
                failed: function (res) {
                  console.log('支付失败')
                  console.log(res)
                  setTimeout(function () {
                    wx.hideToast()
                  }, 500)
                  wx.hideNavigationBarLoading()
                  that.refun(0)
                },
                success: function (res) {
                  console.log('支付成功')
                  console.log(res)
                  if (res == "wxpay") {
                    //发起支付
                    wx.hideNavigationBarLoading()
                    setTimeout(function () {
                      wx.hideToast()
                    }, 100)
                  } else if (res == "success") {
                    that.refun(1)
                  }
                }
              })
            }
          }
        })

      }

    } else {
      wx.showModal({
        title: '提示',
        content: '请不要重复提交'
      })
    }
  }
})