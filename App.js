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
            if (this.prevTimerPhase == 'NotRunning') {
                this.deltaShowing = false
                this.prevSplitIndex = 0

                await this.newSplit(0)
            }

            const time = await this.client.getResponse('getcurrenttime')

            this.timer.updateTime(time)

            const splitIndex = await this.client.getResponse('getsplitindex')

            if (splitIndex > this.prevSplitIndex) {
                const prevSplitDelta = await this.client.getResponse('getdelta')

                this.timer.updateDelta(prevSplitDelta, time < this.splitBestPossibleTime)
                this.timer.showDelta()
                this.timer.settleSplit()
                
                await this.newSplit(splitIndex)

                this.prevSplitIndex = splitIndex
            }
            if (this.deltaShowing) {
                const delta = this.subtractTimeStrings(time, this.splitTime)
                this.timer.updateDelta(delta, false)
            }
            else if (time >= this.splitBestPossibleTime || time > this.splitTime) {
                const delta = this.subtractTimeStrings(time, this.splitTime)
                this.timer.updateDelta(delta, false)
                this.timer.showDelta()

                this.deltaShowing = true
            }
        }
        else if (timerPhase == 'Ended') {
            const finalTime = await this.client.getResponse('getfinaltime')

            this.timer.updateTime(finalTime)

            const prevSplitDelta = await this.client.getResponse('getdelta')
            
            this.timer.updateDelta(prevSplitDelta, finalTime < this.splitBestPossibleTime)
            this.timer.showDelta()
            this.timer.settleSplit()
        }
        else if (timerPhase == 'NotRunning' && this.prevTimerPhase != 'NotRunning') {
            this.timer.clearSplits()
            this.timer.updateTime(0)
        }

        this.prevTimerPhase = timerPhase

        setTimeout(() => this.update(), 50)
    }

    async newSplit(index) {
        const splitName = await this.client.getResponse('getcurrentsplitname')
        const splitTime = this.splitTime = await this.client.getResponse('getcomparisonsplittime')

        const splitBestTime = await this.client.getResponse('getcomparisonsplittime Best Segments')

        if (index == 0) {
            this.splitBestPossibleTime = splitBestTime
        }
        else {
            const lastSplitTime = await this.client.getResponse('getlastsplittime')
            const splitBestSegment = this.subtractTimeStrings(splitBestTime, this.prevSplitBestTime)
            
            this.splitBestPossibleTime = this.addTimeStrings(lastSplitTime, splitBestSegment)
        }

        this.timer.addSplit(splitName, splitTime, Number(index))

        this.deltaShowing = false
        this.prevSplitBestTime = splitBestTime
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