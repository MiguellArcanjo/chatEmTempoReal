import { useEffect, useState } from "react";
import Card from "../../components/card/card";
import { useNavigate } from "react-router-dom";
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
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

  const addContact = async (contactId: string) => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch("http://localhost:8080/users/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contactId }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar contato");
      }
  
      alert("Contato adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar contato:", error);
      alert(error);
    }
  };

  const handleShowwRequests = () => {
    setShowRequests(!showRequest);
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
      console.error("Erro ao aceitar sollicitação", error);
      alert(error);
    }
  }

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
                sendRequest(contactId)
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
            onClick={handleLogout}
          />
        </div>
      </nav>

      {showRequest && (
        <div className="requestsModal">
          <h2>Solicitações de amizade</h2>
          {requests.length > 0 ? (
            requests.map((request) => (
              <div key={request.id}>
                <p>{request.senderName}</p>
                <button onClick={() => handleAcceptRequest(request.id)}>Aceitar</button>
                <button onClick={() => handleRejectRequest(request.id)}>Rejeitar</button>
              </div>
            ))
          ) : (
            <p>Não há solicitações pendentes</p>
          )}
        </div>
      )}

      <main>
        <div className="divContatos">
          {filteredContacts?.length > 0 ? (
            filteredContacts.map((contact) => (
              <Card 
                key={contact ? contact.id : ''} 
                name={contact ? contact.name : ''} 
                onClick={() => setSelectedChat(contact ? contact.name : '')} 
              />
            ))
          ) : (
            <p>Nenhum contato encontrado</p>
          )}
        </div>

        <div className={selectedChat ? "divAtivada" :"divConversa"}>
          {selectedChat ? (
            <div className="chatBox">
              <input type="text" placeholder="Digite sua mensagem..." className="inputMensagem" />
              <button className="btnEnviar">
                <img src="/arrow.svg" alt="" height={20} width={20}/>
              </button>
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
