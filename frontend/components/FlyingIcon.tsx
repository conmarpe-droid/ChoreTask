import React, { useEffect, useState } from 'react';
import { Clock, Smartphone, Angry } from 'lucide-react';

interface FlyingIconProps {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  delay: number;
  iconType: 'clock' | 'phone' | 'angry';
}

export const FlyingIcon: React.FC<FlyingIconProps> = ({ startX, startY, targetX, targetY, delay, iconType }) => {
  const [style, setStyle] = useState({
    left: startX,
    top: startY,
    opacity: 1,
    transform: 'scale(0.5)',
    transition: 'none'
  });

  useEffect(() => {
    // Small timeout to allow initial render at start position
    const timer = setTimeout(() => {
      setStyle({
        left: targetX,
        top: targetY,
        opacity: 0,
        transform: 'scale(1.5)',
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' // slight bounce effect
      });
    }, 50 + delay);
    
    return () => clearTimeout(timer);
  }, [targetX, targetY, delay]);

  return (
    <div
      className={`fixed z-50 pointer-events-none ${
        iconType === 'clock' ? 'text-emerald-500' : 
        iconType === 'angry' ? 'text-rose-600' : 'text-rose-500'
      }`}
      style={{
        ...style,
        marginLeft: '-12px', // Center the icon based on its size (24px / 2)
        marginTop: '-12px'
      }}
    >
      {iconType === 'clock' && <Clock size={24} className="fill-emerald-100" />}
      {iconType === 'phone' && <Smartphone size={24} className="fill-rose-100" />}
      {iconType === 'angry' && <Angry size={24} className="fill-rose-100" />}
    </div>
  );
};
