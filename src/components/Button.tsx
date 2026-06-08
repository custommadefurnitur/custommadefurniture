import React from 'react';
interface ButtonProps {
  name: string;
  width: number;
  height: number;
  color: string;
  bgcolor: string; 
  link: string;
}
const Button = ({ name, width, height, color, bgcolor, link }: ButtonProps) =>  {

  // Inline styles applying dynamic dimensions and colors
  const buttonStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: `${bgcolor}`,
    border: 'none',
    borderRadius: '5px',
    color: `${color}`,
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  };

  return (
    <a href={link} style={{ textDecoration: 'none' }}>
      <button 
        style={buttonStyle}
        className="flex items-center justify-center animated-btn"
        suppressHydrationWarning={true}
      >
        <span className="btn-text p-4 text-nowrap">{name}</span>
        
        {/* Animated pseudo-element via CSS inside inline styles/classes */}
        <style>{`
          .animated-btn::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              120deg, 
              transparent, 
              rgba(255, 255, 255, 0.3), 
              transparent
            );
            transition: all 0.5s ease;
          }
          .animated-btn:hover::after {
            left: 100%;
          }
          .animated-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
            filter: brightness(1.1);
          }
          .animated-btn:active {
            transform: translateY(1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </button>
    </a>
  );
};

export default Button;
