import React, { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { Member } from '../types';
import { Avatar } from './Avatar';
import { UserModal } from './UserModal';

interface UserSelectionProps {
  members: Member[];
  onSelectUser: (userId: string) => void;
  onAddUser: (user: Omit<Member, 'id'>) => void;
  onEditUser: (user: Member) => void;
  onDeleteUser: (userId: string) => Promise<void> | void;
}

export const UserSelection: React.FC<UserSelectionProps> = ({ members, onSelectUser, onAddUser, onEditUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Member | null>(null);

  useEffect(() => {
    if (members.length === 0) {
      setIsModalOpen(true);
    }
  }, [members.length]);

  const handleOpenAdd = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, member: Member) => {
    e.stopPropagation();
    setUserToEdit(member);
    setIsModalOpen(true);
  };

  const handleSave = (userData: Omit<Member, 'id'> | Member) => {
    if ('id' in userData) {
      onEditUser(userData as Member);
    } else {
      onAddUser(userData);
    }
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  if (members.length === 0) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
        <UserModal
          isOpen={true}
          onClose={() => {}}
          onSave={handleSave}
          isFirstUser={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-5xl font-bold text-graphite mb-2">¿Quién eres?</h1>
        <p className="text-xl text-slate-500 mb-8">Selecciona tu perfil para entrar</p>

        <div className="flex flex-wrap justify-center gap-8">
          {members.map(member => (
            <div key={member.id} className="flex flex-col items-center gap-3 group">
              <div className="relative">
                <button
                  onClick={() => onSelectUser(member.id)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Avatar member={member} size="xl" className="hand-drawn-sm" />
                </button>
                
                <button
                  onClick={(e) => handleOpenEdit(e, member)}
                  className="absolute bottom-0 right-0 bg-white text-graphite p-2 hand-drawn-btn opacity-0 group-hover:opacity-100"
                  aria-label={`Editar perfil de ${member.name}`}
                >
                  <Edit2 size={18} strokeWidth={2.5} />
                </button>
              </div>
              <span className="font-bold text-graphite text-2xl">{member.name}</span>
            </div>
          ))}

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="w-24 h-24 hand-drawn-btn bg-white flex items-center justify-center text-graphite hover:bg-slate-50"
            >
              <Plus size={40} strokeWidth={2.5} />
            </button>
            <span className="font-bold text-slate-500 text-2xl">Añadir</span>
          </div>
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setUserToEdit(null);
        }}
        onSave={handleSave}
        userToEdit={userToEdit}
        onDelete={async (id) => {
          await onDeleteUser(id);
          setIsModalOpen(false);
          setUserToEdit(null);
        }}
      />
    </div>
  );
};
