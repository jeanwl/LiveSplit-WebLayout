class App {
    client = new Client()
    timer = new Timer()

    async update() {
        const connected = this.client.connected

        if (connected != this.wasConnected) {
            document.body.dataset.connected = connected
        }

        this.wasConnected = connected
        
        if (!connected) {
            this.client.attemptConnect()

            return setTimeout(() => this.update(), 1000)
        }

        const timerPhase = await this.client.getResponse('getcurrenttimerphase')

        if (timerPhase == 'Running') {
            this.time = await this.client.getResponse('getcurrenttime')

            this.timer.updateTime(this.time)

            this.splitIndex = Number(await this.client.getResponse('getsplitindex'))
            
            if (this.prevTimerPhase == 'NotRunning' || this.splitIndex > this.prevSplitIndex) {
                await this.newSplit(this.splitIndex)
            }

            this.updateDelta()
        }
        else if (timerPhase == 'Ended') {
            this.time = await this.client.getResponse('getcurrenttime')

            this.timer.updateTime(this.time)

            await this.settleSplit()
        }
        else if (timerPhase == 'NotRunning' && this.prevTimerPhase != 'NotRunning') {
            this.timer.clearSplits()
            this.timer.updateTime(0)
        }

        this.prevTimerPhase = timerPhase

        setTimeout(() => this.update(), 50)
    }

    async newSplit() {
        if (this.splitIndex > 0) await this.settleSplit()

        const splitName = await this.client.getResponse('getcurrentsplitname')
        const splitTime = this.splitTime = await this.client.getResponse('getcomparisonsplittime')

        this.splitHasTime = splitTime != '-'

        this.splitBestPossibleTime = await this.getSplitBestPossibleTime()

        this.timer.addSplit(splitName, splitTime, this.splitIndex, this.splitHasTime)

        this.deltaShowing = false
        this.prevSplitIndex = this.splitIndex
        this.prevSplitBestTime = this.splitBestPossibleTime
    }

    async settleSplit() {
        this.lastSplitTime = await this.client.getResponse('getlastsplittime')

        if (this.splitHasTime) {
            const delta = await this.client.getResponse('getdelta')
            const isBest = this.time < this.splitBestPossibleTime
    
            if (isBest) this.timer.showDelta()
    
            this.timer.updateDelta(delta, isBest)
        }
        
        this.timer.updateSplitTime(this.lastSplitTime)
    }

    async getSplitBestPossibleTime() {
        if (!this.splitHasTime) return
        
        const splitBestTime = await this.client.getResponse('getcomparisonsplittime Best Segments')

        if (this.splitIndex == 0) return splitBestTime
    
        const splitBestSegment = this.subtractTimeStrings(splitBestTime, this.prevSplitBestTime)
        // const splitBestSegment = this.nsToTime(this.timeToNs(splitBestTime) - this.timeToNs(this.prevSplitBestTime))

        return this.addTimeStrings(this.lastSplitTime, splitBestSegment)
    }

    updateDelta() {
        if (!this.splitHasTime) return
        
        if (this.deltaShowing) {
            const delta = this.subtractTimeStrings(this.time, this.splitTime)
            
            return this.timer.updateDelta(delta, false)
        }
        
        if (this.time >= this.splitBestPossibleTime || this.time > this.splitTime) {
            const delta = this.subtractTimeStrings(this.time, this.splitTime)
            
            this.timer.updateDelta(delta, false)
            this.timer.showDelta()

            this.deltaShowing = true
        }
    }

    addTimeStrings(time1, time2) {
        const time1Millis = this.timeStringToMilliseconds(time1)
        const time2Millis = this.timeStringToMilliseconds(time2)
    
        return this.millisecondsToTimeString(time1Millis + time2Millis)
    }

    subtractTimeStrings(time1, time2) {
        const time1Millis = this.timeStringToMilliseconds(time1)
        const time2Millis = this.timeStringToMilliseconds(time2)
    
        const differenceMillis = time1Millis - time2Millis
    
        const isNegative = differenceMillis < 0
        const absDifferenceMillis = Math.abs(differenceMillis)
        const differenceTimeString = this.millisecondsToTimeString(absDifferenceMillis)
    
        return  `${isNegative ? '-' : ''}${differenceTimeString}`
    }

    timeStringToMilliseconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(':')
        let [wholeSeconds, tenthsOfSecond = '0'] = seconds.split('.')
        
        tenthsOfSecond = tenthsOfSecond.charAt(0)
    
        return (
            Number(hours) * 3600000 +
            Number(minutes) * 60000 +
            Number(wholeSeconds) * 1000 +
            Number(tenthsOfSecond) * 100
        )
    }

    millisecondsToTimeString(milliseconds) {
        const hours = String(Math.floor(milliseconds / 3600000)).padStart(2, '0')
        milliseconds %= 3600000
        const minutes = String(Math.floor(milliseconds / 60000)).padStart(2, '0')
        milliseconds %= 60000
        const seconds = String(Math.floor(milliseconds / 1000)).padStart(2, '0')
        
        const tenthsOfSecond = String(Math.floor((milliseconds % 1000) / 100))
        
        return `${hours}:${minutes}:${seconds}.${tenthsOfSecond}`
    }
}

new App().update()