var addr = require("addr");
const app = getApp();

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//加载对话框的显示和隐藏
function showLoadingDialog() {
  wx.showToast({
    title: "加载中",
    mask: true,
    icon: 'loading',
    duration: 10000
  })
}
// 拨打电话
function g_callphone(phone) {
  try {
    wx.setStorageSync('needloadcustpage', false)
  } catch (e) {}
  wx.makePhoneCall({
    phoneNumber: phone
  })
}

function hideLoadingDialog() {
  wx.hideToast()
}

function showNavigationBarLoading() {
  wx.showNavigationBarLoading()
}

function hideNavigationBarLoading() {
  wx.hideNavigationBarLoading()
}

function showModal(title = "提示", content = "暂不支持", showCancel = false, confirmText = "确定") {
  return new Promise((resolve, reject) => {
    wx.showModal({
      "title": title,
      "content": content,
      "showCancel": showCancel,
      "confirmText": confirmText,
      "confirmColor": "#ff5d38",
      "success": function (res) {
        if (res.confirm) {
          resolve(res)
        } else {
          reject(res)
        }
      },
      "fail": function (res) {
        reject(res)
      }
    })
  })
}

/**
 * 预览图片
 * @param index  当前显示图片的链接 的index
 * @param urls
 */
function previewImage(urls, index = 0) {
  wx.previewImage({
    current: urls[index], // 当前显示图片的http链接
    urls: urls // 需要预览的图片http链接列表
  })
}

/*
 * 用于Toast的bean对象
 * see(showToast)
 */
function Remind() {
  this.showRemind = false
  this.message = '暂无内容'
}
// 自定义Toast
function showToast(that) {
  var bean = that.data.remindBean;
  if (!bean.showRemind) {
    bean.showRemind = true;
    that.setData(that.data);
    setTimeout(function () {
      that.data.remindBean.showRemind = false
      that.setData(that.data)
    }, 2500);
  }
}
//数字前补零
function PrefixInteger(num, n) {
  return (Array(n).join(0) + num).slice(-n);
}
//生成最近一周日期列表
function GetDaysForWeek() {
  var result = [];
  var now = new Date();
  Date.prototype.getMonthDay = function () {
    return PrefixInteger((this.getMonth() + 1), 2) + '-' + PrefixInteger(this.getDate(), 2);
  }
  var chnNumChar = ["一", "二", "三", "四", "五", "六", "日"];
  var child = {};
  child.Day = '今天';
  child.DayIndex = now.getDay() == 0 ? 7 : now.getDay();
  child.Date = now.toLocaleDateString();
  child.DateStr = now.getMonthDay();
  child.Index = 0;
  result.push(child);
  for (var i = 0; i < 6; i++) {
    var newChild = {};
    newChild.Day = "周" + chnNumChar[now.getDay()];
    now.setDate(now.getDate() + 1);
    newChild.Date = now.toLocaleDateString();
    newChild.DayIndex = now.getDay() == 0 ? 7 : now.getDay();
    newChild.DateStr = now.getMonthDay();
    newChild.Index = i + 1;
    result.push(newChild)
  }
  return result;
}
//根据时间范围生成半小时集合(格式 18:18)
function GetHalfOfHoursList(start, end) {
  var datestart = new Date(new Date().toLocaleDateString() + " " + start).getTime()
  var dateend = new Date(new Date().toLocaleDateString() + " " + end).getTime()
  var ms = 1000 * 60 * 30
  var TimeSpanList = []
  TimeSpanList.push(start)
  for (var i = 1; i <= 48; i++) {
    var momont = new Date(datestart + ms * i)
    TimeSpanList.push(momont.toTimeString().substring(0, 5))
    if (momont >= dateend) {
      break;
    }
  }
  return TimeSpanList;
}
//获取时间毫秒数 "/Date(xxxxxxxxxx)/"
function GetDateTime(timespanStr) {
  var timestring = timespanStr.match(/[1-9][0-9]*/g)[0]
  return parseInt(timestring)
}
//计算剩余时间 (天,时,分,秒)
function leftTimer(timespan) {
  var date = this.GetDateTime(timespan)
  var leftTime = date - (new Date()); //计算剩余的毫秒数 
  var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
  var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
  var minutes = parseInt(leftTime / 1000 / 60 % 60, 10); //计算剩余的分钟 
  var seconds = parseInt(leftTime / 1000 % 60, 10); //计算剩余的秒数 
  days = PrefixInteger(days, 2);
  hours = PrefixInteger(hours, 2);
  minutes = PrefixInteger(minutes, 2);
  seconds = PrefixInteger(seconds, 2);
  return days + "天" + hours + ":" + minutes + ":" + seconds + "";
}

