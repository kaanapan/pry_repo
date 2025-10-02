import { io } from 'socket.io-client'
const baseUrl = (import.meta.env.VITE_SERVER_URL as string) || window.location.origin
export const socket = io(baseUrl, { autoConnect: true })


