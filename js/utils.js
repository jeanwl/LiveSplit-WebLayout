export const timeToMs = time => {
    const [hours, minutes, seconds, fraction] = time.split(/[:.]/)
    const ms = +(fraction?.slice(0, 3) ?? 0)

    return hours * 36e5 + minutes * 6e4 + seconds * 1e3 + ms
}

export const msToTime = ms => {
    const sign = ms < 0 ? '-' : ''

    ms = Math.abs(ms)

    const hh = `${~~(ms / 36e5)}`.padStart(2, '0')
    ms %= 36e5

    const mm = `${~~(ms / 6e4)}`.padStart(2, '0')
    ms %= 6e4

    const ss = `${~~(ms / 1e3)}`.padStart(2, '0')
    const fff = `${ms % 1e3}`.padStart(3, '0')

    return `${sign}${hh}:${mm}:${ss}.${fff}`
}

export const formatTime = time => {
    const [hours, minutes, seconds] = time.split(/[:.]/)

    if (hours > 0) return `${+hours}:${minutes}:${seconds}`
    if (minutes > 0) return `${+minutes}:${seconds}`
    
    return `0:${seconds}`
}

export const formatDelta = delta => {
    const sign = delta.startsWith('-') ? '-' : '+'

    if (sign == '-') delta = delta.slice(1)

    const [hours, minutes, seconds, fraction] = delta.split(/[:.]/)

    if (hours > 0) return `${sign} ${+hours}:${minutes}:${seconds}`
    if (minutes > 0) return `${sign} ${+minutes}:${seconds}`
    
    return `${sign} ${+seconds}.${fraction.slice(0, 1)}`
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))