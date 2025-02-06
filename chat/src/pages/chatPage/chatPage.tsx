import { useEffect, useState } from "react";
import Card from "../../components/card/card";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./chatPage.css";

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

const ChatPage = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [showRequest, setShowRequests] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<any>(null);

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

    // Escutar eventos
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
    if (!socket) {
      const newSocket = io("http://localhost:8080");
      setSocket(newSocket);
    }
  
    return () => {
      socket?.disconnect();
    };
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`http://localhost:8080/chat/${userId}/messages/${contactId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Erro ao buscar mensagens");
      }
  
      const data = await response.json();
      setMessages(data.messages);
  
      // Entrar na sala do contato
      socket.emit("join", { userId, room: `room-${contactId}` });
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };


  const sendRequest = async (contactId: string) => {
    console.log("Enviando solicitação para o ID:", contactId); // Debug
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch("http://localhost:8080/users/sendRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contactId }),
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao enviar solicitação");
      }
  
      alert("Solicitação enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      alert(error);
    }
  };

  const handleShowwRequests = () => {
    setShowPerfil(false);
    setShowRequests(!showRequest);
  };

  const handleShowPerfil = () => {
    setShowRequests(false);
    setShowPerfil(!showPerfil);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:8080/users/acceptRequest/${requestId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao aceitar solicitação");
      }

      setRequests(requests.filter(request => request.id !== requestId));
      alert("Solicitação aceita com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao aceitar solicitação", error);
      alert(error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`http://localhost:8080/users/rejectRequest/${requestId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao recusar solicitação");
      }

      setRequests(requests.filter(request => request.id !== requestId));
      alert("Solicitação recusada com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao recusar solicitação:", error);
      alert(error);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const sendMessage = () => {
    if (socket && message.trim() !== "" && selectedChat) {
      const newMessage = {
        senderId: userId,
        receiverId: selectedChat,
        message: message,
      };

      socket.emit("sendMessage", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage(""); 
    }
  };

  return (
    <section className="containerChat">
      <nav className="nav">
        <div className="inputContainer">
          <input 
            type="text" 
            placeholder="Buscar" 
            className="buscarPessoa" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <img src="/lupa.svg" alt="Ícone de lupa" className="searchIcon" />
        </div>
        <div className="navDir">
          <button 
            className="btnAddPessoa"
            onClick={() => {
              const contactId = prompt("Digite o ID do contato:");
              if (contactId) {
                sendRequest(contactId);
              }
            }}  
          >
            Adicionar Pessoa
          </button>
          <img 
            src="/sino.svg" 
            alt="Icone do sino"
            height={40} 
            width={40} 
            className="sino" 
            onClick={handleShowwRequests}
          />
          {pendingRequestsCount > 0 && (
          <span className="notificacao" onClick={handleShowwRequests}>
              {pendingRequestsCount}
          </span>
          )}

          <img 
            src="/personIcon.svg" 
            alt="Icone do usuario" 
            height={50} 
            width={50} 
            className="person"
            onClick={handleShowPerfil}
          />
        </div>
      </nav>

      {showRequest && (
        <div className={`requestsModal`}>
          <h2>Solicitações de amizade</h2>
          {requests.length > 0 ? (
            requests.map((request) => (
              <div key={request.id}>
                <p>{request.senderName}</p>
                <button onClick={() => handleAcceptRequest(request.id)} className="btnSolicitacao">Aceitar</button>
                <button onClick={() => handleRejectRequest(request.id)} className="btnSolicitacao">Rejeitar</button>
              </div>
            ))
          ) : (
            <p className="paragrafoModal">Não há solicitações pendentes</p>
          )}
        </div>
      )}

      {showPerfil && (
        <div className="PerfilModal">
          <p className="nameUSer">{userName}</p>
          <div>
            <p className="perfil">Perfil</p>
            <button onClick={handleLogout} className="btnLogout">
              <img src="/exit.svg" alt="" height={40} width={40}/>
            </button>
          </div>
        </div>
      )}

      <main>
        <div className="divContatos">
          {filteredContacts?.length > 0 ? (
            filteredContacts.map((contact) => (
              <Card 
                key={contact.id} 
                name={contact.name} 
                onClick={() => {
                  setSelectedChat(contact.id);  
                  fetchMessages(contact.id);
                }}
              />
            ))
          ) : (
            <p>Nenhum contato encontrado</p>
          )}
        </div>

        <div className={selectedChat ? "divAtivada" :"divConversa"}>
          {selectedChat ? (
            <div className="chatBox">
               <div className="messagesContainer">
               {messages.map((msg) => (
                  userId !== msg.senderId ?
                  <div className="messageDir">
                    <div className="nameuserDir">
                      <strong>{msg.senderId}</strong> 
                    </div>
                    {msg.message}
                    <div className="trianguloDir"></div>
                  </div>
                  :
                  <div className="message">
                    <div className="nameuser">
                      <strong>{msg.senderId}</strong> 
                    </div>
                    {msg.message}
                    <div className="triangulo"></div>
                  </div>
                ))}
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
                  onClick={sendMessage}
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
