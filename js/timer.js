import { reactive, html } from 'https://esm.sh/@arrow-js/core'

export const data = reactive({
    completedSegments: [],
})

const init = () => {
    html`
        <div class="wrapper">
            ${render}
        </div>
    `(document.body)
}

const render = () => {
    if (!data.connected) {
        return html`
            <div class="connecting">
                <div class="text">Connecting to LiveSplit WebSocket Server...</div>
            </div>
        `
    }

    return html`
        <div class="timer"
            data-ended="${() => data.ended}">
            
            <div class="completed-segments">
                ${renderCompletedSegments}
            </div>
            ${renderCurrentSegment}
            ${renderRun}
        </div>
    `
}

const renderCompletedSegments = () => {
    return data.completedSegments.map(segment => {
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
    if (!data.running) return ''

    if (!data.hasComparison) {
        return html`
            <div class="current-segment">
                <div class="text">${() => data.currentSegmentName}</div>
                <div>${() => data.currentSegmentTime}</div>
            </div>
        `
    }

    return html`
        <div class="current-segment"
            data-pace="${() => data.currentSegmentPace}"
            data-is-behind="${() => data.currentSegmentIsBehind}">
            
            <div class="row">
                <div class="text">${() => data.currentSegmentName}</div>
                <div class="segment-comparison">${() => data.currentSegmentComparison}</div>
            </div>

            <div class="row">
                <div>${() => data.currentSegmentTime}</div>
                <div class="best-segment-time">${() => data.currentSegmentBestTime}</div>
            </div>

            <div class="progress-bar segment-progress-bar"
                style="${() => `--progress: ${data.currentSegmentProgress}`}">
            </div>
        </div>
    `
}

const renderRun = () => {
    if (!data.hasComparison) {
        return html`
            <div class="run">
                <div class="run-time">${() => data.runTime}</div>
            </div>
        `
    }

    return html`
        <div class="run"
            data-pace="${() => data.runPace}">
            
            <div class="row">
                <div class="run-time">${() => data.runTime}</div>
                <div>${() => data.runBestTime}</div>
            </div>

            <div class="progress-bar run-progress-bar"
                style="${() => `--progress: ${data.runProgress}`}">
            </div>

            <div class="row">
                <div class="text">Best Possible</div>
                <div>${() => data.runBestPossibleTime}</div>
            </div>
        </div>
    `
}

init()