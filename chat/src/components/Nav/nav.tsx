import "./nav.css"

interface NavProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    pendingRequestsCount: number;
    handleShowwRequests: () => void;
    handleShowPerfil: () => void;
    sendRequest: (contactId: string) => void;
}

export const Nav: React.FC<NavProps> = ({
    searchTerm,
    setSearchTerm,
    pendingRequestsCount,
    handleShowwRequests,
    handleShowPerfil,
    sendRequest
  }) => {
    return (
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
    );
};