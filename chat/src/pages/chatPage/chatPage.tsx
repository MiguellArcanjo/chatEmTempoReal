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
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);

  console.log("🔄 Inicializando socket...");
  const socket = io("http://localhost:8080");

  socket.on("connect", () => {
    console.log("✅ Socket conectado com ID:", socket.id);
  });

  socket.on("disconnect", () => {
    console.warn("⚠️ Socket desconectado.");
  });

  useEffect(() => {
    console.log("🔍 Buscando informações do usuário...");
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8080/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("✅ Usuário logado:", data.name);
          setUserName(data.name);
        })
        .catch((error) => console.error("❌ Erro ao buscar usuário:", error));
    }
  }, []);

  const fetchContacts = async () => {
    try {
      console.log("🔍 Buscando contatos...");
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
      console.log("✅ Contatos recebidos:", jsonData.contacts);
      setContacts(jsonData.contacts);

      console.log("🔍 Buscando solicitações...");
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
      console.log("✅ Solicitações recebidas:", requestJsonData.requests);
      setRequests(requestJsonData.requests);

      const pendingRequests = requestJsonData.requests.filter(
        (request: Request) => request.status === "pendente"
      );
      setPendingRequestsCount(pendingRequests.length);
    } catch (error) {
      console.error("❌ Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleLogout = () => {
    console.log("🔴 Logout realizado.");
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    console.log("📡 Aguardando mensagens...");
    socket.on("mensagem", (msg) => {
      console.log("📩 Nova mensagem recebida:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      console.log("🛑 Removendo listener de mensagens.");
      socket.off("mensagem");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = { sender: userName, content: message };
      console.log("📤 Enviando mensagem:", newMessage);
      socket.emit("mensagem", newMessage);
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
        </div>
      </nav>

      <main>
        <div className="divContatos">
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <Card
                key={contact.id}
                name={contact.name}
                onClick={() => {
                  console.log("📞 Selecionando contato:", contact.name);
                  setSelectedChat(contact.name);
                }}
              />
            ))
          ) : (
            <p>Nenhum contato encontrado</p>
          )}
        </div>

        <div className={selectedChat ? "divAtivada" : "divConversa"}>
          {selectedChat ? (
            <div className="chatBox">
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
                Enviar
              </button>
            </div>
          ) : (
            <p>Clique em alguma mensagem para começar a conversar...</p>
          )}
        </div>
      </main>
    </section>
  );
};

export default ChatPage;
