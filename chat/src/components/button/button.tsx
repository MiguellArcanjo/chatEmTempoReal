import React, { useState } from "react";
import "./button.css";

const DynamicButton: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect(); 
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top; 
    setMousePosition({ x, y }); 
  };

  return (
    <button
      className="btn"
      onMouseMove={handleMouseMove}
      style={{ "--x": `${mousePosition.x}px`, "--y": `${mousePosition.y}px` } as React.CSSProperties}
    >
      <span>Enviar</span>
    </button>
  );
};

export default DynamicButton;
