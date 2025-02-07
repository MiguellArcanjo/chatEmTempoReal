import { useState, useEffect } from 'react';

export const useModalControl = () => {
  const [showRequest, setShowRequests] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);

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

  const handleShowwRequests = () => {
    setShowPerfil(false);
    setShowRequests(!showRequest);
  };

  const handleShowPerfil = () => {
    setShowRequests(false);
    setShowPerfil(!showPerfil);
  };

  return {
    showRequest,
    showPerfil,
    handleShowwRequests,
    handleShowPerfil
  };
};
