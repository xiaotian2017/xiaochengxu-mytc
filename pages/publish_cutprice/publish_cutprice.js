var util = require("../../utils/util.js");
var addr = require("../../utils/addr.js");
var uploadimg = require("../../utils/uploadImgenew.js");
var app = getApp();
const host = addr.HOST;
const regeneratorRuntime = require('../../utils/runtime.js');
let addVoucher = (p) => util.httpClient({ host, addr: 'IBaseData/AddVoucher', data: p });
Page({
    data: {
        cutId: 0,
        locationGet: false,
        XcxGetEndDate: "",
        XcxGetEndTime: "",
        XcxGetStartDate: "",
        XcxGetStartTime: "",
        XcxEndDate: "",
        XcxEndTime: "",
        XcxStartDate: "",
        XcxStartTime: "",
        storeId: 0,
        cut: {
            Id: 0,
            BName: "", //商铺名
            ImgUrl: "", //banner
            OriginalPrice: 0, //原价
            FloorPrice: 0,//底价
            ReduceMax: 0, //每次最多
            CutMaxCount: 0, //每次最多帮砍人数,
            ReduceMin: 0, //每次最少
            StartDate: "",//开始时间
            EndDate: "", //结束时间
            CreateNum: 0, //商品份数
            IntervalHour: 0, //自己砍价频率
            Description: "", //描述
            StoreId: 0,//商铺Id
            ValidStartDate: "", //领取开始
            ValidDate: "", //领取结束
            ValidAddress: "", //位置详情
            ValidPhone: "", //验证手机号码
            ImgList: [], //图片列表页
            DescImgList: [],  //详情图修改用
            re: ''
        },
        uploadimgobjects: {
            "activeCover": {// 活动封面
                config: {
                    maxImageCount: 1,
                    images_full: false,
                    imageUpdateList: [], //编辑时新增的
                    imageList: [],
                    imageIdList: [] //用来删除图片
                }
            },
            //商品描述
            "goodsDecri": {
                config: {
                    maxImageCount: 9,
                    images_full: false,
                    imageUpdateList: [], //编辑时新增的
                    imageList: [],
                    imageIdList: [] //用来删除图片
                }
            }
        },
        isVoucher: false,
        voucherPrice: '',
        voucherNum: '',
        voucherScopeIdx: 1,
        fullSubtraction: '',
        voucherBeginDate: '不填视为立即可用',
        voucherBeginTime: '',
        voucherEndDate: '不填视为长期可用',
        voucherEndTime: '',
        voucherValidDay: '',
        // 时间选择器组件
        isTimePicker: false,
      timerValueArrIdx: 0, 
       distribution: '',
       isShowDistribution: false,

    },
    onLoad: function (options) {
        var that = this
        var storeId = options.storeid
        var cutId = options.cutid
        if (undefined == storeId && null == storeId) {
            app.ShowMsg("参数错误!")
        }
        that.setData({ storeId: storeId })
        if (undefined != cutId && null != cutId) {
            that.setData({ cutId: cutId })
        }
        //调用应用实例的方法获取全局数据
        app.getUserInfo(function () {
            that.init(storeId);
        })

        wx.setNavigationBarTitle({
            title: '发布减价'
        })
    },
    init: function () {
        var that = this;

        if(!this.data.cutId) return
        that.loadcut()
    },
    loadcut: function () {
        var that = this
        wx.showLoading({
            title: '加载中',
        })
        wx.request({
            url: addr.Address.GetAddOrEditCut,
            data: {
                cityid: app.globalData.cityInfoId,
                openid: app.globalData.userInfo.openId,
                appid: app.globalData.appid,
                storeid: that.data.storeId,
                bid: that.data.cutId
            },
            success: function (res) {
                console.log(res)
                if (res.data.Success) {
                    var returnCut = res.data.Data.cutmain
                    returnCut.OriginalPrice = returnCut.OriginalPrice * 1000 / 100000
                    returnCut.FloorPrice = returnCut.FloorPrice * 1000 / 100000
                    returnCut.ReduceMin = returnCut.ReduceMin * 1000 / 100000
                    returnCut.ReduceMax = returnCut.ReduceMax * 1000 / 100000

                    var formaterDate = "yyyy-MM-dd hh:mm";
                    var formaterTime = "hh:mm";
                    that.setData({
                        XcxGetStartDate: util.dateFormat(formaterDate, new Date(util.GetDateTime(returnCut.ValidStartDate))),
                        XcxGetEndDate: util.dateFormat(formaterDate, new Date(util.GetDateTime(returnCut.ValidDate))),
                        XcxStartDate: util.dateFormat(formaterDate, new Date(util.GetDateTime(returnCut.StartDate))), 
                        XcxEndDate: util.dateFormat(formaterDate, new Date(util.GetDateTime(returnCut.EndDate))), 
                        XcxGetStartTime: util.dateFormat(formaterTime, new Date(util.GetDateTime(returnCut.ValidStartDate))),
                        XcxGetEndTime: util.dateFormat(formaterTime, new Date(util.GetDateTime(returnCut.ValidDate))), 
                        XcxGetEndTime: util.dateFormat(formaterTime, new Date(util.GetDateTime(returnCut.ValidDate))), 
                        XcxStartTime: util.dateFormat(formaterTime, new Date(util.GetDateTime(returnCut.StartDate))),
                        XcxEndTime: util.dateFormat(formaterTime, new Date(util.GetDateTime(returnCut.EndDate)))
                    })
                    //图片
                    if (returnCut.Id > 0) {
                        that.setData({ cut: returnCut })
                        if (returnCut.ImgUrl != '') {
                            that.setData({
                                'uploadimgobjects.activeCover.config.imageList': [returnCut.ImgUrl]
                            })
                        }
                      if (returnCut.IsFx != 0) {
                        that.setData({
                          isShowDistribution: true,
                          distribution: returnCut.FxRate
                        })
                      }
                      if (returnCut.DescImgList.length > 0) {
                            var convertList = []
                            var imgids = []
                        returnCut.DescImgList.forEach(function (v) {
                                convertList.push(v.filepath)
                                imgids.push(v.id)
                            })
                            that.setData({
                                'uploadimgobjects.goodsDecri.config.imageList': convertList,
                                'uploadimgobjects.goodsDecri.config.imageIdList': imgids
                            })
                        }
                        that.setData({
                            'uploadimgobjects.activeCover.config.imageList': [returnCut.ImgUrl],

                        })
                    }
                    that.setData({
                        'cut.Description': returnCut.Description && returnCut.Description.replace(/<[^>]+>|&nbsp;*/g, "")
                    })
                }
                else {
                    app.ShowMsg()
                }
                wx.hideLoading(res.data.Message)
            }
        })
    },
    //上传图片
    uploadLogoImg: function (e) {
        var itemid = e.currentTarget.dataset.itemid//砍价用

        wx.showLoading({
            title: '开始上传'
        })
        uploadimg.shopChooseImage(e, this);
    },
    //清除图片
    clearImage: function (e) {
        var that = this;
        //轮播图清除
        if (e.currentTarget.dataset.which == 'goodsDecri') {
            uploadimg.shopclearImage(e, this);
        }
        else {
            var configs = that.data.uploadimgobjects
            var index = e.currentTarget.dataset.which
            var currentItem = configs[index]
            currentItem.config.imageList.splice(index, 1);
            currentItem.config.images_full = false;
            that.setData({
                "uploadimgobjects": configs
            })
        }
    },
    //获取地理位置
    getLocation() {
        var that = this;
        try {
            wx.setStorageSync('needloadcustpage', false)
        }
        catch (e) {
        }
        wx.chooseLocation({
            success: function (res) {
                that.setData({
                    'cut.ValidAddress': res.address,
                    locationGet: true
                })
            },
            fail: function (e) {

            }
        })
    },

    //获取活动名称
    getActivityName(e) {
        var val = e.detail.value;
        this.setData({
            'cut.BName': val
        })
    },

    //获取商品份数
    getGoodsTotal(e) {
        var val = e.detail.value
        this.setData({
            'cut.CreateNum': val
        })
    },
    //获取原价
    getOriginPrice(e) {
        var val = e.detail.value
        val = this.filterNum(val)
        if (val === '') {
            return false
        } else {
            this.setData({
                'cut.OriginalPrice': val
            })
        }
    },
    //获取底价
    getLastPrice(e) {
        var val = e.detail.value
        val = this.filterNum(val)
        if (val === '') {
            return false
        } else {
            this.setData({
                'cut.FloorPrice': val
            })
        }
    },
    //获取每次最少减价
    getEachMin(e) {
        var val = e.detail.value
        this.setData({
            'cut.ReduceMin': val
        })

    },
    //获取每次最多减价
    getEachMax(e) {
        var val = e.detail.value
        this.setData({
            'cut.ReduceMax': val
        })
    },
    // 获取帮减人数
    getEachCount(e) {
        var val = e.detail.value
        this.setData({
            'cut.CutMaxCount': val
        })
    },
    //获取自己减价
    getSelfFrequency(e) {

        var val = e.detail.value
        this.setData({
            'cut.IntervalHour': val
        })
    },
    //获取描述
    getDescription(e) {
        var val = e.detail.value
        this.setData({
            'cut.Description': val
        })
    },
    //活动开始时间
    getStartTime(e) {
        var timeStamp, val, chooseTime;
        timeStamp = this.data.timeStamp;
        val = e.detail.value;
        chooseTime = new Date(val.replace(/-/g, "/")).getTime();
        if (timeStamp > chooseTime) {
            app.ShowMsg('活动开始的时间不能小于当前时间')
            return
        } else {
            this.setData({
                XcxStartDate: val
            })
        }
    },
    //活动开始具体时间
    getStartDtlTime(e) {
        var val, date, startTime;
        val = e.detail.value;
        date = new Date().getTime();
        startTime = this.data.startTime;
        if (startTime) {
            startTime = new Date(startTime + ' ' + val).getTime();
            if (startTime < date) {
                app.ShowMsg('领取时间不能小于当前时间')
                return
            }
        }
        this.setData({
            XcxStartTime: val
        })
    },
    //活动结束时间
    getEndTime(e) {
        var timeStamp, val, chooseTime, startTime;
        timeStamp = this.data.timeStamp;
        val = e.detail.value;
        chooseTime = new Date(val.replace(/-/g, "/")).getTime();
        startTime = parseInt(this.data.startTime);
        if (startTime) {
            startTime = new Date(startTime).getTime();
        }
        if (chooseTime < timeStamp) {
            app.ShowMsg('活动结束时间不能小于当前时间');
            return
        } else if (chooseTime < startTime) {
            app.ShowMsg('活动结束时间不能小于开始时间')
            return
        } else {
            this.setData({
                XcxEndDate: val
            })
        }
    },
    //活动结束具体时间
    getEndDtlTime(e) {
        var date, val, startTime, endTime;
        val = e.detail.value;
        date = new Date().getTime();
        endTime = this.data.endTime;
        if (endTime) {
            endTime = new Date(endTime + ' ' + val).getTime();
            if (endTime < date) {
                app.ShowMsg('活动结束时间不能小于当前时间')
                return
            }
        }
        startTime = this.data.startTime + ' ' + this.data.startDtlTime;
        if (startTime) {
            startTime = new Date(startTime).getTime();
            if (endTime < startTime) {
                app.ShowMsg('活动结束时间不能小于活动开始时间')
                return
            }
        }
        this.setData({
            XcxEndTime: val
        })
    },
    //获取领取的时间
    getExStartTime(e) {
        var timeStamp, val, chooseTime;
        timeStamp = this.data.timeStamp;
        val = e.detail.value;
        chooseTime = new Date(val.replace(/-/g, "/")).getTime();
        if (timeStamp < timeStamp) {
            app.ShowMsg('活动开始的时间不能小于当前时间')
            return
        } else {
            this.setData({
                XcxGetStartDate: val
            })
        }
    },
    //获取领取的详细的时间
    getExStartDtlTime(e) {
        var date, val, exStartTime, chooseTime;
        date = new Date();
        val = e.detail.value;
        exStartTime = this.data.exStartTime;
        if (exStartTime) {
            chooseTime = new Date(exStartTime + ' ' + val).getTime();
            if (chooseTime < date.getTime()) {
                app.ShowMsg('领取时间不能小于当前时间')
                return
            }
        }
        this.setData({
            XcxGetStartTime: val
        })
    },
    //获取领取的结束时间
    getExEndTime(e) {
        var timeStamp, val, chooseTime;
        timeStamp = this.data.timeStamp;
        val = e.detail.value;
        chooseTime = new Date(val.replace(/-/g, "/")).getTime();
        if (timeStamp < timeStamp) {
            app.ShowMsg('领取的时间不能小于当前时间')
            return
        } else {
            this.setData({
                XcxGetEndDate: val
            })
        }
    },
    //获取领取的详细结束时间
    getExEndDtlTime(e) {
        var date, val, exStartTime, exEndTime, chooseTime;
        date = new Date();
        val = e.detail.value;
        exStartTime = this.data.exStartTime + this.data.exStartDtlTime;
        exEndTime = this.data.exEndTime;
        if (exEndTime) {
            exEndTime = new Date(exEndTime + ' ' + val).getTime();
            if (exEndTime < date.getTime()) {
                app.ShowMsg('领取时间不能小于当前时间')
                return
            }
        }
        if (exStartTime && exEndTime) {
            exStartTime = new Date(exStartTime).getTime();
            if (chooseTime < date.getTime()) {
                app.ShowMsg('领取结束时间不能小于领取开始时间')
                return
            }
        }
        this.setData({
            XcxGetEndTime: val
        })
    },
    //获取电话号码
    getPhone(e) {
        var val = e.detail.value
        this.setData({
            'cut.ValidPhone': val
        })
    },
    //正则过滤
    filterNum(obj) {
        obj = obj.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
        obj = obj.replace(/^\./g, ""); //验证第一个字符是数字
        obj = obj.replace(/\.{2,}/g, "."); //只保留第一个, 清除多余的
        obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        obj = obj.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //
        return obj
    },
    //发布集攒
    submit() {
        var that = this;
        var cutAddOrUpdataModel = that.data.cut
        // 检测图片上传
        if (that.data.uploadimgobjects.activeCover.config.imageList.length === 0) {
            app.ShowMsg('请上传活动主图')
            return
        }
        if (!cutAddOrUpdataModel.BName.trim()) {
            app.ShowMsg('请填写活动名称')
            return
        }
        //检测时间 
        var currentStamp;
        currentStamp = new Date().getTime();
        var startTime = that.data.XcxStartDate ; // 开始的时间
        cutAddOrUpdataModel.StartDate = startTime
        var endTime = that.data.XcxEndDate; // 结束的时间
        cutAddOrUpdataModel.EndDate = endTime
        var exStartTime = that.data.XcxGetStartDate  // 领取开始的时间
        cutAddOrUpdataModel.ValidStartDate = exStartTime
        var exEndTime = that.data.XcxGetEndDate // 领取结束的时间
        cutAddOrUpdataModel.ValidDate = exEndTime
        
        if(!startTime) {
            app.ShowMsg('请选择活动开始时间')
            return
        }
            
        if(!endTime) {
            app.ShowMsg('请选择活动结束时间')
            return
        }

        if(!exStartTime) {
            app.ShowMsg('请选择活动领取开始时间')
            return
        }

        if(!exEndTime) {
            app.ShowMsg('请选择活动领取结束时间')
            return
        }


        if (new Date(startTime).getTime() > new Date(endTime).getTime() && that.data.cut.Id == 0) {
            app.ShowMsg('活动开始的时间不能活动大于结束的时间')
            return
        }
        if (new Date(exStartTime).getTime() > new Date(exEndTime).getTime() && that.data.cut.Id == 0) {
            app.ShowMsg('领取开始的时间不能大于领取结束的时间')
            return
        }
        if (cutAddOrUpdataModel.CreateNum == 0) {
            app.ShowMsg('请输入本期商品数量');
            return;
        }
        if (cutAddOrUpdataModel.CreateNum < 0) {
            app.ShowMsg('商品数量必须大于0');
            return;
        }
        if (!/^[0-9]{1,6}(\.\d{0,2})?$/.test(cutAddOrUpdataModel.OriginalPrice)) {
            app.ShowMsg("原价必须为数字，且最多为2位小数,最大为6位整数！");
            return;
        } else {
            var price_save = cutAddOrUpdataModel.OriginalPrice * 10000 / 100;
            if (parseInt(price_save) < 1) {
                app.ShowMsg("原价不能低于1分钱！");
                return;
            }
        }
        if (!/^[0-9]{1,6}(\.\d{0,2})?$/.test(cutAddOrUpdataModel.FloorPrice)) {
            app.ShowMsg("底价必须为数字，且最多为2位小数,最大为6位整数！");
            return;
        } else {
            var price_save = cutAddOrUpdataModel.FloorPrice * 10000 / 100;
            if (parseInt(price_save) < 1) {
                app.ShowMsg("底价不能低于1分钱！");
                return;
            }
        }
        if (cutAddOrUpdataModel.ReduceMin == 0) {
            app.ShowMsg('请填写减价范围最小值');
            return;
        }
        if (!/^[0-9]{1,4}(\.\d{0,2})?$/.test(cutAddOrUpdataModel.ReduceMin)) {
            app.ShowMsg("减价范围最小值必须为数字，且最多为2位小数,最大为4位整数！");
            return;
        } else {
            var price_save = cutAddOrUpdataModel.ReduceMin * 10000 / 100;
            if (0 != price_save && parseInt(price_save) < 1) {
                app.ShowMsg("减价范围最小值不能低于1分钱！");
                return;
            }
        }
        if (cutAddOrUpdataModel.ReduceMax == 0) {
            app.ShowMsg('请填写减价范围最大值');
            return;
        }
        if (!/^[0-9]{1,4}(\.\d{0,2})?$/.test(cutAddOrUpdataModel.ReduceMax)) {
            app.ShowMsg("减价范围最大值必须为数字，且最多为2位小数,最大为4位整数！");
            return;
        } else {
            var price_save = cutAddOrUpdataModel.ReduceMax * 10000 / 100;
            if (0 != price_save && parseInt(price_save) < 1) {
                app.ShowMsg("减价范围最大值不能低于1分钱！");
                return;
            }
        }
        if (parseFloat(cutAddOrUpdataModel.ReduceMax) <= parseFloat(cutAddOrUpdataModel.ReduceMin)) {
            app.ShowMsg("减价范围最大值必须大于减价范围最小值！");
            return false;
        }
        if (parseFloat(cutAddOrUpdataModel.OriginalPrice) <= parseFloat(cutAddOrUpdataModel.ReduceMax)) {
            app.ShowMsg("最大金额必须小于原价！");
            return false;
        }

        if (parseInt(cutAddOrUpdataModel.IntervalHour) == 0) {
            app.ShowMsg("请输入自己减价间隔小时数");
            return false;
        }
        // if (that.data.uploadimgobjects.goodsDecri.config.imageList.length === 0) {
        //     app.ShowMsg('请上传商品描述图片')
        //     return
        // }
        //检测电话号码
        if (!/^1[3|4|5|7|8][0-9]{9}$/.test(cutAddOrUpdataModel.ValidPhone)) {
            app.ShowMsg('请填写正确的领取电话')
            return
        }
        if (cutAddOrUpdataModel.ValidAddress == '') {
            app.ShowMsg('请填写领取地址')
            return
        }


        // 验证代金券  
        if (this.data.isVoucher) {
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

            if (this.data.voucherBeginDate != '不填视为立即可用') {
                if (this.data.voucherEndDate == '不填视为长期可用') {
                    app.ShowMsg('请填写代金券结束时间！');
                    return
                }
            }

            if (this.data.voucherEndDate != '不填视为长期可用') {
                if (this.data.voucherBeginDate == '不填视为立即可用') {
                    app.ShowMsg('请填写代金券开始时间！');
                    return
                }
            }

            if (new Date(this.data.voucherBeginDate).getTime() > new Date(this.data.voucherEndDate ).getTime()) {
                app.ShowMsg('代金券结束时间必须大于开始时间！')
                return
            }

            if ((new Date(this.data.voucherEndDate).getTime() - new Date(this.data.voucherBeginDate).getTime()) / (24 * 60 * 60 * 1000) < this.data.voucherValidDay) {
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
      cutAddOrUpdataModel.IsFx = this.data.isShowDistribution ? 1 : 0
      cutAddOrUpdataModel.FxRate = this.data.isShowDistribution ? this.data.distribution : ''
        var bannerList = that.data.uploadimgobjects.activeCover.config.imageList;
        var goodsDecri = that.data.uploadimgobjects.goodsDecri.config;
        cutAddOrUpdataModel.ImgUrl = bannerList[bannerList.length - 1];
        cutAddOrUpdataModel.DescImgList = cutAddOrUpdataModel.Id == 0 ? goodsDecri.imageList : goodsDecri.imageUpdateList //详情图修改用
        cutAddOrUpdataModel.openid = app.globalData.userInfo.openId
        var param = {
            openid: app.globalData.userInfo.openId,
            Id: cutAddOrUpdataModel.Id,
            StoreId: that.data.storeId,
            BName: cutAddOrUpdataModel.BName, //商铺名
            ImgUrl: bannerList[bannerList.length - 1], //banner
          OriginalPrice: cutAddOrUpdataModel.OriginalPrice * 10000 / 100, //原价
          FloorPrice: cutAddOrUpdataModel.FloorPrice * 10000 / 100,//底价
          ReduceMax: cutAddOrUpdataModel.ReduceMax * 10000 / 100, //每次最多
            CutMaxCount: cutAddOrUpdataModel.CutMaxCount, //每次最多帮砍人数,
          ReduceMin: cutAddOrUpdataModel.ReduceMin * 10000 / 100, //每次最少
            StartDate: cutAddOrUpdataModel.StartDate,//开始时间
            EndDate: cutAddOrUpdataModel.EndDate, //结束时间
            CreateNum: cutAddOrUpdataModel.CreateNum, //商品份数
            IntervalHour: cutAddOrUpdataModel.IntervalHour, //自己砍价频率
            Description: cutAddOrUpdataModel.Description, //描述
            ValidStartDate: cutAddOrUpdataModel.ValidStartDate, //领取开始
            ValidDate: cutAddOrUpdataModel.ValidDate, //领取结束
            ValidAddress: cutAddOrUpdataModel.ValidAddress, //位置详情
            ValidPhone: cutAddOrUpdataModel.ValidPhone, //验证手机号码
            ImgList: cutAddOrUpdataModel.DescImgList.join('|'), //图片列表页
            IsFx: cutAddOrUpdataModel.IsFx, //图片列表页
            FxRate: cutAddOrUpdataModel.FxRate, //图片列表页
        }
        wx.request({
            url: addr.Address.AddCutPrice,
            data: param,
            method: "GET",
            header: {
                'content-type': "application/json"
            },
            async success(res) {
                if (res.data.Success) {
                    if (that.data.isVoucher) {
                        let resp = await addVoucher({
                            cityid: app.globalData.cityInfoId,
                            openid: app.globalData.userInfo.openId,
                            CreateNum: that.data.voucherNum,
                            VoucherMoney: that.data.voucherPrice,
                            Deducting: that.data.fullSubtraction,
                            UseStartDate: that.data.voucherBeginDate == '不填视为立即可用' ? '' : that.data.voucherBeginDate + ' ' + that.data.voucherBeginTime,
                            UseEndDate: that.data.voucherEndDate == '不填视为长期可用' ? '' : that.data.voucherEndDate + ' ' + that.data.voucherEndTime,
                            ValidDays: that.data.voucherValidDay,
                            State: 0,
                            ItemId: res.data.Data.cutid,
                            StoreId: that.data.storeId,
                            ItemType: 4
                        })
                    }

                    wx.redirectTo({
                        url: '/pages/cutmgr/cutmgr?storeid=' + that.data.storeId,
                    })
                }
                else {
                    app.ShowMsg(res.data.Message)
                }
            },
            fail: function (e) {
                wx.showToast({
                    title: '发布减价活动出错'
                })
            }
        })
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

    // 优惠券开始时间
    getBeginUseDate(e) {
        let d = new Date()
        this.setData({
            voucherBeginDate: e.detail.value
        })
        if (!this.data.voucherBeginTime) {
            this.setData({
                voucherBeginTime: d.getHours() + ':' + d.getMinutes()
            })
        }
    },

    getBeginUseTime(e) {
        this.setData({
            voucherBeginTime: e.detail.value
        })
    },

    // 优惠券结束时间
    getEndUseDate(e) {
        let d = new Date()
        this.setData({
            voucherEndDate: e.detail.value,
        })
        if (!this.data.voucherEndTime) {
            this.setData({
                voucherEndTime: d.getHours() + ':' + d.getMinutes()
            })
        }
    },

    getEndUseTime(e) {
        this.setData({
            voucherEndTime: e.detail.value
        })
    },
    timerPickerConfirm(e) {
        switch (this.data.timerValueArrIdx) {
            case 0:
                this.setData({
                    XcxStartDate: e.detail[0].timerStr,
                })
                break;
            case 1:
                this.setData({
                    XcxEndDate: e.detail[1].timerStr,
                })
                break;
            case 2:
                this.setData({
                    XcxGetStartDate: e.detail[2].timerStr,
                })
                break;
            case 3:
                this.setData({
                    XcxGetEndDate: e.detail[3].timerStr,
                })
                break
            case 4:
                this.setData({
                    voucherBeginDate: e.detail[4].timerStr,
                })
                break
            case 5:
                this.setData({
                    voucherEndDate: e.detail[5].timerStr,
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