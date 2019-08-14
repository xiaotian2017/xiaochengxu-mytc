//组件通信
let indexBehavior = require('../Behavior/indexBehavior') //请求
let backTopBehavior = require('../Behavior/backTopBehavior') //返回顶部

Component({
    behaviors: [backTopBehavior,indexBehavior],
    properties: {
        currentType:String,
        isScroll:{
            type: Boolean,
            default:false,
            observer: 'testStatus'
        },
        showpath:Boolean,
        repost:Boolean,
        beforeNav: {
            type: Number,
            value: 0
        }
    },
    methods: {
        testStatus() {
            console.log('ssss')
        },
        contentSwiper(e) { //滑屏事件
            if (!(typeof e === "number")) {
                const {current} = { ...e.detail}
                let that = this
                let { beforeNav,
                      currentNav,
                      cityNavList } = { ...that.data}
                //变更父组件状态
                that.triggerEvent('ListenerNavChange', {
                    beforeNav: currentNav,
                    currentNav: current,
                    currentType:cityNavList[current].Type
                })
            }
        },
        getContactInfo(e){
            const {contactInfo,open,hide} = {...e.detail}
            this.setData({
                contactInfo,
                open,
                hide
            })
        }
    }
})