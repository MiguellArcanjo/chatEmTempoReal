import { io } from "../config/instance.js";

io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    socket.on("entrar_na_sala", (room) => {
        socket.join(room);
        console.log(`Usuário ${socket.id} entrou na sala ${room}`);
    });

    socket.on("mensagem", ({ room, mensagem }) => {
        console.log(`Mensagem para a sala ${room}:`, mensagem);

        io.to(room).emit("mensagem", { mensagem, id: socket.id })
    })

    socket.on("sair_da_sala", (room) => {
        socket.leave(room);
        console.log(`Usuário ${socket.id} saiu da sala ${room}`)
    });

    socket.on("disconnect", () => {
        console.log("Usuário desconectado:", socket.id);
    });
});