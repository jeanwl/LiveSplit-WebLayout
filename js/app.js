import * as client from './client.js'
import * as view from './view.js'
import { timeToMs, msToTime, formatTime, formatDelta, sleep } from './utils.js'

const run = {}
const currentSegment = {}

const rootStyles = getComputedStyle(document.documentElement)
const transitionDuration = parseFloat(rootStyles.getPropertyValue('--transitions'))

const init = async () => {
    let prevTimerPhase

    do {
        if (!client.connected) {
            view.timer.connected = false
            
            client.attemptConnect()
    
            await sleep(1000)
            continue
        }
    
        const timerPhase = await client.getResponse('getcurrenttimerphase')
    
        switch (timerPhase) {
            case 'NotRunning':
                if (prevTimerPhase != 'NotRunning') await resetRun()
                await loadNewRun()
                break
            case 'Running':
                if (prevTimerPhase == 'NotRunning') await startRun()
                await newSplit()
                await updateRun()
                await updateCurrentSegment()
                break
            case 'Ended':
                if (prevTimerPhase != 'Ended') await endRun()
                break
        }

        prevTimerPhase = timerPhase
        
        view.timer.connected = true
    
        await sleep(50)
    } while (true)
}

const resetRun = async () => {
    view.run.started = false
    view.run.ended = false
    view.run.time = formatTime(msToTime(0))
    view.run.progress = 0
    view.run.pace = ''
    view.completedSegments.items.splice(0)
    
    await updateBestPossibleTime()
}

const loadNewRun = async () => {
    const runBestTime = await client.getResponse('getfinaltime')

    if (runBestTime == run.bestTime) return

    run.bestTime = runBestTime

    view.run.hasComparison = run.hasComparison = runBestTime != '-'

    if (!run.hasComparison) return
    
    view.run.bestTime = formatTime(runBestTime)

    await updateBestPossibleTime()
}

const startRun = async () => {
    run.splitIndex = -1

    view.run.started = true
}

const newSplit = async () => {
    const splitIndex = +(await client.getResponse('getsplitindex'))
    
    if (splitIndex == run.splitIndex) return
    
    run.splitIndex = splitIndex

    if (splitIndex > 0) await settleSplit()

    currentSegment.name = await client.getResponse('getcurrentsplitname')

    view.currentSegment.fading = currentSegment.fading = true

    setTimeout(() => {
        view.currentSegment.name = currentSegment.name
        view.currentSegment.fading = currentSegment.fading = false
    }, transitionDuration)

    if (!run.hasComparison) return

    run.nextSplitTime = await client.getResponse('getcomparisonsplittime')
    
    const lastBestSplitTime = run.nextBestSplitTime

    run.nextBestSplitTime = await client.getResponse('getcomparisonsplittime Best Segments')

    currentSegment.bestTime = splitIndex == 0
        ? run.nextBestSplitTime
        : msToTime(timeToMs(run.nextBestSplitTime) - timeToMs(lastBestSplitTime))

    setTimeout(() => {
        view.currentSegment.isBehindBest = false
        view.currentSegment.pace = ''
        view.currentSegment.comparison = formatTime(run.nextSplitTime)
        view.currentSegment.bestTime = formatTime(currentSegment.bestTime)
    }, transitionDuration)
}

const updateRun = async () => {
    const time = run.time = await client.getResponse('getcurrenttime')

    view.run.time = formatTime(time)

    if (!run.hasComparison) return

    if (time > run.bestTime) view.run.progress = 1
    else {
        const progress = timeToMs(time) / timeToMs(run.bestTime)

        view.run.progress = progress.toFixed(4)
    }
}

const updateCurrentSegment = async () => {
    if (currentSegment.fading) return

    const time = run.splitIndex == 0
        ? run.time
        : msToTime(timeToMs(run.time) - timeToMs(run.lastSplitTime))
    
    view.currentSegment.time = formatTime(time)

    if (!run.hasComparison) return

    const isBehindBest = time > currentSegment.bestTime

    view.currentSegment.isBehindBest = isBehindBest

    if (isBehindBest) view.currentSegment.progress = 1
    else {
        const progress = timeToMs(time) / timeToMs(currentSegment.bestTime)
        
        view.currentSegment.progress = progress.toFixed(4)
    }

    if (!isBehindBest && run.time < run.nextSplitTime) return

    const delta = msToTime(timeToMs(run.time) - timeToMs(run.nextSplitTime))

    view.currentSegment.comparison = formatDelta(delta)
    
    if (delta.startsWith('-')) return

    await updateBestPossibleTime()

    view.currentSegment.pace = view.run.pace = 'behind'
}

const settleSplit = async () => {
    const lastSplitTime = run.lastSplitTime = await client.getResponse('getlastsplittime')

    if (!run.hasComparison) {
        const segment = { name: currentSegment.name, comparison: formatTime(lastSplitTime) }
        
        return view.completedSegments.items.push(segment)
    }

    const delta = await client.getResponse('getdelta')

    const bestPossibleSplitTime = run.splitIndex == 0
        ? run.nextBestSplitTime
        : msToTime(timeToMs(lastSplitTime) + timeToMs(currentSegment.bestTime))

    const isBest = lastSplitTime < bestPossibleSplitTime

    if (isBest) await updateBestPossibleTime()

    view.run.pace = delta.startsWith('-') ? 'ahead' : ''

    const pace = isBest ? 'best' : delta.startsWith('-') ? 'ahead' : 'behind'
    const segment = { name: currentSegment.name, comparison: formatDelta(delta), pace }

    view.completedSegments.items.push(segment)
}

const endRun = async () => {
    await settleSplit()

    view.run.started = false
    view.run.ended = true
}

const updateBestPossibleTime = async () => {
    const runBestPossibleTime = await client.getResponse('getbestpossibletime')
        
    view.run.bestPossibleTime = formatTime(runBestPossibleTime)
}

init()