const uploadimg = require("../../utils/uploadImgenew.js");
const regeneratorRuntime = require('../../utils/runtime.js');
var addr = require("../../utils/addr.js");
const host = addr.HOST;
const { vzNavigateTo, httpClient, dateFormat, GetDateTime } = require("../../utils/util.js");
const app = getApp();
let getAddOrEditCoupon = (editParam) => httpClient({ host, addr: 'IBaseData/GetAddOrEditCoupon', data: editParam });
let addVoucher = (p) => httpClient({ host, addr: 'IBaseData/AddVoucher', data: p });

let saveAc = (acParams) => httpClient({ host, addr: 'IBaseData/AddStoreCoupon', data: acParams });
let date = new Date();
let year; let month; let day; let hour; let minute; let years = []; let months = []; let days = []; let hours = []; let minutes = [];
let limtNum = [];


for (let i = 1; i < 21; i++) {
    limtNum.push(i)
}

let num = (obj) => {
    let newobj
    newobj = obj.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
    newobj = newobj.replace(/^\./g, ""); //验证第一个字符是数字
    newobj = newobj.replace(/\.{2,}/g, "."); //只保留第一个, 清除多余的
    newobj = newobj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    newobj = newobj.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
    return newobj;
}

Page({
    data: {
        oldbuyprice:0,
        years,
        months,
        hours,
        minutes,
        days,
        year: date.getFullYear(),
        value: [],
        openid: '',
        limitNumArray: limtNum, // 限购数量
        isShowYuYueInput: false, // 打开填写需要预约的时间
        yuYueTime: '',  // 需要预约的时间
        initBuyStartTimeValue: [], // 再次打开选择器时的value
        endBuyTimeValue: [],  // 同上
        initUseStartTimeValue: [], // 同上
        endUseTimeValue: [], // 同上
        timeType: '', // 选择器分类
        useTimeSpan: '', // 使用时间段
        isShowDatePicker: false, // 日期选择器按钮
        discountName: '', // 优惠名称
        discountBuyingPrice: '', // 购买价格
        discountPayInStore: '', // 到店付价格
        discountInitPrice: '', // 原价
        discountDescription: '', // 商品描述
        discountCreateNum: 20, // 优惠生成数量
        discountLimitNum: '不限', // 限购
        discountTuikuan: '不可退款',// 退款
        discountDieJia: '不可叠加',  // 叠加
        discountDianHua: '需要',  // 否电话
        discountYuYue: '免预约', // 预约
        sid: '', // 店铺id
        csid: 0, // 发布id，添加是0，修改用传过来的id
        initBuyStartTime: '',
        endBuyTime: '',
        initUseStartTime: '',
        endUseTime: '',
        uploadimgobjects: {
            //商品描述
            "botGoodsDecri": {
                config: {
                    maxImageCount: 9,
                    images_full: false,
                    imageUpdateList: [], // 编辑时新增的
                    imageList: [],
                    imageIdList: [] // 用来删除图片
                }
            },
            "topGoodsDecri": {
                config: {
                    maxImageCount: 9,
                    images_full: false,
                    imageUpdateList: [], // 编辑时新增的
                    imageList: [],
                    imageIdList: [] // 用来删除图片
                }
            }
        },
        isVoucher: false,
        voucherPrice: '',
        voucherNum: '',
        voucherScopeIdx: 1,
        fullSubtraction: '',
        voucherBeginTime: '',
        initVoucherBeginValue: [], // 再次打开选择器时的value
        voucherEndTime: '',
        initVoucherEndValue: [],
        voucherValidDay: '',
        isAdd: 0,
        // 时间选择器组件
        isTimePicker: false,
        timerValueArrIdx: 0,
      distribution: '',
      isShowDistribution: false,
    },
    onReady: function () {
        this.timerPicker = this.selectComponent("#timerPicker");        
        console.log(this.timerPicker)
      },
    onLoad(options) {
        date = new Date();
        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
        hour = date.getHours();
        minute = date.getMinutes();
        let { sid, csid, isAdd } = options;
        this.setData({
            initBuyStartTime: year + '-' + month + '-' + day + ' ' + hour + ':' + (minute < 10 && '0' + minute || minute), // 购买开始日期时间
            endBuyTime: (month == 12 && year + 1 || year) + '-' + (month == 12 && 1 || month + 1) + '-' + day + ' ' + hour + ':' + (minute < 10 && '0' + minute || minute), // 购买结束日期时间
            initUseStartTime: year + '-' + month + '-' + day + ' ' + hour + ':' + (minute < 10 && '0' + minute || minute), // 开始使用日期时间
            endUseTime: (month == 12 && year + 1 || year) + '-' + (month == 12 && 1 || month + 1) + '-' + day + ' ' + hour + ':' + (minute < 10 && '0' + minute || minute), // 截至使用日期时间
            voucherBeginTime: '不填视为立即可用',
            voucherEndTime: '不填视为长期可用'
        })

        this.setData({
            sid: sid,
            isAdd: isAdd
        })

        app.getUserInfo(() => {
            if (isAdd == 1) {
                this.getAddOrEditCoupon({
                    cityid: app.globalData.cityInfoId,
                    openid: app.globalData.userInfo.openId,
                    csid,
                    storeid: sid,
                    t: 0,
                    r: 0
                });
                this.setData({
                    csid
                })
            } else {
                this.setData({
                    csid: 0,
                })
            }

            this.setData({
                openid: app.globalData.userInfo.openId
            });
        })
    },

    // 编辑回填数据
    async getAddOrEditCoupon(editParam) {
      var that=this
        let resp = (await getAddOrEditCoupon(editParam)).Data.mainmodel;
        let formaterDate = "yyyy-MM-dd hh:mm";
        if (resp.ImgList.length > 0) {
            let convertList = [];
            let imgids = [];
            resp.ImgList.forEach(function (v) {
                convertList.push(v.filepath)
                imgids.push(v.id);
            })
            this.setData({
                'uploadimgobjects.topGoodsDecri.config.imageList': convertList,
                'uploadimgobjects.topGoodsDecri.config.imageIdList': imgids
            })
        }
        if (resp.DescImgList.length > 0) {
            let convertList = [];
            let imgids = [];
            resp.DescImgList.forEach(function (v) {
                convertList.push(v.filepath)
                imgids.push(v.id);
            })
            this.setData({
                'uploadimgobjects.botGoodsDecri.config.imageList': convertList,
                'uploadimgobjects.botGoodsDecri.config.imageIdList': imgids
            })
        }
      if (resp.IsFx != 0) {
        that.setData({
          isShowDistribution: true,
          distribution: resp.FxRate
        })
      }
        this.setData({
            oldbuyprice: resp.BuyPrice && resp.BuyPrice ,
            discountName: resp.CouponName && resp.CouponName,
            discountBuyingPrice: resp.BuyPrice && resp.BuyPrice * 1000 / 100000,
            discountInitPrice: resp.CouponMoney && resp.CouponMoney * 1000 / 100000,
            discountPayInStore: (resp.NewPayCash != 'null' && resp.NewPayCash) ? resp.NewPayCash : '',
            initBuyStartTime: dateFormat(formaterDate, new Date(GetDateTime(resp.ValidDateStart))),
            endBuyTime: dateFormat(formaterDate, new Date(GetDateTime(resp.ValidDateEnd))),
            initUseStartTime: dateFormat(formaterDate, new Date(GetDateTime(resp.UseDateStart))),
            endUseTime: dateFormat(formaterDate, new Date(GetDateTime(resp.UseDateEnd))),
            useTimeSpan: (resp.UseTimeSpan != 'null' && resp.UseTimeSpan) ? resp.UseTimeSpan : '',
            discountDescription: resp.Description && resp.Description.replace(/<[^>]+>|&nbsp;*/g, ""),
            discountCreateNum: resp.CreateNum && resp.CreateNum,
            discountLimitNum: resp.LimitNum && resp.LimitNum,
            discountTuikuan: resp.RefundUse && '可退款' || '不可退款',
            discountDieJia: resp.RepeatUse && '可叠加' || '不可叠加',
            discountDianHua: resp.NeedPhone && '需要' || '不需要',
            discountYuYue: !resp.EarlyBookTime && '免预约' || '需要预约',
            yuYueTime: resp.EarlyBookTime && resp.EarlyBookTime,
        })
    },

    // 上传图片
    uploadLogoImg: function (e) {
        var itemid = e.currentTarget.dataset.itemid
        uploadimg.shopChooseImage(e, this);
    },
    clearImage: function (e) {
        uploadimg.shopclearImage(e, this);
    },
    // 获取优惠名
    getDiscountName(e) {
        let val = e.detail.value;
        if (val.length > 40) {
            app.ShowMsg('优惠名称最多40个字');
            this.setData({
                discountName: val.substring(0, 41)
            })
        } else {
            this.setData({
                discountName: val
            })
        }
    },
    // 购买价格
    getDiscountBuyingPrice(e) {
        let val = e.detail.value;

        this.setData({
            discountBuyingPrice: num(val)
        })
    },
    // 到店付价格
    getDiscountPayInStore(e) {

        this.setData({
            discountPayInStore: e.detail.value
        })
    },
    // 原价
    getDiscountInitPrice(e) {
        let val = e.detail.value;
        this.setData({
            discountInitPrice: num(val)
        })
    },
    //获取描述
    getDescription(e) {
        let val = e.detail.value;
        this.setData({
            discountDescription: val
        })
    },
    // 优惠生成数量
    getDiscountCreateNum(e) {
        this.setData({
            discountCreateNum: e.detail.value
        })
    },
    // 获取每用户限购数量
    getLimitNum(e) {
        this.setData({
            discountLimitNum: Number(e.detail.value) + 1
        })
    },
    // 是否退款
    getTuikuanradioChange(e) {
        if (this.data.discountBuyingPrice == 0) {
            this.setData({
                discountTuikuan: '不可退款'
            })
            app.ShowMsg("购买价格为0时，不允许退款！");
        } else {
            this.setData({
                discountTuikuan: e.detail.value
            })
        }
    },
    // 是否叠加
    getDieJiaradioChange(e) {
        this.setData({
            discountDieJia: e.detail.value
        })
    },
    // 是否填写电话
    getDianHuaradioChange(e) {
        this.setData({
            discountDianHua: e.detail.value
        })
    },
    // 是否预约
    getYuYueradioChange(e) {
        this.setData({
            discountYuYue: e.detail.value,
            // isShowYuYueInput: e.detail.value == '需要预约' && true || false
        })
    },
    // 获取需要预约的时间
    getYuYueTime(e) {
        if (/^0+/.test(e.detail.value)) {
            this.setData({
                yuYueTime: ''
            })
        } else {
            this.setData({
                yuYueTime: e.detail.value
            })
        }
    },
    // 显示什么是到店付
    showPayInStore() {
        app.ShowMsg('除了购买优惠券的钱之外，到店额外支付的金额');
    },
    // 获取使用时间段
    getUseTimeSpan(e) {
        this.setData({
            useTimeSpan: e.detail.value
        })
    },
    timerPickerConfirm(e) {
        switch(this.data.timerValueArrIdx) {
            case 0:
            this.setData({
                initBuyStartTime:e.detail[0].timerStr,       
            })
            break;
            case 1:
            this.setData({      
                endBuyTime:e.detail[1].timerStr,        
            })
            break;
            case 2:
            this.setData({      
                initUseStartTime:e.detail[2].timerStr,
            })
            break;
            case 3:
            this.setData({                 
                endUseTime:e.detail[3].timerStr,
            })
            break
            case 4:
            this.setData({                 
                voucherBeginTime:e.detail[4].timerStr,
            })
            break
            case 5:
            this.setData({                 
                voucherEndTime:e.detail[5].timerStr,
            })            
        }    
        this.setData({
            isTimePicker: false         
        })           
    },
    timerPickerCancel() {
        this.setData({
            isTimePicker: false         
        })  
    },
    // 相同时间控制
    commontDateFn(e) {
        this.setData({
            isTimePicker: true,
            timerValueArrIdx: parseInt(e.target.dataset.type)
        })     
    },

    // 发布优惠
    sendDiscount() {
      if (!/^[0-9]{1,6}(\.\d{0,2})?$/.test(this.data.discountInitPrice)) {
        app.ShowMsg("原价必须为数字，且最多为2位小数,最大为6位整数！");
        return;
      } else {
        var price_save = this.data.discountInitPrice * 1000000 / 10000;
        if (parseInt(price_save) < 1) {
          app.ShowMsg("原价不能低于1分钱！");
          return;
        }

      }
       let params = {}

        if (!(this.data.discountName.trim())) {
            app.ShowMsg('请填写优惠名称!');
            return;
        } else {
            params.CouponName = this.data.discountName;
        }
         

        if (!/^[0-9]{1,4}(\.\d{0,2})?$/.test(this.data.discountBuyingPrice)) {
            app.ShowMsg("购买价格必须为数字，且最多为2位小数,最大为4位整数！");
            return;
        }
     

        if (!/^[0-9]{1,6}(\.\d{0,2})?$/.test(this.data.discountInitPrice)) {
            app.ShowMsg("原价必须为数字，且最多为2位小数,最大为6位整数！");
            return;
        } else {
            var price_save = this.data.discountInitPrice * 1000000 / 10000;
            if (parseInt(price_save) < 1) {
                app.ShowMsg("原价不能低于1分钱！");
                return;
            }
           
        }
   
        if (parseInt(this.data.discountInitPrice * 100) <= parseInt(this.data.discountBuyingPrice * 100)) {
            app.ShowMsg("原价必须大于购买价格！");
            return;
        } else {
            params.CouponMoney = Number(this.data.discountInitPrice) * 1000000 / 10000;
            params.BuyPrice = Number(this.data.discountBuyingPrice) * 1000000 / 10000;
            if (this.data.oldbuyprice > 0 && this.data.oldbuyprice > params.BuyPrice) {

              app.ShowMsg("购买价格只能涨价，不能降价");
              return;
            }
        }

        if (new Date(this.data.endBuyTime) < new Date(this.data.initBuyStartTime)) {
            app.ShowMsg('购买结束时间要大于购买开始时间！');
            return false;
        }

        if (new Date(this.data.endUseTime) < new Date(this.data.initUseStartTime)) {
            app.ShowMsg('截止使用时间要大于开始使用时间！');
            return false;
        }

        if (new Date(this.data.initUseStartTime) < new Date(this.data.initBuyStartTime)) {
            app.ShowMsg('开始使用时间要大于购买开始时间！');
            return false;
        }

        if (new Date(this.data.endBuyTime) > new Date(this.data.endUseTime)) {
            app.ShowMsg('截止使用时间要大于购买结束时间！');
            return false;
        }

        if (!Number(this.data.discountCreateNum)) {
            app.ShowMsg('优惠数量必须大于0！');
            return;
        }

        if (this.data.discountYuYue == '需要预约' && !this.data.yuYueTime) {
            app.ShowMsg('请输入提前预约时间!');
            return;
        }

        // 验证代金券

        if (this.data.isAdd == 0 && this.data.isVoucher) {
            if (!this.data.voucherPrice) {
                app.ShowMsg('发放代金券的金额不能为0！');
                return;
            }

            if (!this.data.voucherNum) {
                app.ShowMsg('发放代金券的数量不能为0！');
                return
            }

            if (this.data.voucherScopeIdx == 2 && !this.data.fullSubtraction) {
                app.ShowMsg('发放代金券满减金额不能为0！');
                return
            }

            // if (!this.data.voucherValidDay) {
            //     app.ShowMsg('有效天数不能为0！');
            //     return
            // }

            if (this.data.voucherBeginTime != '不填视为立即可用') {
                if (this.data.voucherEndTime == '不填视为长期可用') {
                    app.ShowMsg('请填写代金券结束时间！');
                    return
                }
            }

            if (this.data.voucherEndTime != '不填视为长期可用') {
                if (this.data.voucherBeginTime == '不填视为立即可用') {
                    app.ShowMsg('请填写代金券开始时间！');
                    return
                }
            }

            if (new Date(this.data.voucherBeginTime).getTime() > new Date(this.data.voucherEndTime).getTime()) {
                app.ShowMsg('代金券结束时间必须大于开始时间！')
                return
            }

            if ((new Date(this.data.voucherEndTime).getTime() - new Date(this.data.voucherBeginTime).getTime()) / (24 * 60 * 60 * 1000) < this.data.voucherValidDay) {
                app.ShowMsg('代金券有效天数不能大于代金券使用周期');
                return
            }
        }
      // 验证人人分销
      if (this.data.isShowDistribution) {

        if (!this.data.distribution || this.data.distribution == 0) {
          app.ShowMsg('分销比例不能为空且不能为0');
          return
        }
      }
      params.IsFx = this.data.isShowDistribution ? 1 : 0
      params.FxRate = this.data.isShowDistribution ? this.data.distribution : ''
        let topImgList = this.data.uploadimgobjects.topGoodsDecri.config;
        let botImgList = this.data.uploadimgobjects.botGoodsDecri.config;

        let _topImgList = this.data.csid == 0 ? topImgList.imageList : topImgList.imageUpdateList;
        let _botImgList = this.data.csid == 0 ? botImgList.imageList : botImgList.imageUpdateList;
        params.openid = this.data.openid;
        params.re = 0;
        params.type = 1,
        params.Id = this.data.csid,
        params.ValidDateStart = this.data.initBuyStartTime;
        params.ValidDateEnd = this.data.endBuyTime;
        params.UseDateStart = this.data.initUseStartTime;
        params.UseDateEnd = this.data.endUseTime;
        params.NewPayCash = this.data.discountPayInStore;
        params.UseTimeSpan = this.data.useTimeSpan;
        params.Description = this.data.discountDescription;
        params.CreateNum = this.data.discountCreateNum;
        params.LimitNum = this.data.discountLimitNum === '不限' ? 0 : this.data.discountLimitNum;
        params.StoreId = this.data.sid,
        params.RepeatUseInt = this.data.discountDieJia === '不可叠加' ? 0 : 1;
        params.RefundUseInt = this.data.discountTuikuan === '不可退款' ? 0 : 1;
        params.NeedPhone = this.data.discountDianHua === '需要' ? true : false;
        params.EarlyBookTime = this.data.yuYueTime && this.data.yuYueTime || '';
        params.ImgList = _topImgList.join('|');
        params.DescImgList = _botImgList.join('|');
        params.needhideload = 1;

        this.saveAc(params);
    },
    async saveAc(acParams) {
        var that = this
        wx.showLoading({
            title: '提交中',
        })
        let resp = await saveAc(acParams);
        if (!resp.Success) {
            app.ShowMsg(resp.Message)
            return;
        }
        else {

            if (this.data.isVoucher) {
                let _resp = await addVoucher({
                    cityid: app.globalData.cityInfoId,
                    openid: app.globalData.userInfo.openId,
                    CreateNum: this.data.voucherNum,
                    VoucherMoney: this.data.voucherPrice,
                    Deducting:this.data.voucherScopeIdx==2? this.data.fullSubtraction:'',
                    UseStartDate: this.data.voucherBeginTime == '不填视为立即可用' ? '' : this.data.voucherBeginTime,
                    UseEndDate: this.data.voucherEndTime == '不填视为长期可用' ? '' : this.data.voucherEndTime,
                    ValidDays: this.data.voucherValidDay,
                    State: 0,
                    ItemId: resp.Data.couponid,
                    StoreId: this.data.sid,
                    ItemType: 1
                })
                if (!_resp.Success) {
                    app.ShowMsg(_resp.msg)
                    return
                }
            }
            wx.showToast({
                title: resp.Message,
                icon: 'success',
                success() {   
                    setTimeout(() => {
                        wx.navigateTo({
                          url: '/pages/releaseDiscount/storeDiscount?storeid=' + that.data.sid,
                        })
                    }, 1000)
                }
            })
        }
    },
    voucherToggle(e) {
        this.setData({
            isVoucher: e.detail.value
        })
    },
    getVoucherPrice(e) {
      var tempVal = e.detail.value.replace(/[.]/g, "")
      if (this.data.voucherPrice == '')
        tempVal = tempVal.replace(/[0]/g, "")
      this.setData({
        voucherPrice: tempVal
      })

    },
    getVoucherNum(e) {
        this.setData({
            voucherNum: e.detail.value
        })
        console.log(this.data.voucherNum)
    },
    changeVoucherScope(e) {
        let idx = e.currentTarget.dataset.idx

        this.setData({
            voucherScopeIdx: idx
        })
    },
    getFullSubtraction(e) {
        this.setData({
            fullSubtraction: e.detail.value
        })
        console.log(this.data.fullSubtraction)
    },
    getValidDay(e) {
        this.setData({
            voucherValidDay: e.detail.value
        })
        console.log(this.data.voucherValidDay)
  },
  distributionToggle(e) {
    this.setData({
      isShowDistribution: e.detail.value
    })
  },
  getDistribution(e) {
    console.log(e)
    this.setData({
      distribution: e.detail.value
    })
  }

})

