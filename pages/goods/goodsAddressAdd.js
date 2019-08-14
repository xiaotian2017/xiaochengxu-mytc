const app = getApp();
const { vzNavigateTo, httpClient, verifyNum } = require("../../utils/util.js");
const addr = require("../../utils/addr.js");
const regeneratorRuntime = require('../../utils/runtime');

const getAddresse = (paramsObj) => httpClient({ addr: addr.Address.GetAddresse, data: paramsObj });
const modifyAddress = (paramsObj) => httpClient({ addr: addr.Address.ModifyAddress, data: paramsObj });
const getSubArea = (pid) => httpClient({ addr: addr.Address.GetSubArea, data: { pid } });

// public ActionResult GetAddresse(int cityid, string openid, int addrid = 0)
let paramsObj = null;
Page({
  data: {
    acceptName: '',
    acceptPhone: '',
    postNum: '',
    acceptAddress: '',
    range: [],
    defaultState: false,
    rangeIdxArr: [],
    isChooseArea: false,
    isConfirm: false,
    areaText: '请选择区域'
  },
  onLoad(options) {
    this.type = options.type;
    app.getUserInfo(() => {
      paramsObj = {}
      this.cityid = app.globalData.cityInfoId;
      this.addrid = parseInt(options.addrid);
      this.openid = app.globalData.userInfo.openId;

      paramsObj.cityid = this.cityid;
      paramsObj.addrid = parseInt(this.addrid);
      paramsObj.openid = app.globalData.userInfo.openId;
    })
    this.getAddresse();
    wx.setNavigationBarTitle({
      title: "收货地址"
    })
  },
  // 获取要从新编辑的运费模板
  async getAddresse() {
    this.showLoading('加载中...');
    let resp = await getAddresse(paramsObj);
    wx.hideLoading();
    let _range = [];
    let mainmodel = resp.Data.mainmodel;
    _range.push(resp.Data.mainmodel.CityList, resp.Data.mainmodel.AreaList, resp.Data.mainmodel.StreetList)
    this.setData({
      range: _range
    })

    if (this.addrid != 0) {
      this.AreaCode = mainmodel.Address.AreaCode;
      this.setData({
        acceptName: mainmodel.Address.NickName,
        acceptPhone: mainmodel.Address.TelePhone,
        postNum: mainmodel.Address.ZipCode,
        acceptAddress: mainmodel.Address.Address,
        defaultState: Number(mainmodel.Address.State),
        areaText: mainmodel.Address.AreaText
      })
      if (0 != mainmodel.currentAreaCode)
      {

        let res = await getSubArea(mainmodel.currentAreaCode)
        let res1 = await getSubArea(mainmodel.currentCityCode)
        res1.Data.list.shift();
        res.Data.list.shift();
        this.setData({
          'range[1]': res1.Data.list,
          'range[2]': res.Data.list
        })
      }
      
    }
  },
  // 获取收货人姓名
  getAcceptName(e) {
    this.setData({
      acceptName: e.detail.value
    })
    console.log(this.data.acceptName);
  },
  // 获取收货人电话
  getAcceptPhone(e) {
    this.setData({
      acceptPhone: e.detail.value
    })
    console.log(this.data.acceptPhone);
  },
  // 获取详细地址
  getAcceptAddress(e) {
    this.setData({
      acceptAddress: e.detail.value
    })
    console.log(this.data.acceptAddress);
  },
  // 获取邮政编码
  getPostNum(e) {
    this.setData({
      postNum: e.detail.value
    })
    console.log(this.data.postNum);
  },
  // 地址变更
  bindRegionChange(e) {
    this.AreaCode = this.data.range[2][e.detail.value[2]].Code;

    // 要不改地址呢
    this.setData({
      rangeIdxArr: e.detail.value,
      isChooseArea: true,
      areaText: this.data.range[0][e.detail.value[0]].Name + this.data.range[1][e.detail.value[1]].Name + this.data.range[2][e.detail.value[2]].Name
    })
  },
  // 是否设置默认
  switchChange() {
    this.setData({
      defaultState: !this.data.defaultState
    })
  },
  async areaColumnchange(e) {
    let { column, value } = e.detail;
    if (column == 2) return;
    let _range = this.data.range;
    let resp = await getSubArea(this.data.range[column][value].Code)

    resp.Data.list.shift();
    console.log(_range[column + 1])

    _range[column + 1] = resp.Data.list
    if (column == 0) {
      _range[2] = []
    }
    this.setData({
      range: _range
    })
  },
  showModal(content) {
    wx.showModal({
      title: '提示',
      content,
      showCancel: false
    })
  },
  commonBack(title) {
    wx.showToast({
      title
    })
    if (this.type == 'fromOrder') {
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 1000)
      return;
    }
    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/goods/goodsAddressList'
      })
    }, 1000)
  },
  showLoading(title) {
    wx.showLoading({
      title
    })
  },
  // 添加 修改运费模板
  async modifyAddress() {
    this.showLoading('提交中...');
    let resp = await modifyAddress({
      cityid: this.cityid,
      openid: this.openid,
      Id: this.addrid,
      Name: this.data.acceptName,
      Address: this.data.acceptAddress,
      NickName: this.data.acceptName,
      TelePhone: this.data.acceptPhone,
      IsDefault: Number(this.data.defaultState),
      AreaText: this.data.isChooseArea ? this.data.range[0][this.data.rangeIdxArr[0]].Name + this.data.range[1][this.data.rangeIdxArr[1]].Name + this.data.range[2][this.data.rangeIdxArr[2]].Name : this.data.areaText,
      ZipCode: this.data.postNum,
      AreaCode: this.AreaCode
    });
    wx.hideLoading();
    if (resp.code == 1) {
      if (this.addrid == 0) {
        this.commonBack('添加成功！')

      } else {
        this.commonBack('修改成功！')
      }
    } else {
      this.showModal(resp.msg);
    }
  },
  // 完成
  addAddress() {
    if (!this.data.acceptName.trim()) {
      this.showModal('请输入收货人姓名！');
      return;
    }
    if (!this.data.acceptPhone.trim()) {
      this.showModal('请输入联系电话!');
      return;
    }
    if (!this.data.acceptAddress.trim()) {
      this.showModal('请输入详细地址！');
      return;
    }
    if (!this.data.isChooseArea && this.addrid == 0) {
      this.showModal('请选择区域');
      return;
    }

    this.modifyAddress();
  }
})