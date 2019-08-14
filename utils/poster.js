var addr = require("addr.js");
var app = getApp();
var poster = {
	data: {
	
	},
	inite: function () {
		var that = this
    var bgimg = that.data.bgimg
    var qrcodeimg = that.data.qrcodeimg
    var sharetitle = that.data.sharetitle
    var middlecontent = that.data.middlecontent
    wx.downloadFile({
      url: qrcodeimg.replace(/http/, "https"), //下载二维码图片
      success: function (res0) {
        // 下载大图
        wx.downloadFile({
          url: bgimg, //下载背景图
          success: function (res) {
            var windowWidth = wx.getSystemInfoSync().windowWidth * 0.85 //画布宽度 以px为单位
            var windowHeight = wx.getSystemInfoSync().windowHeight * 0.75 //画布高度 以px为单位
            var context = wx.createCanvasContext('firstCanvas')
            var title = sharetitle
            var content = middlecontent;
            context.setFillStyle('white')
            context.fillRect(0, 0, windowWidth, windowHeight)
            // 背景图
            context.drawImage(topic, 0, 0, windowWidth, windowHeight);
            // 店铺图片
            if (app.globalData.shareObj.ADImg.length != 0) {
              context.drawImage(ImgUrl, windowWidth * 0.13, windowHeight * 0.14, windowWidth * 0.75, windowHeight * 0.30);
            }
            // 二维码
            context.drawImage(code, windowWidth * 0.18, windowHeight * 0.635, windowHeight * 0.16, windowHeight * 0.16);
            // 店铺名称
            context.setFontSize(14)
            context.setFillStyle('#333333')
            context.fillText(title, windowWidth * 0.13, windowHeight * 0.5)
            // 内容
            context.setFontSize(12)
            context.setFillStyle('#978A8A')
            context.fillText(content, windowWidth * 0.13, windowHeight * 0.58)
            // 水印
            context.setFontSize(8)
            context.setFillStyle('#E8D9D9')
            context.fillText(bottomText, windowWidth * 0.37, windowHeight * 0.98)
            context.draw()


          }
        })
      }
    })
	}
}
module.exports = poster;