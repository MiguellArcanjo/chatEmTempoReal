import { io } from '../config/instance.js';
import fs from "node:fs";
import { wrtieFile } from '../utils/file.js';


const DB_PATH = '../db.json';
const users = {};
const rooms = {};

io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);


    socket.on('join', ({ userId, room }) => {
        users[userId] = socket.id;  
        rooms[userId] = room;
        socket.join(room);
        console.log(`✅ Usuário ${userId} entrou na sala ${room}.`);
    });

    socket.on('sendMessage', (data) => {
        console.log("📩 Dados recebidos:", data);
        const { senderId, receiverId, message } = data;
    
        if (!data?.senderId || !data?.receiverId) {
            console.log(`❌ Erro no backend: senderId (${data?.senderId}) ou receiverId (${data?.receiverId}) está indefinido.`);
            return;
        }
    
        const receiverRoom = rooms[data.receiverId];
    
        if (!receiverRoom) {
            console.log(`❌ Erro: Usuário ${data.receiverId} não está em nenhuma sala.`);
            return;
        }
    
        io.to(receiverRoom).emit('receiveMessage', { senderId, message });
    });
    
    socket.on('disconnect', () => {
        const userId = Object.keys(users).find(key => users[key] === socket.id);
        if (userId) {
            delete users[userId];
            delete rooms[userId];
        }
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});

export default io;