const vue = new Vue({
    el: '#app',
    data: {
        data: {},
        year: 2017,
        pointer_deg: -171,
        award_angle: 0,
        award: '',
        is_playing: false,
        await_del: []
    },
    computed: {
        get_angles () {
            const angle_outer = [], angle_inner = [], vm = this
            let angle = 0, count = 0, total_angle = 0
            //先計算總共有多少份獎品
            Object.keys(vm.data).forEach(object => {
                count += vm.data[object][0]
            })
            angle = 360 / count //一份的角度比例
            Object.keys(vm.data).forEach(object => {
                //計算該獎品總佔有角度，例如 flight 有 1/20 ，wish 有 5/20
                angle_inner.push(vm.data[object][0] * angle)
                //下一個獎品會根據上一個獎品佔有的角度而轉幾度
                //例如 flight 佔 18°，所以 wish 要從 18° 開始繪製
                angle_outer.push(total_angle)
                total_angle += vm.data[object][0] * angle
            })
            return { angle_inner, angle_outer }
        }
    },
    methods: {        
        get_data (year) {
            const vm = this
            if (vm.is_playing) return;
            vm.award = ''
            vm.data = {}
            vm.await_del = []
            //取得資料
            fetch('data.json').then(json => json.json()).then(data => {
                data.forEach(obj => {
                    if (obj.year === year) {
                        vm.data = obj.item
                        // console.log(Object.keys(vm.data))
                    }
                })
            })
        },
        press () {
            if (this.is_playing) return;
            this.del_award() //開始前先刪除上一個抽到的獎品
            this.award_angle = ~~(Math.random() * 360)+360*8 //隨機決定獎品
            this.pointer_deg = 0
            this.award = ''
            this.playing()
        },
        del_award () {
            if (this.award!=='') {
                //如果不是最後一個獎品就直接刪除 p.s.因為不影響總類數目
                if (this.data[this.award][0] > 1) {
                    const temp_count = this.data[this.award][0]-1
                    this.$set(this.data, this.award, [temp_count, this.data[this.award][1]])
                } else {
                    //因為是輪盤的顏色是兩個顏色交錯，為了解決奇數顏色重複問題，所以先將以抽完的獎品擱置
                    //等第二種獎品也被抽完時，再一起刪除兩者
                    if (Object.keys(this.data).length % 2 === 0 && Object.keys(this.data).length > 2) {                        
                        this.await_del.push(this.award)
                        if (this.await_del.length === 2) {
                            this.await_del.forEach(data=> Vue.delete(this.data, data))
                            this.await_del = []
                        }
                    } else {
                        //剩下兩種的話就直接刪除
                        Vue.delete(this.data, this.award)
                    }
                }
            }
        },
        playing () {
            this.is_playing = true
            let timeout
            //透過 setTimeout 不斷呼叫自己達到旋轉的效果
            if (this.pointer_deg < this.award_angle) {
                timeout = setTimeout(this.playing, 2)
                if (this.pointer_deg < 720) {
                    this.pointer_deg += 20
                } else if (this.pointer_deg < 1440) {
                    this.pointer_deg += 15
                } else if (this.pointer_deg < 2160) {
                    this.pointer_deg += 10
                } else if (this.pointer_deg < 2520) {
                    this.pointer_deg += 5
                } else if (this.pointer_deg < 2880) {
                    this.pointer_deg += 2
                } else {
                    this.pointer_deg += 1
                }
            } else {
                clearTimeout(timeout)//轉完就清除
                const mod_award_angle = (this.award_angle + 171) % 360 //因為一開始-171°，所以這邊要加回來才會是正確的角度
                
                this.get_angles.angle_outer.forEach((angle, index) => {
                    //判斷轉到的角度介於哪兩者之間，即轉到該獎品
                    if (this.get_angles.angle_outer[index+1]) {
                        if (mod_award_angle >= angle && mod_award_angle < this.get_angles.angle_outer[index + 1]) {
                            //處理轉到已經沒有的獎品
                            if (this.await_del[0] === Object.keys(this.data)[index]) {
                                alert('此獎品已被抽完，請再抽一次')
                                this.is_playing = false
                                return
                            }
                            this.award = Object.keys(this.data)[index]
                            // console.log(this.award)                            
                        }
                    }else {
                        if (mod_award_angle >= angle) {
                            if (this.await_del[0] === Object.keys(this.data)[index]) {
                                alert('此獎品已被抽完，請再抽一次')
                                this.is_playing = false
                                return
                            }
                            this.award = Object.keys(this.data)[index]
                            // console.log(this.award)
                        }
                    }
                })
                this.is_playing = false
                // console.log(this.data[this.award])
            }
        }
    },
    created () {
        this.get_data(this.year)
    }
})