Component({
    properties: {
        audioSrc: {
            type: String,            
            observer: 'createAudioContext'
        }
    },
    data: {
        isPlay: false
    },
    detached() {
        this.innerAudioContext && this.innerAudioContext.destroy();
    },
    methods: {
        // 创建音频实例        
        createAudioContext() {
            if (!this.data.audioSrc.trim()) return;
            this.innerAudioContext = wx.createInnerAudioContext();
            this.setData({
                isPlay: false
            })
            let innerAudioContext = this.innerAudioContext;
            innerAudioContext.autoplay = true;
            innerAudioContext.src = this.data.audioSrc;
            innerAudioContext.loop = true;
            innerAudioContext.obeyMuteSwitch = true;
        },
        // 播/暂音频
        audioStateChange() {
            if (this.data.isPlay) {
                this.innerAudioContext.play();
            } else {
                this.innerAudioContext.pause();
            }
            this.setData({
                isPlay: !this.data.isPlay
            })
        }
    }
})