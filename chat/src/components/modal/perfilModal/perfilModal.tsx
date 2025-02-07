import "./perfilModal.css"

interface ProfileModalProps {
    show: boolean;
    userName: string;
    userId: string;
    handleLogout: () => void;
  }
  
  export const ProfileModal: React.FC<ProfileModalProps> = ({
    show,
    userName,
    userId,
    handleLogout
  }) => {
    if (!show) return null;
  
    return (
      <div className="PerfilModal">
        <div className="perfilNameAndId">
          <p className="nameUSer">{userName}</p>
          <h3 className="id">ID: {userId}</h3>
        </div>
        <div>
          <p className="perfil">Perfil</p>
          <button onClick={handleLogout} className="btnLogout">
            <img src="/exit.svg" alt="" height={40} width={40}/>
          </button>
        </div>
      </div>
    );
  };
  