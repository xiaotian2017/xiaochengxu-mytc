const app = getApp()
import util from '../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const pageData = options
    console.log(pageData)
    this.setData({
      topStatus: options.topStatus || '',
      post: JSON.parse(options.post),
      isFree: options.isFree || '',
      postId: options.postId,
      payType: pageData.payType
    })
  },

  //前往置顶页
  goSetTop() {
    const {
      postId,
      payType,
      post
    } = this.data
    wx.redirectTo({
      url: '/pages/postNav/moreServer/moreServer?payType=' + payType + '&post=' + post + '&postId=' + postId,
    })
  },

  //前往帖子详情
  goDetail() {
    const postId = this.data.postId
    wx.redirectTo({
      url: '/pages/publishNote/noteDetail?id=' + postId,
    })
  }


})