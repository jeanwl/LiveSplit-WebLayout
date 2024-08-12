class Client {
    url = 'ws://localhost:16834/livesplit'
    connected = false

    attemptConnect() {
        this.socket = new WebSocket(this.url)
        window.socket = this.socket

        this.socket.onopen = () => this.onOpen()

        this.socket.onerror = () => {
            this.connected = false

            this.socket.close()
        }
    }

    onOpen() {
        this.connected = true

        this.socket.onmessage = (event) => this.onMessage(event)

        this.socket.onclose = () => {
            this.connected = false
        }
    }

    onMessage(event) {
        this.resolve(event.data)
        this.resolve = null
    }

    async getResponse(command) {
        this.socket.send(command)

        return await new Promise(r => this.resolve = r)
    }
}