Component({
    properties: {
        videoParams: {
            type: Object,
            observer: 'createVideoContext'
        }
    },
    detached() {
        this.videoContext = null;
    },
    methods: {
        // 创建视频实例        
        createVideoContext() {
            if (!this.data.videoParams.convertFilePath.trim()) return;
            this.videoContext = wx.createVideoContext('baseVideo', this)
        },
        // 播放视频
        openVideo() {
            let that = this;
            let {videoContext} = {...that.data}
            that.videoContext.requestFullScreen();
            that.videoContext.play();
            setTimeout(() => {
                that.setData({
                    isExitFullScreen: true
                })
            }, 1000)            
        },
        // 进入或退出全屏
        fullscreenchangeHandle() {
            if (this.data.isExitFullScreen) {
                this.videoContext.pause();
                this.setData({
                    isExitFullScreen: false
                })
            }
        }
    }
})