import { connected, attemptConnect, getResponse } from './client.js'
import { data as timer } from './timer.js'
import { timeToMs, msToTime, formatTime, formatDelta, sleep } from './utils.js'

let prevRunBestTime, runBestTime
let prevTimerPhase
let hasComparison
let prevSplitIndex, splitIndex
let splitName
let splitTime
let splitBestTime
let splitBestPossibleTime
let segmentBestTime
let lastSplitTime

const init = async () => {
    do {
        if (!connected) {
            timer.connected = false
            
            attemptConnect()
    
            await sleep(1000)
            continue
        }
    
        const timerPhase = await getResponse('getcurrenttimerphase')

        if (timerPhase == 'NotRunning') {
            runBestTime = await getResponse('getfinaltime')
        
            if (prevRunBestTime != runBestTime) await loadNewRun()
        
            prevRunBestTime = runBestTime
        }
    
        switch (timerPhase) {
            case 'Running':
                if (prevTimerPhase == 'NotRunning') await startRun()
                await updateRun()
                break
            case 'NotRunning':
                if (prevTimerPhase != 'NotRunning') await resetRun()
                break
            case 'Ended':
                if (prevTimerPhase != 'Ended') await endRun()
                break
        }

        prevTimerPhase = timerPhase
        
        timer.connected = true
    
        await sleep(50)
    } while (true)
}

const loadNewRun = async () => {
    timer.hasComparison = hasComparison = runBestTime != '-'

    if (!hasComparison) return

    const runBestPossibleTime = await getResponse('getbestpossibletime')

    timer.runBestTime = formatTime(runBestTime)
    timer.runBestPossibleTime = formatTime(runBestPossibleTime)
}

const startRun = async () => {
    splitIndex = 0

    await newSplit()
    await updateRun()

    timer.running = true
}

const updateRun = async () => {
    splitIndex = +(await getResponse('getsplitindex'))
    
    if (splitIndex > prevSplitIndex) await newSplit()

    const time = await getResponse('getcurrenttime')

    const segmentTime = splitIndex == 0
        ? time
        : msToTime(timeToMs(time) - timeToMs(lastSplitTime))

    timer.runTime = formatTime(time)
    timer.currentSegmentTime = formatTime(segmentTime)

    if (!hasComparison) return
    
    if (time > runBestTime) timer.runProgress = 1
    else {
        const runProgress = timeToMs(time) / timeToMs(runBestTime)

        timer.runProgress = runProgress.toFixed(4)
    }

    const isSegmentBehindBest = segmentTime > segmentBestTime

    if (isSegmentBehindBest) timer.currentSegmentProgress = 1
    else {
        const segmentProgress = timeToMs(segmentTime) / timeToMs(segmentBestTime)
        
        timer.currentSegmentProgress = segmentProgress.toFixed(4)
    }

    timer.currentSegmentIsBehind = isSegmentBehindBest

    if (!isSegmentBehindBest && time < splitTime) return

    const delta = msToTime(timeToMs(time) - timeToMs(splitTime))

    timer.currentSegmentComparison = formatDelta(delta)

    const runBestPossibleTime = await getResponse('getbestpossibletime')
    
    timer.runBestPossibleTime = formatTime(runBestPossibleTime)
    
    if (delta.startsWith('-')) return

    timer.currentSegmentPace = timer.runPace = 'behind'
}

const newSplit = async () => {
    prevSplitIndex = splitIndex

    if (splitIndex > 0) await settleSplit()

    splitName = await getResponse('getcurrentsplitname')

    if (!hasComparison) return timer.currentSegmentName = splitName

    timer.currentSegmentIsBehind = false
    timer.currentSegmentPace = ''

    splitTime = await getResponse('getcomparisonsplittime')

    const prevSplitBestTime = splitBestTime
    
    splitBestTime = await getResponse('getcomparisonsplittime Best Segments')

    if (splitIndex == 0) segmentBestTime = splitBestPossibleTime = splitBestTime
    else {
        segmentBestTime = msToTime(timeToMs(splitBestTime) - timeToMs(prevSplitBestTime))
        splitBestPossibleTime = msToTime(timeToMs(lastSplitTime) + timeToMs(segmentBestTime))
    }

    timer.currentSegmentName = splitName
    timer.currentSegmentComparison = formatTime(splitTime)
    timer.currentSegmentBestTime = formatTime(segmentBestTime)
}

const settleSplit = async () => {
    lastSplitTime = await getResponse('getlastsplittime')

    if (!hasComparison) {
        const segment = { name: splitName, comparison: formatTime(lastSplitTime) }
        
        return timer.completedSegments.push(segment)
    }

    const delta = await getResponse('getdelta')
    const isBest = lastSplitTime < splitBestPossibleTime

    if (isBest) {
        const runBestPossibleTime = await getResponse('getbestpossibletime')

        timer.runBestPossibleTime = formatTime(runBestPossibleTime)
    }

    timer.runPace = delta.startsWith('-') ? 'ahead' : ''

    const pace = isBest ? 'best' : delta.startsWith('-') ? 'ahead' : 'behind'
    const segment = { name: splitName, comparison: formatDelta(delta), pace }

    timer.completedSegments.push(segment)
}

const resetRun = async () => {
    timer.running = false
    timer.ended = false
    timer.runTime = formatTime(msToTime(0))
    timer.runProgress = 0
    timer.runPace = ''
    timer.completedSegments.splice(0)
    
    const runBestPossibleTime = await getResponse('getbestpossibletime')
        
    timer.runBestPossibleTime = formatTime(runBestPossibleTime)
}

const endRun = async () => {
    await settleSplit()

    timer.running = false
    timer.ended = true
}

init()