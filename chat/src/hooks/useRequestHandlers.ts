export const useRequestHandlers = (setRequests: React.Dispatch<React.SetStateAction<any[]>>) => {
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:8080/users/acceptRequest/${requestId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao aceitar solicitação");
      }

      setRequests(requests => requests.filter(request => request.id !== requestId));
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

      setRequests(requests => requests.filter(request => request.id !== requestId));
      alert("Solicitação recusada com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao recusar solicitação:", error);
      alert(error);
    }
  };

  return {
    handleAcceptRequest,
    handleRejectRequest
  };
};
