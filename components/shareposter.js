const addr = require("../utils/addr.js");
const regeneratorRuntime = require('../utils/runtime');
const app = getApp();
Component({
  properties: {
    shareParams: {
      type: Object,
    }
  },
  data: {
    canwidth: 0,
    canheight: 0,
    maskhide: true,
    canvahide: false,
    canvaimg: null,
    hascreate: 0,
    isfx: 0,
    fxearns: '',
    isActivity: false
  },

  methods: {
    //性能优化提示：由于此绘图是按照原逻辑改之后再优化了一下，后续维护可以通过getimageinfo把网络图片路径变成本地路径，可以减少下载
    //2019/7/4 组件废了 
    createposter: function (postertype) {
      const _this = this;
      if (1 == postertype) {
        //生成分销海报
        _this.createposter1()
      } else if (0 == postertype) {
        //非分销海报
        _this.createposter2()
      } else if (2 == postertype) {
        //招聘海报
        // sortType 1 = 招聘
        const sortType = 2
        _this.createposter3(sortType)
      } else if (3 == postertype) {
        //求职
        const sortType = 1
        _this.createposter3(sortType)
      } else if (4 == postertype) {
        //房产
        const sortType = 3
        _this.createposter3(sortType)
      } else if (5 == postertype) {
        //其他
        const sortType = 4
        _this.createposter3(sortType)
      }
    },


    //遮罩控制
    closemsk() {
      this.setData({
        maskhide: true,
        canvahide: true
      })
    },

    //更改绘图的数据
    pushData() {
      let shareParams = this.data.shareParams;
      shareParams.cityLogo = app.globalData.cityLogo || ''
      shareParams.cityName = app.globalData.cityName
      shareParams.avatarUrl = app.globalData.userInfo.avatarUrl
      let urlString = addr.getCurrentPageUrl(); //判断tag
      switch (urlString) {
        case 'pages/activity_jiaixin/activity_jiaixin_detail':
          shareParams.tag = '爱心价'
          shareParams.isActivity = true
          break;
        case 'pages/youhui_detail/youhui_detail':
          shareParams.tag = '优惠价'
          shareParams.isActivity = true
          break;
        case 'pages/group_purchase/group_purchase/group_purchase':
          shareParams.tag = '拼团价'
          shareParams.isActivity = true
          break;
        case 'pages/cutPriceTake/cutPriceTake':
          shareParams.tag = '减价'
          shareParams.isActivity = true
          break;
        default:
          shareParams.tag = ''
          shareParams.isActivity = false
      }
      if (shareParams.introduceimg) shareParams.introduceimg = shareParams.introduceimg.indexOf("!") !== -1 ? shareParams.introduceimg.split('!')[0] : shareParams.introduceimg
      if (shareParams.startdate) shareParams.startdate = shareParams.startdate ? shareParams.startdate.split(" ")[0] : "" //切割日期
      if (shareParams.enddate) shareParams.enddate = shareParams.enddate ? shareParams.enddate.split(" ")[0] : ""
      return shareParams
    },

    //保存到相册
    savetophone: function () {
      var that = this
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success: function () {
                wx.saveImageToPhotosAlbum({
                  filePath: that.data.canvaimg,
                  success(res) {
                    //保存成功，不做处理                  
                    wx.showToast({
                      title: '保存成功',
                      icon: 'none'
                    })
                  }
                })
              },
              fail: function (r) {
                console.log(r)
              }
            })
          } else {
            console.log(that.data.canvaimg)
            wx.saveImageToPhotosAlbum({
              filePath: that.data.canvaimg,
              success: function (res) {
                console.log(res)
                wx.showToast({
                  title: '保存成功',
                  icon: 'none'
                })
              },
              fail: function (res) {
                console.log(res)
              }
            })
          }
        }
      })
    },

    //文字处理  超过换行和加...
    dealWords: function (options) {
      options.ctx.setFontSize(options.fontSize);
      options.ctx.setFillStyle(options.fontColor);
      options.ctx.setTextAlign('left');
      let allRow = Math.ceil(options.ctx.measureText(options.word).width / options.maxWidth);
      let count = allRow >= options.maxLine ? options.maxLine : allRow;
      let endPos = 0;
      for (let j = 0; j < count; j++) {
        let nowStr = options.word.slice(endPos);
        let rowWid = 0;
        if (options.ctx.measureText(nowStr).width > options.maxWidth) {
          for (let m = 0; m < nowStr.length; m++) {
            rowWid += options.ctx.measureText(nowStr[m]).width;
            if (rowWid > options.maxWidth) {
              if (j === options.maxLine - 1) {
                options.ctx.fillText(nowStr.slice(0, m - 1) + '...', options.x, options.y + (j + 1) * 18);
              } else {
                options.ctx.fillText(nowStr.slice(0, m), options.x, options.y + (j + 1) * 18);

              }
              endPos += m;
              break;
            }
          }
        } else { //如果当前的字符串宽度小于最大宽度就直接输出
          options.ctx.fillText(nowStr.slice(0), options.x, options.y + (j + 1) * 18);
        }
      }
    },

    //绘制矩形
    rectColor(ctx, x, y, w, h, bgColor, words, fontSize, fontColor, radit, needBorder) {
      ctx.save();
      ctx.setFillStyle(bgColor);
      ctx.setStrokeStyle(bgColor)
      if (needBorder) { //现在是写死颜色，你喜欢可以动态，再用一个对象把全部参数传进来好看的
        ctx.setStrokeStyle('#FF5A00')
        ctx.strokeRect(x, y, w, h);
        ctx.stroke();
      }
      ctx.fillRect(x, y, w, h);
      ctx.setFontSize(fontSize);
      ctx.setFillStyle(fontColor);
      ctx.setTextAlign('center');
      ctx.fillText(words, x + w / 2, y + 12 * radit, w);
      ctx.closePath();
      ctx.restore();
    },

    //绘制圆形头像
    darwArcImg(ctx, src, x, y, w, h) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2, false);
      ctx.setFillStyle('#fff');
      ctx.fill();
      ctx.clip();
      ctx.drawImage(src, x, y, w, h);
      ctx.restore();
    },

    //获取二维码的接口参数
    getQrParam() {
      const shareParams = this.pushData()
      var path = addr.getCurrentPageUrl() //页面的路径
      var scene = addr.getCurrentPageUrlWithScene()
      if (scene == '') {
        scene = 0
      }
      scene = scene.replace(/scene=/g, "");
      scene = scene.replace(/^r=100\d*&/g, "");
      scene = scene.replace(/&r=100\d*/g, "&");
      scene = scene.replace(/&storeId=\d*/g, "");
      scene = scene.replace(/&storeid=\d*/g, "");
      scene = scene.replace(/&sid=\d*/g, "");
      if (1 == shareParams.isfx) {
        scene += "&r=100" + shareParams.loginuserid
      }
      scene = scene.replace("shareoper=1&", "")
      var param = "?openid=" + shareParams.openid + "&appid=" + shareParams.appid + "&path=" + path + "&scene=" + encodeURIComponent(scene)
      if (!!shareParams.isfx) {
        param += "&fxitemid=" + shareParams.fxitemid + "&fxitemtype=" + shareParams.fxitemtype + "&storeid=" + shareParams.storeid
      }
      return param
    },

    //分类的海报二维码参数，直接写死算了，此处必有bug，暂不确定
    getSortParam() {
      const shareParams = this.pushData();
      const path = addr.getCurrentPageUrl();
      let param = "?openid=" + shareParams.openid + "&appid=" + shareParams.appid + "&path=" + path + "&scene=0"
      return param
    },

    //获取设备的信息
    getMobileInfo() {
      const mobileInfo = {}
      mobileInfo.windowWidth = wx.getSystemInfoSync().windowWidth //画布宽度 以px为单位
      mobileInfo.windowHeight = wx.getSystemInfoSync().windowHeight //画布高度 以px为单位
      mobileInfo.radit = wx.getSystemInfoSync().windowWidth / 375 //适配比例，以iphone6为基准
      return mobileInfo
    },

    //隐藏弹窗
    hideLoading(text) {
      wx.hideLoading();
      wx.showToast({
        title: text,
        icon: 'none'
      })
    },

    //绘制
    async canvasFn(option) {
      const _this = this,
        ctx = option.ctx,
        shareParams = option.shareParams,
        radit = option.mobileInfo.radit //适配比例
      let nowCavasH = 0, //画报当前的高度
        windowWidth = option.mobileInfo.windowWidth * 0.85,
        windowHeight = option.mobileInfo.windowHeight,
        scale = windowWidth / windowHeight,
        goodScale = option.imgData.width / option.imgData.height
      //计算画报高度
      //先画一行才可以准确测出measureText，因为font-size
      this.dealWords({
        ctx: ctx,
        fontSize: 16,
        fontColor: '#333',
        word: shareParams.title, //需要处理的文字
        maxWidth: windowWidth - 32, //一行文字最大宽度
        x: 16,
        y: 16,
        maxLine: 2 //文字最多显示的行数
      })
      let allRow1 = Math.ceil(ctx.measureText(`${shareParams.title}`).width / (windowWidth - 32)) //商品行数
      let nowCavasH1 = 0
      if (goodScale <= 1) {
        nowCavasH1 = 84 * radit + windowWidth * 0.8 * radit
      } else {
        nowCavasH1 = 84 * radit + (windowWidth - 24) / goodScale
      }
      nowCavasH1 += 10 //加10px行高
      if (allRow1 == 1) {
        nowCavasH1 = nowCavasH1 + 24 + 6 * radit
      } else {
        nowCavasH1 = nowCavasH1 + 48 + 8 * radit
      }
      nowCavasH1 = nowCavasH1 + windowWidth - 140 * radit - 66 * radit
      //绘制白色背景
      ctx.setFillStyle('#fff')
      ctx.fillRect(4, 4, windowWidth - 8, windowHeight - 8)

      //绘制logo
      ctx.setFontSize(15);
      ctx.setFillStyle('#333333');
      ctx.setTextAlign('left');
      ctx.fillText(shareParams.cityName, -10, -10, windowWidth * radit / 2); //绘制一个画报外，确定绘制字体的大小
      const titleW = ctx.measureText(shareParams.cityName).width;
      const logox = (windowWidth - titleW) / 2 - 20 * radit //logo的x坐标 logo绘制和头像绘制在同一个地方
      ctx.fillText(shareParams.cityName, logox + 50 * radit, 48 * radit);
      //右图标
      if (option.rightBg) {
        ctx.drawImage(option.rightBg, windowWidth - 72 * radit, 32 * radit, 64 * radit, 18 * radit)
      }

      //绘制商品图
      if (goodScale <= 1) {
        goodScale = 1
      }
      if (goodScale == 1) {
        ctx.drawImage(option.goodfile, 28, 84 * radit, windowWidth - 56, windowWidth - 56)
        nowCavasH = 84 * radit + windowWidth - 56
      } else {
        let imgH = (windowWidth - 48) / goodScale
        if (imgH >= windowWidth - 48) imgH = windowHeight - 24
        ctx.drawImage(option.goodfile, 24, 84 * radit, windowWidth - 48, imgH)
        nowCavasH = 84 * radit + imgH
      }
      nowCavasH += 10 //加10px行高

      this.dealWords({
        ctx: ctx,
        fontSize: 16,
        fontColor: '#333',
        word: shareParams.title, //需要处理的文字
        maxWidth: windowWidth - 32, //一行文字最大宽度
        x: 16,
        y: nowCavasH,
        maxLine: 2 //文字最多显示的行数
      })
      let allRow = Math.ceil(ctx.measureText(`${shareParams.title}`).width / (windowWidth - 32)) //商品行数
      if (allRow == 1) {
        nowCavasH += 24
      } else {
        nowCavasH += 48
      }
      //绘制活动标签  商品名字每行18  
      if (shareParams.tag) {
        ctx.drawImage('/images/tagPrice.png', 16, nowCavasH + 6, 50 * radit, 20 * radit)
        ctx.save()
        ctx.setFontSize(10)
        ctx.setFillStyle('#fff')
        ctx.setTextAlign('left')
        ctx.fillText(shareParams.tag, 16 + 6 * radit, nowCavasH + 20 * radit, 50 * radit);
      }

      if (allRow == 1) {
        nowCavasH += 18
      } else {
        nowCavasH += 20
      }
      //绘制价格

      if (shareParams.tag) { //有tag
        if (shareParams.canvasShowMember) { //会员价
          let memberPriceBg = '/images/memberPrice.png'
          ctx.save()
          ctx.setFontSize(16);
          ctx.setFillStyle('#F90606');
          ctx.setTextAlign('left');
          ctx.fillText("￥", 69 * radit, nowCavasH);
          const metrics = ctx.measureText('￥').width;
          ctx.setFontSize(24);
          ctx.setFillStyle('#F90606');
          ctx.setTextAlign('left');
          ctx.fillText(shareParams.floorprice * 1000 / 100000, metrics + 70 * radit, nowCavasH, 50 * radit);
          let floorpriceW = ctx.measureText(`${shareParams.floorprice * 1000 / 100000}`).width
          if (floorpriceW >= 50 * radit) {
            floorpriceW = 50 * radit
          }
          ctx.setFillStyle('#999');
          ctx.setFontSize(16);
          ctx.setLineWidth(2);
          const memberPrice = shareParams.memberPrice * 1000 / 100000
          ctx.fillText(`￥${memberPrice}`, metrics + 70 * radit + floorpriceW, nowCavasH, 50 * radit);
          const memberPriceW = ctx.measureText(`￥${memberPrice}`).width
          let memberX = memberPriceW > 50 * radit ? 50 * radit : memberPriceW
          ctx.save()
          ctx.drawImage(memberPriceBg, metrics + 70 * radit + floorpriceW + memberX, nowCavasH - 17, 50 * radit, 16)
          ctx.setFillStyle('#fff')
          ctx.setFontSize(10)
          ctx.setTextAlign('center')
          ctx.fillText("会员专享", metrics + 70 * radit + floorpriceW + 25 * radit + memberX, nowCavasH - 5, 50 * radit)


        } else { //非会员价
          ctx.save()
          ctx.setFontSize(16)
          ctx.setFillStyle('#F90606')
          ctx.setTextAlign('left')
          ctx.fillText("￥", 69 * radit, nowCavasH)
          const metrics = ctx.measureText('￥').width
          ctx.setFontSize(24);
          ctx.setFillStyle('#F90606')
          ctx.setTextAlign('left')
          ctx.fillText(shareParams.floorprice * 1000 / 100000, metrics + 69 * radit, nowCavasH, 50 * radit);
          let floorpriceW = ctx.measureText(`${shareParams.floorprice * 1000 / 100000}`).width
          if (floorpriceW >= 50 * radit) {
            floorpriceW = 50 * radit
          }

          ctx.setFillStyle('#999');
          ctx.setFontSize(16);
          ctx.setLineWidth(2);
          const oldPrice = shareParams.originalprice * 1000 / 100000
          ctx.fillText(`￥${oldPrice}`, metrics + 70 * radit + floorpriceW, nowCavasH);
          ctx.moveTo(metrics + 70 * radit + floorpriceW, nowCavasH - 6);
          const unmetricsPrice = ctx.measureText(`￥${oldPrice}`).width;
          ctx.lineTo(metrics + 70 * radit + floorpriceW + unmetricsPrice, nowCavasH - 6);
          ctx.setStrokeStyle('#999');
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
          ctx.restore();

        }
      } else { //没有tag
        if (shareParams.canvasShowMember) { //会员价
          let memberPriceBg = '/images/memberPrice.png'
          ctx.save()
          ctx.setFontSize(16);
          ctx.setFillStyle('#F90606');
          ctx.setTextAlign('left');
          ctx.fillText("￥", 16, nowCavasH);
          const metrics = ctx.measureText('￥').width;
          ctx.setFontSize(24);
          ctx.setFillStyle('#F90606');
          ctx.setTextAlign('left');
          ctx.fillText(shareParams.floorprice * 1000 / 100000, metrics + 16, nowCavasH, 50 * radit);
          let floorpriceW = ctx.measureText(`${shareParams.floorprice * 1000 / 100000}`).width
          if (floorpriceW >= 50 * radit) {
            floorpriceW = 50 * radit
          }
          ctx.setFillStyle('#999');
          ctx.setFontSize(16);
          ctx.setLineWidth(2);
          const memberPrice = shareParams.memberPrice * 1000 / 100000
          ctx.fillText(`￥${memberPrice}`, metrics + 16 + floorpriceW, nowCavasH, 50 * radit);
          const memberPriceW = ctx.measureText(`￥${memberPrice}`).width
          let memberX = memberPriceW > 50 * radit ? 50 * radit : memberPriceW
          ctx.save()
          ctx.drawImage(memberPriceBg, metrics + 16 + floorpriceW + memberX, nowCavasH - 17, 50 * radit, 16)
          ctx.setFillStyle('#fff')
          ctx.setFontSize(10)
          ctx.setTextAlign('center')
          ctx.fillText("会员专享", metrics + 16 + floorpriceW + 25 * radit + memberX, nowCavasH - 5, 50 * radit)


        } else { //非会员价
          ctx.save()
          ctx.setFontSize(16)
          ctx.setFillStyle('#F90606')
          ctx.setTextAlign('left')
          ctx.fillText("￥", 16, nowCavasH)
          const metrics = ctx.measureText('￥').width
          ctx.setFontSize(24);
          ctx.setFillStyle('#F90606')
          ctx.setTextAlign('left')
          ctx.fillText(shareParams.floorprice * 1000 / 100000, metrics + 16, nowCavasH, 50 * radit);
          let floorpriceW = ctx.measureText(`${shareParams.floorprice * 1000 / 100000}`).width
          if (floorpriceW >= 50 * radit) {
            floorpriceW = 50 * radit
          }

          ctx.setFillStyle('#999');
          ctx.setFontSize(16);
          ctx.setLineWidth(2);
          const oldPrice = shareParams.originalprice * 1000 / 100000
          ctx.fillText(`￥${oldPrice}`, metrics + 16 + floorpriceW, nowCavasH);
          ctx.moveTo(metrics + 16 + floorpriceW, nowCavasH - 6);
          const unmetricsPrice = ctx.measureText(`￥${oldPrice}`).width;
          ctx.lineTo(metrics + 16 + floorpriceW + unmetricsPrice, nowCavasH - 6);
          ctx.setStrokeStyle('#999');
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
          ctx.restore();

        }
      }


      //绘制圆形头像 
      nowCavasH += 16 * radit
      _this.darwArcImg(ctx, option.avatarfile, 16 * radit, nowCavasH, 32 * radit, 32 * radit)

      if (option.cityLogofile) {
        _this.darwArcImg(ctx, option.cityLogofile, logox, 24 * radit, 40 * radit, 40 * radit)
      }
      //绘制气泡
      ctx.save();
      ctx.beginPath()
      let qipaoW = 140 * radit + 66 * radit - 80 * radit - 26
      ctx.drawImage(option.qipaobg, 60 * radit, nowCavasH + 8 * radit, qipaoW, 20 * radit);
      ctx.setFontSize(8);
      ctx.setFillStyle('#fff')
      ctx.setTextAlign('left')
      ctx.fillText('为你推荐一个好货', 64 * radit + (qipaoW - ctx.measureText('为你推荐一个好货').width) / 2, nowCavasH + 22 * radit, qipaoW);
      ctx.closePath()
      ctx.restore()


      //绘制二维码
      // windowHeight - nowCavasH-20
      let qrW = windowWidth - 140 * radit - 90 * radit
      let qrX = windowWidth - qrW - 16 * radit
      let qrY = nowCavasH - 16 * radit
      if (allRow == 1) {
        ctx.drawImage(option.qrcode, qrX, qrY, qrW, qrW);
      } else {
        ctx.drawImage(option.qrcode, qrX, qrY, qrW, qrW);
      }
      let testH = qrY + qrW + 10
      // 背景图
      ctx.drawImage(option.bgimg, 0, 0, windowWidth, testH)
      if (option.leftBg) ctx.drawImage(option.leftBg, 0, 0, 38 * radit, 38 * radit);

      //绘制时间
      if (shareParams.enddate && allRow == 1) {
        _this.rectColor(ctx, 16, nowCavasH + 50 * radit, 50 * radit, 18 * radit, '#FF5A00', '抢购时间', 8, "#fff", radit)
        _this.rectColor(ctx, 16 + 50 * radit, nowCavasH + 50 * radit, windowWidth - windowWidth * radit * 0.4 - 50 * radit - 32, 18 * radit, '#f0f0f0', `${shareParams.startdate}-${shareParams.enddate}`, 8, "#333", radit)
      } else if (shareParams.enddate && allRow == 2) {
        _this.rectColor(ctx, 16, nowCavasH + 50 * radit, 50 * radit, 18 * radit, '#FF5A00', '抢购时间', 8, "#fff", radit)
        _this.rectColor(ctx, 16 + 50 * radit, nowCavasH + 50 * radit, windowWidth - windowWidth * radit * 0.4 - 50 * radit - 32, 18 * radit, '#f0f0f0', `${shareParams.startdate}-${shareParams.enddate}`, 8, "#333", radit)
      }
      //必须先保存画报宽高，不然安卓在下面保存图片会出错
      _this.setData({
        canwidth: windowWidth,
        canheight: testH,
        maskhide: false,
        hascreate: 1
      })


      wx.hideLoading()
      ctx.draw(true, () => {
        setTimeout(() => {
          wx.canvasToTempFilePath({
            canvasId: 'firstCanvas',
            success: function (res) {
              _this.setData({
                isfx: shareParams.isfx,
                fxearns: shareParams.fxearns,
                canvaimg: res.tempFilePath
              })
            },
            fail: function (res) {
              console.log(res)
            }
          }, _this)
        }, 200);

      })

    },

    //生成分销海报
    async createposter1() {
      const _this = this,
        hascreate = _this.data.hascreate,
        shareParams = _this.pushData() //获取更新后的画报数据
      let imgData = ''
      if (1 == hascreate) { //是否生成海报，未成成则生成海报
        _this.setData({
          maskhide: false,
          canvahide: false
        })
        return
      }
      wx.showLoading({
        title: '生成海报中',
        mask: true,
        icon: 'none'
      })
      wx.getImageInfo({
        src: shareParams.introduceimg,
        success(res) {
          imgData = res
        }
      })
      const param = await _this.getQrParam()
      const mobileInfo = await _this.getMobileInfo()

      if (!shareParams.introduceimg || !shareParams.avatarUrl) {
        wx.hideLoading()()
        wx.showToast({
          title: '生成失败',
          icon: 'none'
        })
        return false;
      }
      wx.downloadFile({ //下载大图
        url: shareParams.introduceimg,
        complete: (goodres) => {
          if (goodres.statusCode == 200) {
            wx.downloadFile({
              url: addr.Address.GetSharePosterQrCode + param,
              complete: (qrres) => {
                if (qrres.statusCode == 200) {
                  wx.downloadFile({
                    url: shareParams.avatarUrl,
                    complete: (avatarres) => {
                      if (avatarres.statusCode == 200) {
                        const canvasOption = {
                          ctx: wx.createCanvasContext('firstCanvas', _this),
                          goodfile: goodres.tempFilePath,
                          qrcode: qrres.tempFilePath,
                          avatarfile: avatarres.tempFilePath,
                          bgimg: "/images/canvasBg-fx.png",
                          qipaobg: "/images/icon-qipao.png",
                          leftBg: '', //左上角的icon
                          rightBg: '', //右上的icon
                          mobileInfo: mobileInfo, //设备的信息
                          shareParams: shareParams, //绘图参数
                          imgData: imgData //图片的信息
                        }
                        if (shareParams.cityLogo) {
                          wx.downloadFile({
                            url: shareParams.cityLogo,
                            complete: logores => {
                              if (logores.statusCode == 200) {
                                canvasOption.cityLogofile = logores.tempFilePath
                                _this.canvasFn(canvasOption)
                              } else {
                                _this.hideLoading('生成失败，请查看您的网络')
                              }
                            }
                          })
                        } else {
                          _this.canvasFn(canvasOption)
                        }
                      } else {
                        _this.hideLoading('生成失败，请查看您的网络')
                      }
                    }
                  })
                } else {
                  _this.hideLoading('生成失败，请查看您的网络')
                }
              }
            })
          } else {
            _this.hideLoading('生成失败，请查看您的网络')
          }
        }

      })

    },

    //非分销海报  
    async createposter2() {
      const _this = this,
        hascreate = _this.data.hascreate,
        shareParams = _this.pushData() //获取更新后的画报数据
      let imgData = ''
      if (1 == hascreate) { //是否生成海报，未成成则生成海报
        _this.setData({
          maskhide: false,
          canvahide: false
        })
        return
      }
      wx.showLoading({
        title: '生成海报中',
        mask: true,
        icon: 'none'
      })
      wx.getImageInfo({
        src: shareParams.introduceimg,
        success(res) {
          imgData = res
        }
      })
      const param = await _this.getQrParam()
      const mobileInfo = await _this.getMobileInfo()

      if (!shareParams.introduceimg || !shareParams.avatarUrl) {
        wx.hideLoading()()
        wx.showToast({
          title: '生成失败',
          icon: 'none'
        })
        return false;
      }

      wx.downloadFile({ //下载大图
        url: shareParams.introduceimg,
        complete: (goodres) => {
          if (goodres.statusCode == 200) {
            wx.downloadFile({
              url: addr.Address.GetSharePosterQrCode + param,
              complete: (qrres) => {
                if (qrres.statusCode == 200) {
                  wx.downloadFile({
                    url: shareParams.avatarUrl,
                    complete: (avatarres) => {
                      if (avatarres.statusCode == 200) {
                        const canvasOption = {
                          ctx: wx.createCanvasContext('firstCanvas', _this),
                          goodfile: goodres.tempFilePath,
                          qrcode: qrres.tempFilePath,
                          avatarfile: avatarres.tempFilePath,
                          bgimg: "/images/canvasBg.png",
                          qipaobg: "/images/icon-qipao.png",
                          leftBg: '/images/canvasLeftIcon.png', //左上角的icon
                          rightBg: '/images/canvasRightIcon.png', //右上的icon
                          mobileInfo: mobileInfo, //设备的信息
                          shareParams: shareParams, //绘图参数
                          imgData: imgData //图片的信息
                        }
                        if (shareParams.cityLogo) {
                          wx.downloadFile({
                            url: shareParams.cityLogo,
                            complete: logores => {
                              if (logores.statusCode == 200) {
                                canvasOption.cityLogofile = logores.tempFilePath
                                // canvasOption.cityLogofile = '/images/canvasRightIcon.png'
                                _this.canvasFn(canvasOption)
                              } else {
                                _this.hideLoading('生成失败，请查看您的网络')
                              }
                            }
                          })
                        } else {
                          _this.canvasFn(canvasOption)
                        }
                      } else {
                        _this.hideLoading('生成失败，请查看您的网络')
                      }
                    }
                  })
                } else {
                  _this.hideLoading('生成失败，请查看您的网络')
                }
              }
            })
          } else {
            _this.hideLoading('生成失败，请查看您的网络')
          }
        }

      })

    },

    //分类信息海报
    async canvasFn_other(option, sortParam) {
      const _this = this,
        ctx = option.ctx,
        shareParams = option.shareParams,
        radit = option.mobileInfo.radit, //适配比例
        windowWidth = option.mobileInfo.windowWidth * 0.85,
        windowHeight = option.mobileInfo.windowWidth * 1.2,
        scale = windowWidth / windowHeight,
        sortType = sortParam
      //几个分类绘制可以封装公共绘制逻辑
      console.log(option)
      if (sortType == 1) { //求职
        let nowCavasH = 0 //画报当前的高度
        //背景图
        ctx.drawImage(option.bgfile, 0, 0, windowWidth, windowHeight);
        //顶部
        if (option.wantedAvatar) {
          _this.darwArcImg(ctx, option.wantedAvatar, windowWidth * 0.5 - 35 * radit, windowHeight * 0.09, 70 * radit, 70 * radit)
          nowCavasH = windowHeight * 0.09
        } else {
          nowCavasH = 0
        }
        ctx.setFontSize(24)
        ctx.fillText(`【求职】${shareParams.pname}`, -10, -10)
        ctx.fillText(`期待工资 ${shareParams.Salary}`, -10, -10)
        ctx.setFontSize(18)
        const jodW = ctx.measureText(`【求职】${shareParams.pname}`).width
        const wantMoney = ctx.measureText(`期待工资 ${shareParams.Salary}`).width
        ctx.setFillStyle('#FF5A00')
        ctx.fillText(`【求职】${shareParams.pname}`, (windowWidth - jodW) / 2, nowCavasH + 100 * radit)
        ctx.setFontSize(18)
        ctx.setFillStyle('#333')
        ctx.fillText(`期待工资: ${shareParams.Salary}`, (windowWidth - wantMoney) / 2, nowCavasH + 100 * radit + 28 * radit, windowWidth - 50 * radit);
        _this.dealWords({
          ctx: ctx,
          fontSize: 14,
          fontColor: '#333',
          word: shareParams.Description, //需要处理的文字
          maxWidth: windowWidth - 56 * radit, //一行文字最大宽度
          x: 28 * radit,
          y: nowCavasH + 100 * radit + 40 * radit,
          maxLine: 3 //文字最多显示的行数
        })
        //二维码和气泡 
        _this.darwArcImg(ctx, option.avatarfile, windowWidth * 0.1, windowHeight * 0.62, 40 * radit, 40 * radit)
        ctx.drawImage(option.qipaobg, windowWidth * 0.1 + 50 * radit, windowHeight * 0.62 + 10 * radit, 100 * radit, 25 * radit)
        ctx.setFontSize(8)
        ctx.setFillStyle('#fff')
        ctx.setTextAlign('left')
        ctx.fillText('为你推荐一个人才', windowWidth * 0.1 + 50 * radit + 12 * radit, windowHeight * 0.62 + 10 * radit + 18 * radit, 100 * radit)
        const cutW = windowWidth - 100 * radit - 40 * radit - 20 * radit - 80 * radit //剩余的宽度 
        ctx.drawImage(option.qrcode, windowWidth * 0.1 + 50 * radit + 110 * radit, windowHeight * 0.6, cutW, cutW)

        //logo和同城名称
        _this.darwArcImg(ctx, option.cityLogofile, windowWidth * 0.3, windowHeight * 0.89, 40 * radit, 40 * radit)
        ctx.setFontSize(16);
        ctx.setFillStyle('#ffffff');
        ctx.setTextAlign('left');
        ctx.fillText(shareParams.cityName, windowWidth * 0.3 + 50 * radit, windowHeight * 0.89 + 24 * radit, 100 * radit);
      } else if (sortType == 2) {
        let nowCavasH = 0 //画报当前的高度
        //背景图
        ctx.drawImage(option.bgfile, 0, 0, windowWidth, windowHeight)
        ctx.setFontSize(24)
        ctx.setTextAlign('left')
        ctx.fillText(`【招聘】${shareParams.Title}`, -10, -10)
        ctx.setFontSize(16)
        ctx.fillText(`${shareParams.Salary}`, -10, -10)
        ctx.fillText(`${shareParams.AreaName}`, -10, -10)
        const jodW = ctx.measureText(`【招聘】${shareParams.Title}`).width
        const wantMoney = ctx.measureText(`${shareParams.Salary}`).width
        const areaW = ctx.measureText(`${shareParams.AreaName}`).width
        const titleX = jodW > windowWidth - 36 * radit ? 28 * radit : (windowWidth - jodW - 36 * radit) / 2
        const areaX = areaW > windowWidth - 56 * radit ? 28 * radit : (windowWidth - areaW) / 2
        _this.dealWords({
          ctx: ctx,
          fontSize: 18,
          fontColor: '#FF5A00',
          word: `【招聘】${shareParams.Title}`, //需要处理的文字
          maxWidth: windowWidth - 56 * radit, //一行文字最大宽度
          x: titleX,
          y: nowCavasH + 80 * radit,
          maxLine: 1 //文字最多显示的行数
        })
        ctx.setFontSize(16)
        ctx.setFillStyle('#333')
        ctx.fillText(`${shareParams.Salary}`, (windowWidth - wantMoney) / 2, nowCavasH + 100 * radit + 24 * radit);
        if (shareParams.AreaName) {
          _this.dealWords({
            ctx: ctx,
            fontSize: 16,
            fontColor: '#333',
            word: `${shareParams.AreaName}`, //需要处理的文字
            maxWidth: windowWidth - 36 * radit, //一行文字最大宽度
            x: areaX,
            y: nowCavasH + 100 * radit + 24 * radit,
            maxLine: 1 //文字最多显示的行数
          })
        }
        if (shareParams.Floor) {
          let jogTag = shareParams.Floor
          let roll = Math.floor((windowWidth - 56 * radit) / 56 * radit)
          let a1 = 0 //用于重置换行的X轴
          let tagX = 20 * radit
          if (jogTag.length >= 12) {
            let delLength = jogTag.length - 12
            jogTag.splice(0, delLength)
          }
          for (let i = 0; i < jogTag.length; i++) {
            if (i % 4 == 0) {
              nowCavasH += 30 * radit
              tagX = tagX * a1 + (20 * radit + 10 * radit)
            } else {
              tagX += (56 * radit + 10 * radit)
            }
            _this.rectColor(ctx, tagX, nowCavasH + 100 * radit + 28 * radit, 56 * radit, 18 * radit, '#fff', jogTag[i], 8, '#333', radit, true)
          }

        } else {
          _this.dealWords({
            ctx: ctx,
            fontSize: 16,
            fontColor: '#333',
            word: `${shareParams.Description}`, //需要处理的文字
            maxWidth: windowWidth - 56 * radit, //一行文字最大宽度
            x: 28 * radit,
            y: nowCavasH + 100 * radit + 48 * radit + 18 * radit,
            maxLine: 3 //文字最多显示的行数
          })
        }
        //logo和同城名称
        ctx.fillText(shareParams.cityName, -10, -10);
        const cityNameW = ctx.measureText(shareParams.cityName).width
        const cityLogoX = (windowWidth - 40 * radit - 56 * radit - cityNameW) / 2
        _this.darwArcImg(ctx, option.cityLogofile, cityLogoX, windowHeight * 0.09, 40 * radit, 40 * radit)
        ctx.setFontSize(16)
        ctx.setFillStyle('#333');
        ctx.setTextAlign('left');
        ctx.fillText(shareParams.cityName, cityLogoX + 40 * radit, windowHeight * 0.09 + 24 * radit);

        //二维码和气泡 
        _this.darwArcImg(ctx, option.avatarfile, windowWidth * 0.1, windowHeight * 0.62, 40 * radit, 40 * radit)
        ctx.drawImage(option.qipaobg, windowWidth * 0.1 + 50 * radit, windowHeight * 0.62 + 10 * radit, 100 * radit, 25 * radit)
        ctx.setFontSize(8)
        ctx.setFillStyle('#fff')
        ctx.setTextAlign('left')
        ctx.fillText('这份工作钱多又靠谱', windowWidth * 0.1 + 50 * radit + 12 * radit, windowHeight * 0.62 + 8 * radit + 18 * radit, 100 * radit)
        const cutW = windowWidth - 100 * radit - 40 * radit - 20 * radit - 80 * radit //剩余的宽度 
        ctx.drawImage(option.qrcode, windowWidth * 0.1 + 50 * radit + 110 * radit, windowHeight * 0.6, cutW, cutW)
      } else if (sortType == 3) {
        let nowCavasH = 0 //画报当前的高度
        //背景图
        ctx.drawImage(option.bgfile, 0, 0, windowWidth, windowHeight)
        //logo和同城名称
        ctx.fillText(shareParams.cityName, -10, -10);
        const cityNameW = ctx.measureText(shareParams.cityName).width
        const cityLogoX = (windowWidth - 40 * radit - cityNameW - 56 * radit) / 2
        _this.darwArcImg(ctx, option.cityLogofile, cityLogoX, windowHeight * 0.09, 40 * radit, 40 * radit)
        ctx.setFontSize(16)
        ctx.setFillStyle('#333');
        ctx.setTextAlign('left');
        ctx.fillText(shareParams.cityName, cityLogoX + 40 * radit, windowHeight * 0.09 + 24 * radit);

        ctx.setFontSize(20)
        ctx.setTextAlign('left')
        ctx.fillText(`【${shareParams.houseType}】${shareParams.Title}`, -10, -10)
        const jodW = ctx.measureText(`【${shareParams.houseType}】${shareParams.Title}`).width
        const titleX = jodW > windowWidth - 56 * radit ? 28 * radit : (windowWidth - jodW) / 2
        _this.dealWords({
          ctx: ctx,
          fontSize: 20,
          word: `【${shareParams.houseType}】${shareParams.Title}`, //需要处理的文字
          maxWidth: windowWidth - 56 * radit, //一行文字最大宽度
          x: titleX,
          y: nowCavasH + 80 * radit,
          maxLine: 1 //文字最多显示的行数
        })
        _this.dealWords({
          ctx: ctx,
          fontSize: 16,
          word: shareParams.Description, //需要处理的文字
          maxWidth: windowWidth - 56 * radit, //一行文字最大宽度
          x: 28 * radit,
          y: nowCavasH + 100 * radit + 10 * radit,
          maxLine: 5 //文字最多显示的行数
        })
        let testWord = shareParams.Description
        let textRol = Math.ceil(ctx.measureText(`${testWord}`).width / (windowWidth - 56))
        if (textRol >= 5) {
          textRol = 5
        }
        console.log(option)
        let imgCount = option.newImgList.length > 0 ? option.newImgList.length : 0 //图片的数量
        let imgX = 0
        for (let i = 0; i < imgCount; i++) {
          imgX = i == 0 ? (windowWidth - 28 * radit - 68 * radit * imgCount) / 2 : imgX += 72 * radit
          ctx.drawImage(option.newImgList[i], imgX, nowCavasH + 100 * radit + 10 * radit + textRol * 18 + 5 * radit, 68 * radit, 68 * radit)
        }

        //二维码和气泡 
        _this.darwArcImg(ctx, option.avatarfile, windowWidth * 0.1, windowHeight * 0.74, 40 * radit, 40 * radit)
        ctx.drawImage(option.qipaobg, windowWidth * 0.1 + 50 * radit, windowHeight * 0.74 + 10 * radit, 100 * radit, 25 * radit)
        ctx.setFontSize(10)
        ctx.setFillStyle('#fff')
        ctx.setTextAlign('left')
        ctx.fillText('好地段，好房源', windowWidth * 0.1 + 50 * radit + 12 * radit, windowHeight * 0.74 + 10 * radit + 18 * radit, 100 * radit)
        const cutW = windowWidth - 100 * radit - 40 * radit - 20 * radit - 80 * radit //剩余的宽度 
        ctx.drawImage(option.qrcode, windowWidth * 0.1 + 50 * radit + 110 * radit, windowHeight * 0.72, cutW, cutW)

      } else if (sortType == 4) {
        let nowCavasH = 0 //画报当前的高度
        //背景图
        ctx.drawImage(option.bgfile, 0, 0, windowWidth, windowHeight)
        //logo和同城名称
        ctx.fillText(shareParams.cityName, -10, -10);
        const cityNameW = ctx.measureText(shareParams.cityName).width
        const cityLogoX = (windowWidth - 40 * radit - cityNameW - 56 * radit) / 2
        _this.darwArcImg(ctx, option.cityLogofile, cityLogoX, windowHeight * 0.09, 40 * radit, 40 * radit)
        ctx.setFontSize(16)
        ctx.setFillStyle('#333');
        ctx.setTextAlign('left');
        ctx.fillText(shareParams.cityName, cityLogoX + 40 * radit, windowHeight * 0.09 + 24 * radit);

        ctx.setFontSize(20)
        ctx.setTextAlign('left')
        ctx.fillText(`【${shareParams.pname}】${shareParams.Title}`, -10, -10)
        const jodW = ctx.measureText(`【${shareParams.pname}】${shareParams.Title}`).width
        const titleX = jodW > windowWidth - 56 * radit ? 28 * radit : (windowWidth - jodW) / 2

        _this.dealWords({
          ctx: ctx,
          fontSize: 20,
          fontColor: '#333',
          word: `【${shareParams.pname}】${shareParams.Title}`, //需要处理的文字
          maxWidth: windowWidth - 56 * radit, //一行文字最大宽度
          x: titleX,
          y: nowCavasH + 80 * radit,
          maxLine: 1 //文字最多显示的行数
        })
        _this.dealWords({
          ctx: ctx,
          fontSize: 16,
          fontColor: '#333',
          word: shareParams.Description, //需要处理的文字
          maxWidth: windowWidth - 56 * radit, //一行文字最大宽度
          x: 28 * radit,
          y: nowCavasH + 100 * radit + 10 * radit,
          maxLine: 5 //文字最多显示的行数
        })
        let testWord = shareParams.Description
        let textRol = Math.ceil(ctx.measureText(`${testWord}`).width / (windowWidth - 56))
        if (textRol >= 5) {
          textRol = 5
        }

        let imgCount = option.newImgList.length > 0 ? option.newImgList.length : 0 //图片的数量
        let imgX = (windowWidth - 80 * radit * imgCount) / 2
        for (let i = 0; i < imgCount; i++) {
          imgX = i == 0 ? imgX : imgX += 82 * radit
          ctx.drawImage(option.newImgList[i], imgX, nowCavasH + 100 * radit + 10 * radit + textRol * 18 + 5 * radit, 80 * radit, 80 * radit)
        }

        //二维码和气泡 
        _this.darwArcImg(ctx, option.avatarfile, windowWidth * 0.1, windowHeight * 0.74, 40 * radit, 40 * radit)
        ctx.drawImage(option.qipaobg, windowWidth * 0.1 + 50 * radit, windowHeight * 0.74 + 10 * radit, 100 * radit, 25 * radit)
        ctx.setFontSize(10)
        ctx.setFillStyle('#fff')
        ctx.setTextAlign('left')
        ctx.fillText('好地段，好房源', windowWidth * 0.1 + 50 * radit + 12 * radit, windowHeight * 0.74 + 10 * radit + 18 * radit, 100 * radit)
        const cutW = windowWidth - 100 * radit - 40 * radit - 20 * radit - 80 * radit //剩余的宽度 
        ctx.drawImage(option.qrcode, windowWidth * 0.1 + 50 * radit + 110 * radit, windowHeight * 0.72, cutW, cutW)
      }

      //必须先保存画报宽高，不然安卓在下面保存图片会出错
      _this.setData({
        canwidth: windowWidth,
        canheight: windowHeight,
        maskhide: false,
        canvahide: false,
        hascreate: 1
      })

      wx.hideLoading()
      ctx.draw(true, () => {
        setTimeout(() => {
          wx.canvasToTempFilePath({
            canvasId: 'firstCanvas',
            success: function (res) {
              _this.setData({
                isfx: 0, //分类没有
                fxearns: 0, //分类没有
                canvaimg: res.tempFilePath
              })
            },
            fail: function (res) {
              console.log(res)
            }
          }, _this)
        }, 500);

      })
    },

    //分类招聘海报
    async createposter3(sortParam) {
      const _this = this,
        hascreate = _this.data.hascreate,
        shareParams = _this.pushData(), //获取更新后的画报数据
        param = _this.getSortParam(),
        mobileInfo = await _this.getMobileInfo(),
        sortType = sortParam
      let bgImg = '',
        bgTempFile = '',
        wantedAvatar = '' //求职者头像
      if (1 == hascreate) { //是否生成海报，未成成则生成海报
        _this.setData({
          maskhide: false,
          canvahide: false
        })
        return
      }
      if (shareParams.wantedAvatar) {
        wx.getImageInfo({
          src: shareParams.wantedAvatar,
          success: res => {
            wantedAvatar = res.path
          }
        })
      }
      let newImgList = []
      if (shareParams.imgList.length > 0) {
        for (let i = 0; i < 3; i++) {
          wx.getImageInfo({
            src: shareParams.imgList[i],
            success: res => {
              newImgList.push(res.path)
            }
          })
        }
      }
      //根据类型确定背景图
      switch (sortType) {
        case 1:
          bgImg = 'http://tcx.vzan.com/Content/headlinesNew/img2/zhaopinBg.png';
          wx.getImageInfo({
            src: bgImg,
            success: res => {
              bgTempFile = res.path
            }
          })
          break;
        case 2:
          bgImg = 'http://tcx.vzan.com/Content/headlinesNew/img2/zhaopinBg.png';
          wx.getImageInfo({
            src: bgImg,
            success: res => {
              bgTempFile = res.path
            }
          })
          break;
        case 3:
          bgImg = 'http://tcx.vzan.com/Content/headlinesNew/img2/houseBg.png';
          wx.getImageInfo({
            src: bgImg,
            success: res => {
              bgTempFile = res.path
            }
          })
          break;
        case 4:
          bgImg = 'http://tcx.vzan.com/Content/headlinesNew/img2/otherBg.png';
          wx.getImageInfo({
            src: bgImg,
            success: res => {
              bgTempFile = res.path
            }
          })
          break;
        default:
      }

      wx.showLoading({
        title: '生成海报中',
        mask: true,
        icon: 'none'
      })
      wx.downloadFile({
        url: addr.Address.GetSharePosterQrCode + param,
        complete: (qrres) => {
          if (qrres.statusCode == 200) {
            console.log(qrres)
            wx.downloadFile({
              url: shareParams.avatarUrl,
              complete: (avatarres) => {
                if (avatarres.statusCode == 200) {
                  const canvasOption = {
                    ctx: wx.createCanvasContext('firstCanvas', _this),
                    qrcode: qrres.tempFilePath,
                    avatarfile: avatarres.tempFilePath,
                    bgfile: bgTempFile,
                    qipaobg: "/images/icon-qipao.png",
                    wantedAvatar: wantedAvatar, //求职者头像
                    mobileInfo: mobileInfo, //设备的信息
                    shareParams: shareParams, //绘图参数
                    newImgList: newImgList
                  }
                  if (shareParams.cityLogo) {
                    wx.downloadFile({
                      url: shareParams.cityLogo,
                      complete: logores => {
                        if (logores.statusCode == 200) {
                          canvasOption.cityLogofile = logores.tempFilePath
                          _this.canvasFn_other(canvasOption, sortType)
                        } else {
                          _this.hideLoading('生成失败，请查看您的网络3')
                        }
                      }
                    })
                  } else {
                    _this.canvasFn_other(canvasOption, sortType)
                  }
                } else {
                  _this.hideLoading('生成失败，请查看您的网络2')
                }
              }
            })
          } else {
            _this.hideLoading('生成失败，请查看您的网络1')
          }
        },
        fail: res => {
          console.log(res)
        }
      })


    }
  }
})