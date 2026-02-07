import { io } from 'socket.io-client'
import API from './api'

let socket = null
const pending = new Map()

export const getSocket = () => socket

export function connectSocket() {
  if (socket && socket.connected) return socket
  socket = io(API.HOST, {
    withCredentials: true,
    autoConnect: true,
    transports: ['websocket']
  })
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
    pending.clear()
  }
}

function makeReqId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function emitAsync(event, payload = {}) {
  if (!socket || !socket.connected) return Promise.reject(new Error('socket not connected'))
  const reqId = payload.reqId || makeReqId()
  const respEvent = `${event}:result`
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(respEvent, handler)
      pending.delete(reqId)
      reject(new Error('timeout'))
    }, 10000)

    const handler = (resp) => {
      if (!resp || resp.reqId !== reqId) return
      clearTimeout(timeout)
      socket.off(respEvent, handler)
      pending.delete(reqId)
      if (resp.ok) resolve(resp.data)
      else reject(new Error(resp.error || 'Erro'))
    }

    pending.set(reqId, { resolve, reject, timeout })
    socket.on(respEvent, handler)
    socket.emit(event, { ...payload, reqId })
  })
}
