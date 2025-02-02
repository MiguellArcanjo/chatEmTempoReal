import { Server } from 'socket.io';  
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';  

export const app = express();

app.use(cors());
app.use(express.json());

export const server = createServer(app);  

// Iniciando o Socket.IO
export const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'], 
    }
});
