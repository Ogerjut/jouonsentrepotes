import 'dotenv/config'; 
import express from 'express';
import { handler } from './build/handler.js';
import { Server } from 'socket.io';
import http from 'http';
import socketController from './src/lib/server/socketController.js'
// import type { Server as HTTPServer } from 'http';

console.log("NODE_ENV =", process.env.NODE_ENV);
console.log('🌍 ORIGIN utilisée :', process.env.ORIGIN);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
        origin: process.env.ORIGIN || "http://localhost:5173" ,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

socketController(io)

app.use(handler);

const port = 3000;
server.listen(port, () => {
    console.log(`✅ Serveur HTTP / WS en écoute sur http://localhost:${port}`); 
});