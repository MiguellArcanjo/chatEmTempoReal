import { useState } from 'react';

export const useMessageHandlers = (socket: any, userId: string) => {
  const [message, setMessage] = useState("");

  const sendMessage = async (selectedChat: string | null) => {
    if (socket && message.trim() !== "" && selectedChat) {
      const newMessage = {
        senderId: userId,
        receiverId: selectedChat,
        message: message,
      };

      const token = localStorage.getItem("token");

      socket.emit("sendMessage", newMessage);

      try {
        const response = await fetch("http://localhost:8080/chat/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newMessage)
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Erro ao salvar mensagem:", data.error);
        }
      } catch (error) {
        console.error("Erro ao conectar com a API:", error);
      }

      setMessage("");
    }
  };

  return {
    message,
    setMessage,
    sendMessage
  };
};
