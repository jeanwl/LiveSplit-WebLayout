import { reactive, html } from 'https://esm.sh/@arrow-js/core'

export const timer = reactive({})
export const run = reactive({})
export const currentSegment = reactive({
    name: 'Name',
    time: '0'
})
export const completedSegments = reactive({
    items: []
})

const init = () => {
    html`
        <div class="wrapper">
            ${render}
        </div>
    `(document.body)
}

const render = () => {
    if (!timer.connected) {
        return html`
            <div class="connecting">
                <div class="text">Connecting to LiveSplit WebSocket Server...</div>
            </div>
        `
    }

    return html`
        <div class="timer"
            data-ended="${() => run.ended}">
            
            <div class="completed-segments">
                ${renderCompletedSegments}
            </div>
            ${renderCurrentSegment}
            ${renderRun}
        </div>
    `
}

const renderCompletedSegments = () => {
    return completedSegments.items.map(segment => {
        return html`
            <div class="segment"
                data-pace="${segment.pace}">
                
                <div class="row">
                    <div class="text">${segment.name}</div>
                    <div class="segment-comparison">${segment.comparison}</div>
                </div>
            </div>
        `
    })
}

const renderCurrentSegment = () => {
    if (!run.started) return ''

    if (!run.hasComparison) {
        return html`
            <div class="current-segment"
                data-fading="${() => currentSegment.fading}">
                
                <div class="text">${() => currentSegment.name}</div>
                <div>${() => currentSegment.time}</div>
            </div>
        `
    }

    return html`
        <div class="current-segment"
            data-fading="${() => currentSegment.fading}"
            data-pace="${() => currentSegment.pace}"
            data-is-behind-best="${() => currentSegment.isBehindBest}">
            
            <div class="row">
                <div class="text">${() => currentSegment.name}</div>
                <div class="segment-comparison">${() => currentSegment.comparison}</div>
            </div>

            <div class="row">
                <div>${() => currentSegment.time}</div>
                <div class="best-segment-time">${() => currentSegment.bestTime}</div>
            </div>

            <div class="progress-bar segment-progress-bar"
                style="${() => `--progress: ${currentSegment.progress}`}">
            </div>
        </div>
    `
}

const renderRun = () => {
    if (!run.hasComparison) {
        return html`
            <div class="run">
                <div class="run-time">${() => run.time}</div>
            </div>
        `
    }

    return html`
        <div class="run"
            data-pace="${() => run.pace}">
            
            <div class="row">
                <div class="run-time">${() => run.time}</div>
                <div>${() => run.bestTime}</div>
            </div>

            <div class="progress-bar run-progress-bar"
                style="${() => `--progress: ${run.progress}`}">
            </div>

            <div class="row">
                <div class="text">Best Possible</div>
                <div>${() => run.bestPossibleTime}</div>
            </div>
        </div>
    `
}

init()