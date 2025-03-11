const url = 'ws://localhost:16834/livesplit'

let socket

export let connected = false

export const attemptConnect = () => {
    socket = new WebSocket(url)

    socket.onopen = () => connected = true
    
    socket.onclose = () => connected = false

    socket.onerror = () => socket.close()
}

export const getResponse = async (command) => {
    try {
        socket.send(command)

        return await new Promise(resolve => {
            socket.onmessage = e => resolve(e.data)
        })
    } catch (error) {
        console.error(error)
        
        return null
    }
}