import "./card.css";

interface CardProps {
  name: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ name, onClick }) => {
  return (
    <div className="containerCard" onClick={onClick}>
      <div>
        <img src="/iconPersonPreto.svg" alt="Ícone do usuário" />
        <p>{name}</p>
      </div>
    </div>
  );
};

export default Card;
