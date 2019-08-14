const app = getApp();
const { vzNavigateTo, httpClient, verifyNum } = require("../../utils/util.js");
const addr = require("../../utils/addr.js");
const regeneratorRuntime = require('../../utils/runtime');

const updateFreight = (paramsObj) => httpClient({ method: 'POST', addr: addr.Address.UpdateFreight, data: paramsObj });
const getFreight = (paramsObj) => httpClient({ addr: addr.Address.GetFreight, data: paramsObj });

let paramsObj = null;
Page({
    data: {
        fareName: '', 
        baseCount: '',
        baseCost: '',
        extraCost: ''
    },
    onLoad(options) {
      
        app.getUserInfo(() => {
            paramsObj = {}
            this.sid = options.storeid;
            this.fareId = parseInt(options.fareId);

            paramsObj.StoreId = this.sid;
            paramsObj.Id = this.fareId;
            paramsObj.openid = app.globalData.userInfo.openId;

            if (this.fareId != 0) {
                this.getFreight({
                    AreaCode: app.globalData.areaCode,
                    openid: app.globalData.userInfo.openId,
                    storeid: this.sid,
                    Fid: this.fareId
                });
            }
        })

        wx.setNavigationBarTitle({
            title: "运费模板"
        })
    },
    // 获取要从新编辑的运费模板
    async getFreight(paramsObj) {
        this.showLoading('加载中...');
        let resp = await getFreight(paramsObj);
        wx.hideLoading();
        let freightTemplate = resp.Data.FreightTemplateViewModel.FreightTemplate;                
        
        this.setData({
            fareName: freightTemplate.Name,     
            baseCount: freightTemplate.BaseCount,
            baseCost: (freightTemplate.BaseCost/100).toFixed(2),
            extraCost: (freightTemplate.ExtraCost/100).toFixed(2),
        })
    },
    // 获取运费模板标题
    getFareName(e) {
        this.setData({
            fareName: e.detail.value
        })
    },
    // 基本件数
    getBaseCount(e) {
        this.setData({
            baseCount: e.detail.value
        })
    },
    // 基础费用
    getBaseCost(e) {
        this.setData({
            baseCost: verifyNum(e.detail.value)
        })
    },
    // 额外费用
    getExtraCost(e) {
        this.setData({
            extraCost: verifyNum(e.detail.value)
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
        setTimeout(() => {
            wx.redirectTo({
                url: '/pages/goods/goodsReleaseFareList?storeid='+ this.sid
            })
        }, 1000)
    },
    showLoading(title) {
        wx.showLoading({
            title
        })
    },
    // 添加 修改运费模板
    async updateFreight() {     
        this.showLoading('提交中...');
        let resp = await updateFreight(paramsObj);
        wx.hideLoading();
        if (resp.code == 1) {
            if (this.fareId == 0) {
                this.commonBack('添加成功！')

            } else {
                this.commonBack('修改成功！')
            }
        } else {
            this.showModal(resp.msg);
        }        
    },
    // 完成
    createFare() {
        if (!this.data.fareName.trim()) {
            this.showModal('请输入模板名称');
            return;
        }
        if (!parseInt(this.data.baseCount)) {
            this.showModal('件数不能为空或0!');
            return;
        }
        if (!this.data.baseCost && this.data.baseCost!=0) {
            this.showModal('基础运费不能为空！');
            return;
        }
        if (!this.data.extraCost && this.data.extraCost!=0) {
            this.showModal('额外运费不能为空！');
            return;
        }

        paramsObj.Name = this.data.fareName;
        paramsObj.BaseCount = this.data.baseCount;
        paramsObj.BaseCost = this.data.baseCost * 100;
        paramsObj.ExtraCost = this.data.extraCost * 100;

        this.updateFreight();
    }
})