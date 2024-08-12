class Timer {
    containerEl = document.querySelector('.splits')
    timeEl = document.querySelector('.time')

    addSplit(name, time, splitIndex) {
        const el = this.splitEl = document.createRange().createContextualFragment(`
            <div class="split">
                <div class="split__name">${name}</div>
                <div class="split__comp">
                    <div class="split__delta"></div>
                    <div class="split__time">${this.formatSplitTime(time)}</div>
                </div>
            </div>
        `).firstElementChild

        this.deltaEl = el.querySelector('.split__delta')
        this.compEl = el.querySelector('.split__comp')

        this.containerEl.append(el)
        this.containerEl.style.setProperty('--nsplits', splitIndex + 1)

        const timeElWidth = el.querySelector('.split__time').clientWidth

        this.compEl.style.width = `${timeElWidth}px`
    }

    updateTime(time) {
        if (time == this.prevTime) return

        this.timeEl.innerHTML = this.formatTime(time)
        this.prevTime = time
    }

    updateDelta(delta, isBest) {
        this.deltaEl.textContent = this.formatDelta(delta)
        this.deltaEl.dataset.status = isBest ? 'best' : delta[0] == '-' ? 'ahead' : 'behind'
    }

    settleSplit() {
        const deltaElWidth = this.deltaEl.clientWidth

        this.compEl.style.width = `${deltaElWidth}px`
    }

    showDelta() {
        this.compEl.style.width = '60px'
        this.splitEl.dataset.showDelta = true
    }

    clearSplits() {
        this.nSplits = 0
        this.containerEl.style.setProperty('--nsplits', 0)
        this.containerEl.dataset.clear = true
        setTimeout(() => {
            this.containerEl.innerHTML = ''
            delete this.containerEl.dataset.clear
        }, 400)
    }

    formatTime(time) {
        if (time == '0' || time == '00:00:00') return '00:00<small>.0</small>'
        if (time[1] == '0') return `${time.substring(3, 8)}<small>.${time[9]}</small>`

        return time.substring(1, 8)
    }

    formatSplitTime(time) {
        if (time[1] != '0') return time.substring(1, 8)
        if (time[3] != '0') return time.substring(3, 8)

        return time.substring(4, 8)
    }

    formatDelta(delta) {
        const sign = delta[0] == '-' ? '-' : '+'
        if (sign == '-') delta = delta.substring(1)
        
        const minutes = Number(delta.substring(3, 5))
        const seconds = Number(delta.substring(6, 8))
        
        if (minutes > 9) delta = delta.substring(3, 8)
        else if (minutes > 0) delta = delta.substring(4, 8)
        else if (seconds > 9) delta = delta.substring(6, 10)
        else delta = delta.substring(7, 10)
        
        return `${sign} ${delta}`
    }
}