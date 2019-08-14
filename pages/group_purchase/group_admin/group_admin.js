const addr = require("../../../utils/addr.js");
let {
  httpClient,
  vzNavigateTo
} = require("../../../utils/util.js");
const host = addr.HOST;
const regeneratorRuntime = require('../../../utils/runtime');
let app = getApp()
let getList = (url, param) => httpClient({
  host,
  addr: url,
  data: param
})
let status = (currentNav) => {
  return {
    '0': 0,
    '1': 1,
    '2': -1
  } [currentNav]
}
let prefixPrice = (price) => {
  return price / 100
}
Page({
  data: {
    nav: ['全部', '进行中', '已结束'],
    cityqrcode: app.globalData.cityqrcode,
    cityphone: app.globalData.cityphone,
    currentNav: 0,
    isLoading: false,
    close: true
  },
  onLoad(options) {
    let that = this
    that.setData({
      storeId: options.storeid
    })
    that.initParam()
    app.getUserInfo((userInfo) => {
      that.setData({
        openid: userInfo.openId
      })
      that.loadData()
    })
  },
  switchNav(e) {
    let that = this
    const {
      index
    } = {
      ...e.currentTarget.dataset
    }
    let {
      currentNav,
      page,
      loadingAll
    } = {
      ...that.data
    }
    if (currentNav == index) {
      return
    } else {
      (async () => {
        that.setData({
          currentNav: index
        })
      })().then(() => {
        if (page[currentNav].length == 0 && !loadingAll[currentNav]) {
          that.loadData()
        }
      })
    }
  },
  swiperPage(e) {
    let that = this
    let {
      currentNav,
      page,
      loadingAll
    } = {
      ...that.data
    }
    let {
      current
    } = {
      ...e.detail
    }
    that.setData({
      currentNav: current
    })
    setTimeout(() => {
      if (page[currentNav].length == 0 && !loadingAll[currentNav]) {
        that.loadData()
      }
    }, 20)
  },
  initParam() {
    let that = this,
      pageIndex, page, loadingAll
    const {
      nav
    } = {
      ...that.data
    }
    pageIndex = new Array(3).fill(1)
    page = new Array(3).fill([])
    loadingAll = new Array(3).fill(false)
    that.setData({
      pageIndex,
      page,
      loadingAll
    })
  },
  async dataRequest() {
    let that = this
    let {
      currentNav,
      pageIndex,
      openid,
      storeId
    } = {
      ...this.data
    }
    let param = {
      cityid: app.globalData.cityInfoId,
      openid: openid,
      pageindex: pageIndex[currentNav],
      sid: storeId,
      t: status(currentNav)
    }
    let data = await getList(
      'IBaseData/GetMyMgrGroups',
      param
    )
    if (data.Success) {
      return data.Data.listgroup
    }
  },
  loadData() {
    let that = this
    let {
      currentNav,
      page,
      pageIndex,
      loadingAll,
      isLoading
    } = {
      ...that.data
    }
    if (!loadingAll[currentNav] && !isLoading) {
      that.setData({
        isLoading: true
      })
      wx.showLoading({
        title: '正在加载中',
        duration: 10000
      })
      that.dataRequest().then((data) => {
        if (data.length > 0) {
          data.forEach(key => {
            Object.keys(key).forEach(obj => {
              if (key[obj] == null) {
                delete key[obj]
              }
            })
            key.OriginalPrice = prefixPrice(key.OriginalPrice)
            key.UnitPrice = prefixPrice(key.UnitPrice)
            key.DiscountPrice = prefixPrice(key.DiscountPrice)
          })
          that.setData({
            [`page[${currentNav}]`]: page[currentNav].concat(data),
            [`pageIndex[${currentNav}]`]: pageIndex[currentNav] + 1
          })
          if (data.length < 10) {
            that.setData({
              [`loadingAll[${currentNav}]`]: true
            })
          }
        } else {
          that.setData({
            [`loadingAll[${currentNav}]`]: true
          })
        }
      })
      wx.hideLoading()
      that.setData({
        isLoading: false
      })
    }
  },
  //编辑
  edit(e) {
    let {
      storeId
    } = {
      ...this.data
    }
    const {
      gid,
      r
    } = {
      ...e.currentTarget.dataset
    }
    vzNavigateTo({
      url: '/pages/group_purchase/pulish_group_purchase/pulish_group_purchase',
      query: {
        storeId,
        gid,
        r: r
      }
    })
  },
  //去详情页
  goGroupDtl(e) {
    if (app.globalData.cityExpired == 1) {
      wx.redirectTo({
        url: '/pages/expirePage/expirePage',
      })
      return
    }
    let that = this
    const {
      state,
      gid
    } = {
      ...e.currentTarget.dataset
    }
    if (state == -1) {
      that.setData({
        close: false
      })
      return
    }
    vzNavigateTo({
      url: '/pages/group_purchase/group_purchase/group_purchase',
      query: {
        gid
      }
    })
  },
  //记录
  goRecord(e) {
    let that = this
    const {
      index
    } = {
      ...e.currentTarget.dataset
    }
    let {
      page,
      currentNav,
      storeId
    } = {
      ...that.data
    }
    let sgid = page[currentNav][index].Id
    vzNavigateTo({
      url: '/pages/group_purchase/group_purchase_record/group_purchase_record',
      query: {
        storeId,
        gsid: sgid
      }
    })
  },
  //删除
  async deleteRequest(param) {
    let data = getList(
      'IBaseData/DeleteStoreGroup',
      param
    )
    if (data.Success) {
      return data
    }
  },
  //删除
  delete(e) {
    let that = this
    wx.showModal({
      title: '删除拼团',
      cancelColor: '#fe3d49',
      confirmColor: '#999',
      content: '删除不可恢复,请谨慎操作。您确定要删除该拼团？',
      success(res) {
        if (res.confirm) {
          const {
            gid,
            index
          } = {
            ...e.currentTarget.dataset
          }
          let {
            page,
            currentNav,
            openid
          } = {
            ...that.data
          }
          let param = {
            cityid: app.globalData.cityInfoId,
            openid,
            scid: gid
          }
          that.deleteRequest(param).then(data => {
            that.setData({
              [`page[${currentNav}][${index}].State`]: -1
            })
          })
        }
      }
    })
  },
  //去发布页
  goPublish() {
    let {
      storeId
    } = {
      ...this.data
    }
    vzNavigateTo({
      url: '/pages/group_purchase/pulish_group_purchase/pulish_group_purchase',
      query: {
        storeId,
        r: 0
      }
    })
  },
  //关闭弹层
  closeLayer() {
    let that = this
    that.setData({
      close: true
    })
  }
})