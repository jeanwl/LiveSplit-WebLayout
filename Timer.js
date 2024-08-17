class Timer {
    containerEl = document.querySelector('.splits')
    timeEl = document.querySelector('.time')

    addSplit(name, time, splitIndex, hasTime) {
        const el = this.splitEl = document.createRange().createContextualFragment(`
            <div class="split">
                <div class="split__name">${name}</div>
                <div class="split__comp">
                    <div class="split__delta"></div>
                    <div class="split__time--final"></div>
                    <div class="split__time">${hasTime ? this.formatSplitTime(time) : ''}</div>
                </div>
            </div>
        `).firstElementChild

        this.nameEl = el.querySelector('.split__name')
        this.compEl = el.querySelector('.split__comp')
        this.deltaEl = el.querySelector('.split__delta')
        this.splitTimeFinalEl = el.querySelector('.split__time--final')
        this.splitTimeEl = el.querySelector('.split__time')

        this.containerEl.append(el)
        this.containerEl.style.setProperty('--nsplits', splitIndex + 1)

        this.adjustCompWidth()
    }

    updateTime(time) {
        if (time == this.prevTime) return

        this.timeEl.innerHTML = this.formatTime(time)
        this.prevTime = time
    }

    updateSplitTime(time) {
        this.splitTimeFinalEl.textContent = this.formatSplitTime(time)
        this.splitEl.dataset.settled = true
        this.adjustCompWidth(true)

        const total = this.splitTimeFinalEl.clientWidth + 12
        this.deltaEl.style.transform = `translateX(-${total}px)`
    }

    updateDelta(delta, isBest) {
        this.deltaEl.textContent = this.formatDelta(delta)
        this.deltaEl.dataset.status = isBest ? 'best' : delta[0] == '-' ? 'ahead' : 'behind'
    }

    showDelta() {
        this.splitEl.dataset.showDelta = true
        this.adjustCompWidth()

        const total = this.splitTimeEl.clientWidth + 12
        this.deltaEl.style.transform = `translateX(-${total}px)`
    }

    adjustCompWidth(isSettled) {
        const compText = this.compEl.innerText

        if (compText == '') return
        
        let total = 24 + (isSettled ? this.splitTimeFinalEl.clientWidth : this.splitTimeEl.clientWidth)
        const hasDelta = compText.includes('\n')

        if (hasDelta) total += 12 + (isSettled ? this.deltaEl.clientWidth : 60)
        
        this.nameEl.style.transform = `translateX(-${total}px)`
    }

    clearSplits() {
        this.containerEl.style.setProperty('--nsplits', 0)
        this.containerEl.dataset.clear = true
        
        setTimeout(() => {
            this.containerEl.innerHTML = ''
            delete this.containerEl.dataset.clear
        }, 400)
    }

    formatTime(time) {
        if (time == '0' || time == '00:00:00') return '00:00<small>.0</small>'
        if (time[1] == '0') return `${time.substring(3, 8)}<small>.${time[9] ?? '0'}</small>`

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