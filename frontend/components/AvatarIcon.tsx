import React from 'react';

interface AvatarIconProps {
  type: 'boy' | 'girl';
  hairColor: 'black' | 'brown' | 'blonde';
  className?: string;
}

export const AvatarIcon: React.FC<AvatarIconProps> = ({ type, hairColor, className = '' }) => {
  const colors = {
    black: '#1e293b',
    brown: '#78350f',
    blonde: '#fcd34d'
  };
  const color = colors[hairColor];

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Girl back hair */}
      {type === 'girl' && (
        <path 
          d="M 15 50 C 5 80 10 95 25 95 C 35 95 40 70 50 70 C 60 70 65 95 75 95 C 90 95 95 80 85 50 Z" 
          fill={color} 
          stroke="#334155" 
          strokeWidth="3" 
          strokeLinejoin="round"
        />
      )}
      
      {/* Face */}
      <circle cx="50" cy="55" r="30" fill="#ffedd5" stroke="#334155" strokeWidth="3"/>
      
      {/* Eyes */}
      <circle cx="40" cy="50" r="3" fill="#334155"/>
      <circle cx="60" cy="50" r="3" fill="#334155"/>
      
      {/* Smile */}
      <path d="M 42 62 Q 50 70 58 62" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Front Hair */}
      <path 
        d="M 18 55 Q 20 15 50 15 Q 80 15 82 55 Q 70 25 50 25 Q 30 25 18 55 Z" 
        fill={color} 
        stroke="#334155" 
        strokeWidth="3" 
        strokeLinejoin="round"
      />
    </svg>
  );
};
