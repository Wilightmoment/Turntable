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
            Object.keys(vm.data).forEach(object => {
                count += vm.data[object][0]
            })
            angle = 360 / count
            Object.keys(vm.data).forEach(object => {
                angle_inner.push(vm.data[object][0] * angle)
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
            this.del_award()
            this.award_angle = ~~(Math.random() * 360)+360*8
            this.pointer_deg = 0
            this.award = ''
            this.playing()
        },
        del_award () {
            if (this.award!=='') {
                if (this.data[this.award][0] > 1) {
                    const temp_count = this.data[this.award][0]-1
                    this.$set(this.data, this.award, [temp_count, this.data[this.award][1]])
                } else {
                    if (Object.keys(this.data).length % 2 === 0 && Object.keys(this.data).length > 2) {                        
                        this.await_del.push(this.award)
                        if (this.await_del.length === 2) {
                            this.await_del.forEach(data=> Vue.delete(this.data, data))
                            this.await_del = []
                        }
                    } else {
                        Vue.delete(this.data, this.award)
                    }
                }
            }
        },
        playing () {
            this.is_playing = true
            let timeout
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
                clearTimeout(timeout)
                const mod_award_angle = (this.award_angle + 171) % 360
                
                this.get_angles.angle_outer.forEach((angle, index) => {
                    if (this.get_angles.angle_outer[index+1]) {
                        if (mod_award_angle >= angle && mod_award_angle < this.get_angles.angle_outer[index + 1]) {
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