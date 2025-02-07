// hooks/useChat.ts
import { useState } from 'react';

interface Request {
  id: string;
  senderName: string;
  status: string;
}

interface Message {
    senderId: string;
    receiverId: string;
    message: string;
}
  
interface UserInfo {
    [key: string]: string; 
}


export const useChat = (userId: string, socket: any) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userNames, setUserNames] = useState<UserInfo>({});

  const fetchUserName = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserNames(prev => ({
          ...prev,
          [userId]: data.name
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar nome do usuário:", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch("http://localhost:8080/users/contacts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao buscar contatos");
      }
  
      const jsonData = await response.json();
      setContacts(jsonData.contacts);
  
      const requestResponse = await fetch("http://localhost:8080/users/requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!requestResponse.ok) {
        const requestErrorData = await requestResponse.text();
        throw new Error(requestErrorData || "Erro ao buscar solicitações");
      }
  
      const requestJsonData = await requestResponse.json();
      setRequests(requestJsonData.requests);

      const pendingRequests = requestJsonData.requests.filter(
        (request: Request) => request.status === "pendente"
      );
      setPendingRequestsCount(pendingRequests.length);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/chat/messages/${userId}/${contactId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar mensagens");
        }

        const data = await response.json();
        setMessages(data);

        const uniqueUserIds = [...new Set(data.map((msg: Message) => msg.senderId))] as string[];
            uniqueUserIds.forEach((id: string) => {
            fetchUserName(id);
        });

        socket?.emit("join", { userId, contactId });
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  return {
    contacts,
    requests,
    setRequests,
    pendingRequestsCount,
    messages,
    setMessages,
    fetchContacts,
    fetchMessages,
    userNames,
    fetchUserName
  };
};
