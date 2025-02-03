import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

type Message = {
    id: number;
    text: string;
};
  

const useChat = (room) => {
    
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        socket.emit("entrar_na_sala", room);

        socket.on("mensagem", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.emit("sair_da_sala", room);
            socket.off("mensagem");
        };
    }, [room]);

    const sendMessage = (senderId, receiverId, message) => {
        socket.emit("mensagem", { room, senderId, receiverId, message });
    };

    return { messages, sendMessage };
};

export default useChat;
