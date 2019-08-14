const app = getApp()
import util from '../../../utils/util'
import addr from '../../../utils/addr'
let clickStatus = false //重复点击判断，临时处理
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showJifen: false, //显示积分开关
    jifenBol: false, //积分开关
    totalPrice: 0, //需要支付的价格
  },

  /**
   * 生命周期函数--监听页面加载  开始状态判断流程错了，冗余了
   */
  onLoad: function (options) {
    const _this = this
    const pageData = options
    console.log(pageData)
    const params = {
      host: addr.HOST,
      addr: 'apiQuery/GetPostChargeList',
      data: {
        cityInfoId: app.globalData.cityInfoId,
        openId: app.globalData.userInfo.openId,
        postId: pageData.postId,
        isReNew: false
      }
    }
    util.httpClient(params).then(res => {
      const resData = res
      if (resData.code == 1) {
        let showJifen = _this.data.showJifen,
          time = resData.data.time,
          top = resData.data.top,
          single = resData.data.single
        if (resData.data.postDeductibleSwitch && resData.data.postTopDeductibleSwitch) {
          showJifen = true
        } else if (!resData.data.postDeductibleSwitch && !resData.data.postTopDeductibleSwitch) {
          showJifen = false
        } else if (!resData.data.postDeductibleSwitch && resData.data.postTopDeductibleSwitch) {
          showJifen = false
        } else if (!resData.data.postDeductibleSwitch && resData.data.postTopDeductibleSwitch) {
          showJifen = true
        }

        //给每个选项数据处理
        for (let i = 0; i < time.length; i++) {
          time[i].select = false
        }
        for (let i = 0; i < top.length; i++) {
          top[i].select = false
        }

        if (pageData.payType == 201 || pageData.payType == 210) {
          top[0].select = true
          if (single.State == 0) { //single.state == 0 && single.price == 0 =====>免费发帖
            time[0].select = true
          } else if (single.Price > 0) {
            single.select = true
          }
        } else if (pageData.payType == 200 || pageData.payType == 210) {
          if (single.State == 0) { //single.state == 0 && single.price == 0 =====>免费发帖
            time[0].select = true
          } else if (single.Price > 0) {
            single.select = true
          }
        }


        _this.setData({
          PostKey: pageData.PostKey || '',
          payType: pageData.payType,
          isReNew: pageData.isReNew ? pageData.isReNew : false,
          PostId: pageData.postId,
          serviceData: resData.data,
          top,
          single,
          time,
          showJifen
        })
        _this.totalPrice()
        _this.checkTimeTip()
      } else {
        app.ShowMsg(res.data.msg)
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

  // 置顶选择
  topTag(e) {
    const top = this.data.top,
      index = e.currentTarget.dataset.index
    for (let i = 0; i < top.length; i++) {
      top[i].select = false
    }
    top[index].select = true
    this.setData({
      top
    })
    this.totalPrice()
    this.checkTimeTip()
  },

  //时长选择
  timeTag(e) {
    const time = this.data.time,
      index = e.currentTarget.dataset.index
    for (let i = 0; i < time.length; i++) {
      time[i].select = false
    }
    time[index].select = true
    this.setData({
      time
    })
    this.totalPrice()
    this.checkTimeTip()
  },

  //单次发布选择
  singleTag(e) {
    const single = this.data.single
    this.setData({
      single
    })
    this.totalPrice()
    this.checkTimeTip()
  },

  // 计算价格 
  totalPrice() {
    let top = this.data.top,
      time = this.data.time,
      single = this.data.single,
      jifenBol = this.data.jifenBol,
      integral = this.data.serviceData.integral,
      totalPrice = 0,
      topId = null,
      timeId = null,
      singleId = null
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
    if (single.select) {
      totalPrice += single.Price
      singleId = single.Id
    }
    if (jifenBol) { //开启积分的计算
      totalPrice = Number(integral) % 100 > 0 ? (totalPrice - Number(integral) % 100) < 0 ? 0 : (totalPrice - Number(integral) % 100) : 0
    }
    this.setData({
      totalPrice,
      timeId,
      topId,
      singleId
    })
  },

  //检测时长天数和置顶天数提示
  checkTimeTip() {
    console.log('running')
    const payType = this.data.payType
    const top = this.data.top
    const time = this.data.time
    const single = this.data.single
    let topBol = payType != 200 ? true : false
    let timeBol = (payType != 201 && single.State == 0) ? true : false
    let topSelect = '',
      timeSelect = ''
    if (topBol && timeBol && single.State == 1) {
      for (let i = 0; i < top.length; i++) {
        if (top[i].select == true) {
          topSelect = top[i]
          break
        }
      }
      for (let i = 0; i < time.length; i++) {
        if (time[i].select == true) {
          timeSelect = time[i]
          break
        }
      }
      if (timeSelect.ExtendSpan / 24 < topSelect.ExtendSpan / 24) {
        wx.showModal({
          title: '温馨提示',
          content: '信息展示天数过期后，信息将不再显示</br>置顶权益也将会失效，请注意置顶天数',
          confirmText: "我知道了",
          confirmColor: '#FF5A00',
          showCancel: false,
        })
      }
    }

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
      const post = that.data.serviceData.post
      wx.showToast({
        title: '支付成功 !',
        icon: 'success',
        duration: 2000,
      })
      wx.redirectTo({
        url: "pages/postNav/postSuccess/postSuccess?topStatus=" + topStatus + "&post=" + JSON.stringify(post)
      })
    }
  },

  savePost() {
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
        const post = that.data.serviceData.post
        const params = {
          host: addr.HOST,
          addr: 'apiquery/AddPostOrder',
          method: "POST",
          contentType: 'application/json',
          data: {
            CityInfoId: app.globalData.cityInfoId,
            PostId: that.data.PostId, //帖子id
            PayType: payType, //支付类型
            PostKey: that.data.PostKey,
            IsIntegral: that.data.jifenBol, //积分状态
            isReNew: that.data.isReNew, //是否继续操作
            OpenId: app.globalData.userInfo.openId,
            AppId: app.globalData.appid,
            PostFee: (that.data.totalPrice * 100).toFixed(0)
          }
        }
        if (payType == 210) {
          params.data.TopChargeId = that.data.topId
          params.data.PostChargeId = that.data.single.State == 0 ? that.data.timeId : that.data.singleId
        } else if (payType == 201) {
          params.data.TopChargeId = that.data.topId
        } else {
          params.data.PostChargeId = that.data.single.State == 0 ? that.data.timeId : that.data.singleId
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
                url: "/pages/postNav/postSuccess/postSuccess?postId=" + that.data.PostId + "&payType=201" + "&isReNew=false" + "&post=" + JSON.stringify(post)
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
          // else {
          //   wx.redirectTo({
          //     url: '/pages/mypublish/mypublish'
          //   })
          // }
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