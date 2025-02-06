import { io } from '../config/instance.js';
import fs from "node:fs";
import { wrtieFile } from '../utils/file.js';

const users = {};
const rooms = {};

io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);


    socket.on("join", ({ userId, contactId }) => {
        const roomName = [userId, contactId].sort().join("-"); // Criar nome único para a sala
        users[userId] = socket.id;
        rooms[userId] = roomName;
        socket.join(roomName);
        console.log(`✅ Usuário ${userId} entrou na sala ${roomName}`);
    });
    

    socket.on("sendMessage", (data) => {
        console.log("📩 Dados recebidos:", data);
        const { senderId, receiverId, message } = data;
    
        if (!senderId || !receiverId) {
            console.log(`❌ Erro: senderId (${senderId}) ou receiverId (${receiverId}) indefinido.`);
            return;
        }
    
        const roomName = [senderId, receiverId].sort().join("-"); // Garantir a mesma sala
        console.log(`📤 Enviando mensagem para a sala ${roomName}`);
    
        io.to(roomName).emit("receiveMessage", { senderId, message });
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