import { io } from 'socket.io-client'

// One shared connection for the whole app.
// In development the Vite proxy forwards /socket.io to the Express server,
// so no URL is needed. For a separate deployment set VITE_SOCKET_URL.
export const socket = io(import.meta.env.VITE_SOCKET_URL || undefined, {
  autoConnect: false,
  withCredentials: true
})

// Several components can use the socket at the same time.
// The connection opens with the first user and closes when the last one leaves.
let activeUsers = 0

export function acquireSocket() {
  activeUsers += 1

  if (activeUsers === 1) {
    socket.connect()
  }

  let released = false

  return function release() {
    if (released) {
      return
    }

    released = true
    activeUsers -= 1

    if (activeUsers === 0) {
      socket.disconnect()
    }
  }
}
