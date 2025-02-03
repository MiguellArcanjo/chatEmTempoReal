import { io } from "../config/instance.js";

io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    socket.on("entrar_na_sala", (room) => {
        socket.join(room);
        console.log(`Usuário ${socket.id} entrou na sala ${room}`);
    });

    socket.on("mensagem", ({ room, senderId, receiverId, message }) => {
        console.log(`Mensagem de ${senderId} para ${receiverId} na sala ${room}:`, message);
        io.to(room).emit("mensagem", { senderId, message, timestamp: new Date().toISOString() });
    });

    socket.on("sair_da_sala", (room) => {
        socket.leave(room);
        console.log(`Usuário ${socket.id} saiu da sala ${room}`);
    });

    socket.on("disconnect", () => {
        console.log("Usuário desconectado:", socket.id);
    });
});
