export const useContactRequests = () => {
    const sendRequest = async (contactId: string) => {
      console.log("Enviando solicitação para o ID:", contactId);
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
  
    return {
      sendRequest
    };
  };
  