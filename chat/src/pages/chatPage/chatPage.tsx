import { useEffect, useState } from "react";

import { Nav } from "../../components/Nav/nav";
import { RequestModal } from "../../components/modal/requestModal/requestModal";
import { ProfileModal } from "../../components/modal/perfilModal/perfilModal";
import { useScrollToBottom } from "../../hooks/useScrollToBottom";
import { ContactList } from "../../components/ContactList/ContactList";
import { useModalControl } from "../../hooks/useModalControl";
import { useRequestHandlers } from "../../hooks/useRequestHandlers";
import { useAuth } from "../../hooks/useAuth";
import { useFilteredContacts } from "../../hooks/useFilteredContacts";
import { useContactRequests } from "../../hooks/useContactRequests";
import { useMessageHandlers } from "../../hooks/useMessageHandlers";
import { useChat } from "../../hooks/useChat";

import io from "socket.io-client";
import "./chatPage.css";

interface Message {
  senderId: string;
  receiverId: string;
  message: string;
}

const ChatPage = () => {

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [socket, setSocket] = useState<any>(null);
  const [selectedContactName, setSelectedContactName] = useState<string>("");
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const { 
    showRequest, 
    showPerfil, 
    handleShowwRequests, 
    handleShowPerfil 
  } = useModalControl();

  const { 
    contacts,
    requests,
    setRequests,
    pendingRequestsCount,
    userNames,
    messages,
    setMessages,
    fetchContacts,
    fetchMessages, 
  } = useChat(userId, socket);
  
  const { message, setMessage, sendMessage } = useMessageHandlers(socket, userId);
  const { sendRequest } = useContactRequests();
  const filteredContacts = useFilteredContacts(contacts, searchTerm);
  const { handleLogout } = useAuth();
  const { messagesEndRef } = useScrollToBottom(messages);
  const { handleAcceptRequest, handleRejectRequest } = useRequestHandlers(setRequests);

  useEffect(() => {
    if (!socket) {
      console.error("⚠️ Erro: Socket não está definido!");
      return;
    }

    const handleConnect = () => {
      console.log("✅ Conectado ao servidor WebSocket:", socket.id);
    };

    const handleDisconnect = () => {
      console.log("❌ Desconectado do servidor WebSocket!");
    };

    const handleMessage = (newMessage: Message) => {
      console.log("📥 Mensagem recebida:", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("message", handleMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("message", handleMessage);
      socket.disconnect();
    };
  }, [setMessages]); 

  useEffect(() => {
    if (showRequest) {
      document.querySelector(".requestsModal")?.classList.add("show");
    } else {
      document.querySelector(".requestsModal")?.classList.remove("show");
    }
  
    if (showPerfil) {
      document.querySelector(".PerfilModal")?.classList.add("show");
    } else {
      document.querySelector(".PerfilModal")?.classList.remove("show");
    }
  }, [showRequest, showPerfil]);

  useEffect(() => {
    if (!socket) {
      const newSocket = io("http://localhost:8080");
      setSocket(newSocket);
    }
  
    return () => {
      socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8080/users/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          setUserName(data.name);
          setUserId(data.id);

          socket.emit("join", { userId: data.id, room: data.id });
        })
        .catch((error) => console.error("Erro ao buscar usuário:", error));
    }
  }, [socket]);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!socket) return; 
    socket.on("receiveMessage", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  
    return () => {
      socket.off("receiveMessage");
    };
  }, [socket]);

  return (
    <section className="containerChat">

      <Nav 
        handleShowPerfil={handleShowPerfil}
        pendingRequestsCount={pendingRequestsCount}
        handleShowwRequests={handleShowwRequests}
        searchTerm={searchTerm}
        sendRequest={sendRequest}
        setSearchTerm={setSearchTerm}
      />  

      <RequestModal 
        show={showRequest}
        requests={requests}
        handleAcceptRequest={handleAcceptRequest}
        handleRejectRequest={handleRejectRequest}
      />

      <ProfileModal 
        show={showPerfil}
        userName={userName}
        userId={userId}
        handleLogout={handleLogout}
      />

      <main>
        <ContactList 
          filteredContacts={filteredContacts}
          setSelectedChat={setSelectedChat}
          fetchMessages={fetchMessages}
          setSelectedContactName={setSelectedContactName}
        />

        <div className={selectedChat ? "divAtivada" :"divConversa"}>
          {selectedChat ? (
            <div className="chatBox">
               <div className="messagesContainer">
               {messages.map((msg) => (
                  userId !== msg.senderId ?
                  <div className="messageDir">
                    <div className="nameuserDir">
                      <strong>{selectedContactName}</strong> 
                    </div>
                    <p>{msg.message}</p>
                    <div className="trianguloDir"></div>
                  </div>
                  :
                  <div className="message">
                    <div className="nameuser">
                      <strong>{userName}</strong>
                    </div>
                    <p>{msg.message}</p>
                    <div className="triangulo"></div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="enviarMensagem">
                <input 
                  type="text" 
                  placeholder="Digite sua mensagem..." 
                  className="inputMensagem" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button 
                  className="btnEnviar"
                  onClick={() => sendMessage(selectedChat)}
                >
                  <img src="/arrow.svg" alt="" height={20} width={20}/>
                </button>
              </div>
            </div>
          ) : (
            <>
              <img src="/chatIcon.svg" alt="Ícone de chat" />
              <p>Clique em alguma mensagem para começar a conversar...</p>
            </>
          )}
        </div>
      </main>
    </section>
  );
};

export default ChatPage;
