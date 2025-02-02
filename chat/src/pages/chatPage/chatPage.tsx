import Card from "../../components/card/card";
import { useNavigate } from 'react-router-dom';
import "./chatPage.css"

const ChatPage = () => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <section className="containerChat">
      <nav className="nav">
        <div className="inputContainer">
          <input type="text" placeholder="Buscar" className="buscarPessoa"/>
          <img src="/lupa.svg" alt="Ícone de lupa" className="searchIcon" />
        </div>
        <div className="navDir">
          <button className="btnAddPessoa">Adicionar Pessoa</button>
          <img src="/sino.svg" alt="Icone do sino" height={40} width={40} className="sino"/>
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

      <main>
        <div className="divContatos">
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
        <div className="divConversa">
          <img src="/chatIcon.svg" alt="" />
          <p>Clique em alguma mensagem para começar a conversar...</p>
        </div>
      </main>
    </section>
  )
}

export default ChatPage;