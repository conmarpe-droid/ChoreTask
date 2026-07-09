import React from 'react';
import { Member } from '../types';
import { AVATARS } from '../constants';

interface AvatarProps {
  member?: Member | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ member, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const emojiSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };

  if (!member) {
    return (
      <div className={`rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500 font-medium ${sizeClasses[size]} ${className}`}>
        ?
      </div>
    );
  }

  const avatarDef = AVATARS.find(a => a.id === member.avatarId);

  return (
    <div
      className={`rounded-full border-2 border-white flex items-center justify-center shadow-sm overflow-hidden ${member.color} ${sizeClasses[size]} ${className}`}
      title={member.name}
    >
      {avatarDef ? (
        <span className={`${emojiSizes[size]} leading-none transform translate-y-[5%]`}>
          {avatarDef.emoji}
        </span>
      ) : (
        <span className="text-white font-bold">{member.name.substring(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
};