//格式化时间
function dateFormat(fmt, date) {
  var o = {
    "M+": date.getMonth() + 1, //月份   
    "d+": date.getDate(), //日   
    "h+": date.getHours(), //小时   
    "m+": date.getMinutes(), //分   
    "s+": date.getSeconds(), //秒   
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
    "S": date.getMilliseconds() //毫秒   
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
//保留小数位
function GetDecimal(num, count) {
  var nums = num.split(".")
  var digit = nums.length > 1 ? nums[1].substr(0, count) : ""
  return nums.length > 1 ? nums[0] + "." + digit : num
}
//微信支付下单
function wxPayRequst(param, callback) {
  var url = addr.Address.AddPayOrder
  var cityid = 0
  if (!!param.usenew && param.usenew) {
    url = addr.Address.AddOrder

  }
  cityid = param.cityid
  var that = this
  wx.request({
    url: url,
    data: {
      cityid: cityid,
      itemid: param.itemid,
      paytype: param.paytype,
      extype: param.extype,
      extime: param.extime,
      openId: param.openId,
      quantity: param.quantity,
      areacode: param.areacode,
      remark: param.remark,
      chargeId: param.chargeId || 0,
      appid: getApp().globalData.appid
    },
    method: 'POST',
    header: {
      // 'content-type': 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    success: function (res) {
      if (res.data.result || res.data.Success) {
        var oradid = res.data.obj
        if (!!param.usenew && param.usenew) {
          oradid = res.data.Data.orderid
        }

        PayOrder(oradid, param, {
          failed: function () {
            callback.failed("failed")
          },
          success: function (res) {
            if (res == "wxpay") {
              callback.success("wxpay")
            } else if (res == "success") {
              callback.success("success")
            }
          }
        })
      } else {
        callback.failed("failed")
      }
    }
  })
}
//本地下单
function AddOrder(param, refun, reparam) {
  var that = this
  wx.showNavigationBarLoading()
  wx.showToast({
    title: '加载中...',
    icon: 'loading',
    duration: 10000
  })
  //生成订单
  wxPayRequst(param, {
    failed: function (res) {
      setTimeout(function () {
        wx.hideToast()
      }, 500)

      wx.hideNavigationBarLoading()
      refun(reparam, 0)
    },
    success: function (res) {

      if (res == "wxpay") {
        //发起支付
        wx.hideNavigationBarLoading()
        setTimeout(function () {
          wx.hideToast()
        }, 100)
      } else if (res == "success") {
        refun(reparam, 1)
      }
    }
  })
}
// PayOrder
function PayOrder(orderid, param, pay_callback) {
  var that = this
  wx.request({
    url: addr.Address.PayOrder,
    data: {
      openId: param.openId,
      orderid: orderid,
      'type': 1,
    },
    method: 'POST',
    header: {
      // 'content-type': 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    success: function (res) {

      if (res.data.result == true) {
        var obj = res.data.obj
        var jsObj = JSON.parse(obj)
        //发起支付
        pay_callback.success("wxpay")
        wxpay(jsObj, {
          failed: function () {
            pay_callback.failed("failed")
          },
          success: function () {
            pay_callback.success("success")
          }
        })
      } else {
        pay_callback.failed("failed")
      }
    }
  })
}
/* 支付 */
function wxpay(param, callback = "function") {
  var taht = this
  wx.requestPayment({
    appId: param.appId,
    timeStamp: param.timeStamp,
    nonceStr: param.nonceStr,
    package: param.package,
    signType: param.signType,
    paySign: param.paySign,
    success: function (res) {
      callback.success("success")
    },
    fail: function (res) {
      console.log(res.errMsg)
      callback.failed("failed")
    },
    complete: function (res) {

    }
  })
}

function ShowPath(path) {
  wx.showModal({
    title: '页面路径',
    content: path,
    cancelText: "取消",
    confirmText: "复制",
    success: function (e) {
      if (e.confirm) {
        wx.setClipboardData({
          data: path,
          success: function (res) {
            wx.getClipboardData({
              success: function (res) {
                wx.showToast({
                  title: '复制成功',
                })
              }
            })
          }
        })
      }
    }
  })
}
// 序列化字查询字符串
const stringifyQuery = (obj) => {
  const res = obj ? Object.keys(obj).map(key => {
    const val = obj[key];
    if (val == undefined) return '';
    return key + '=' + val;
  }).filter(x => x.length > 0).join('&') : null;
  return res ? `?${res}` : '';
}
let vzNavigateTo = (option) => {
  wx.navigateTo({
    url: `${option.url}${stringifyQuery(option.query)}`,
    fail(err) {
      console.log(err);
    }
  })
}
// httpClient
let httpClient = (options) => {
  return new Promise((resolve, reject) => {
    options.host = options.host || '';
    var needhideload = options.needhideload || 0;
    wx.request({
      method: options.method || 'GET',
      url: options.host + options.addr,
      data: options.data || '',
      header: {
        'content-type': options.contentType || 'application/x-www-form-urlencoded'
      },
      success(res) {
        resolve(res.data);
        res.statusCode !== 200 && console.log(res.data);
      },
      fail() {
        reject()
      },
      complete() {
        if (1 == needhideload) {
          wx.hideLoading();
        }
      }
    })
  })
}

// 合并对象
let assign = Object.assign ||
  function (target) {
    for (let i = 1; i < arguments.length; i++) {
      let source = arguments[i];
      for (let key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

// promise
const vzPromise = (fn, param = {}) => {
  return new Promise((resolve, reject) => {
    const obj = {
      success(res) {
        resolve(res)
      },
    }
    param.fail || (obj.fail = () => {})

    fn(
      assign({}, param, obj)
    )
  })
}

function BindFxOrigin(paramsObj) {
  wx.request({
    url: addr.Address.BindFxOrigin,
    data: paramsObj,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success(res) {

    }
  })
};
let verifyNum = (obj) => {
  let newobj
  newobj = obj.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
  newobj = newobj.replace(/^\./g, ""); //验证第一个字符是数字
  newobj = newobj.replace(/\.{2,}/g, "."); //只保留第一个, 清除多余的
  newobj = newobj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
  newobj = newobj.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
  return newobj;
}
//打电话
function paycallpeple(postid, phone) { //付费查看联系方式
  var payurl = '/pages/index/seephonepaysel?postid=' + postid

  wx.showLoading({
    title: '数据交换中',
  })
  wx.request({
    url: addr.Address.CanSeePostLink,
    data: {
      cityid: app.globalData.cityInfoId,
      openid: app.globalData.userInfo.openId,
      postId: postid
    },
    method: "GET",
    header: {
      'content-type': "application/json"
    },
    success: function (res) {
      res = res.data
      if (res.Success) {
        if (res.Data.free) {
          try {
            wx.setStorageSync('needloadcustpage', false)
          } catch (e) {}
          wx.makePhoneCall({
            phoneNumber: phone
          })

        } else {
          if (res.Data.see) {
            wx.showModal({
              title: '温馨提示',
              content: '[已购买]本次查看无须付费,剩余' + res.Data.remain + '次',
              confirmText: '拨打电话',
              cancelText: '我要续费',
              success: function (res) {
                if (res.confirm) {
                  g_callphone(phone)
                } else if (res.cancel) {
                  wx.navigateTo({
                    url: payurl,
                  })
                }
              }
            })
          } else {
            if (res.Data.remain > 0) {
              wx.showModal({
                title: '温馨提示',
                content: '查看该联系方式将扣除1次，剩余' + res.Data.remain + '次',
                confirmText: '扣除拨号',
                cancelText: '我要续费',
                success: function (res) {
                  if (res.confirm) {


                    wx.request({
                      url: addr.Address.SeePostOne,
                      data: {
                        cityid: app.globalData.cityInfoId,
                        openid: app.globalData.userInfo.openId,
                        postId: postid
                      },
                      header: {
                        'content-type': 'application/json'
                      },
                      success: function (res) {
                        if (res.data.Success) {
                          g_callphone(phone)
                        } else {
                          app.ShowMsg(res.data.msg)
                        }
                      }
                    })

                  } else if (res.cancel) {
                    wx.navigateTo({
                      url: payurl,
                    })
                  }
                }
              })
            } else {

              wx.showModal({
                title: '付费查看联系方式',
                content: '余额不足,请充值',
                confirmText: '确定',
                cancelText: '取消',
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: payurl,
                    })
                  } else if (res.cancel) {

                  }
                }
              })
            }
          }
        }


      } else {
        app.ShowMsg(res.data.msg)
      }
    },
    complete: function () {

      wx.hideLoading()
    }
  })


}

function timeDiff(dateEnd, dateBegin) {
  var dateDiff = dateEnd.getTime() - dateBegin.getTime(); //时间差的毫秒数
  var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)); //计算出相差天数
  return dayDiff;
}

module.exports = {
  BindFxOrigin: BindFxOrigin,
  formatTime: formatTime,
  //弹框
  hideLoadingDialog: hideLoadingDialog,
  showLoadingDialog: showLoadingDialog,
  showNavigationBarLoading: showNavigationBarLoading,
  hideNavigationBarLoading: hideNavigationBarLoading,
  showModal: showModal,
  showToast: showToast,
  Remind: Remind,
  GetDecimal: GetDecimal,
  GetDaysForWeek: GetDaysForWeek,
  GetHalfOfHoursList: GetHalfOfHoursList,
  GetDateTime: GetDateTime,
  leftTimer: leftTimer,
  dateFormat: dateFormat,
  paycallpeple: paycallpeple,
  ShowPath: ShowPath,
  wxPayRequst: wxPayRequst,
  AddOrder: AddOrder,
  PayOrder: PayOrder,
  vzNavigateTo,
  httpClient,
  vzPromise,
  g_callphone,
  verifyNum,
  timeDiff
}