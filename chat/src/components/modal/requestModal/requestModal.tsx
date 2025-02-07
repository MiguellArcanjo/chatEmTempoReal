import "./requestModal.css"

interface RequestModalProps {
    show: boolean;
    requests: any[];
    handleAcceptRequest: (requestId: string) => void;
    handleRejectRequest: (requestId: string) => void;
  }
  
  export const RequestModal: React.FC<RequestModalProps> = ({
    show,
    requests,
    handleAcceptRequest,
    handleRejectRequest
  }) => {
    if (!show) return null;
  
    return (
      <div className={`requestsModal`}>
        <h2>Solicitações de amizade</h2>
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id}>
              <p>{request.senderName}</p>
              <button 
                onClick={() => handleAcceptRequest(request.id)} 
                className="btnSolicitacao"
              >
                Aceitar
              </button>
              <button 
                onClick={() => handleRejectRequest(request.id)} 
                className="btnSolicitacao"
              >
                Rejeitar
              </button>
            </div>
          ))
        ) : (
          <p className="paragrafoModal">Não há solicitações pendentes</p>
        )}
      </div>
    );
  };
  