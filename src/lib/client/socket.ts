import { browser } from "$app/environment";
import { io, Socket } from "socket.io-client";
import { PUBLIC_SOCKET_URL } from "$env/static/public";

import type { ClientToServerEvents, ServerToClientEvents } from "$lib/types/socket";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> 

if (browser) {
    console.log("🔌 Tentative de connexion Socket.io...", PUBLIC_SOCKET_URL)
    socket = io(PUBLIC_SOCKET_URL, {
    path: '/socket.io',
    withCredentials: true,
    transports: ['polling', 'websocket'], 
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});

    socket.on('connect', () => {
        console.log('✅ Socket.io connecté !', socket?.id);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Erreur connexion Socket.io:', error);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.io déconnecté', reason);
        if (reason === "io server disconnect"){
            socket?.connect()
        }
    });
}

export { socket };
export type {Socket}