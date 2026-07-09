import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Member } from '../types';
import { AVAILABLE_COLORS, AVATARS } from '../constants';
import { Avatar } from './Avatar';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<Member, 'id'> | Member) => void;
  userToEdit?: Member | null;
  isFirstUser?: boolean;
  onDelete?: (userId: string) => Promise<void> | void;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit, isFirstUser, onDelete }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setName(userToEdit.name);
        setColor(userToEdit.color);
        setAvatarId(userToEdit.avatarId || AVATARS[0].id);
      } else {
        setName('');
        setColor(AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]);
        setAvatarId(AVATARS[0].id);
      }
      setIsDeleting(false);
      setErrorMsg(null);
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const userData = {
      name: name.trim(),
      color,
      avatarId,
    };

    if (userToEdit) {
      onSave({ ...userToEdit, ...userData });
    } else {
      onSave(userData);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!userToEdit || !onDelete) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este perfil de forma permanente? Se borrará todo su historial y volverás a la pantalla de inicio.')) {
      setIsDeleting(true);
      setErrorMsg(null);
      try {
        await onDelete(userToEdit.id);
        // Si se elimina con éxito, cerramos el modal
        onClose();
      } catch (error: any) {
        setErrorMsg(error.message || "Hubo un error al eliminar el perfil. Por favor, inténtalo de nuevo.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const previewMember: Member = {
    id: 'preview',
    name: name || 'Tu Nombre',
    color,
    avatarId
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="hand-drawn w-full max-w-sm overflow-hidden bg-paper max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b-2 border-graphite bg-white/50">
          <h2 className="text-2xl font-bold text-graphite">
            {userToEdit ? 'Editar Perfil' : isFirstUser ? 'Crea tu Perfil' : 'Añadir Usuario'}
          </h2>
          {!isFirstUser && (
            <button onClick={onClose} className="text-graphite hover:text-rose-500 transition-colors" disabled={isDeleting}>
              <X size={28} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-center mb-6">
            <Avatar member={previewMember} size="xl" className="hand-drawn-sm" />
          </div>

          {errorMsg && (
            <div className="bg-rose-100 text-rose-700 p-3 rounded-lg text-sm font-bold mb-4 border border-rose-200 text-center">
              {errorMsg}
            </div>
          )}

          <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-bold text-graphite mb-1">Nombre *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Mamá, Juan..."
                className="w-full px-3 py-2 hand-drawn-sm bg-white outline-none focus:ring-2 focus:ring-brand-400 text-lg"
                required
                autoFocus
                disabled={isDeleting}
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-graphite mb-2">Elige tu avatar</label>
              <div className="grid grid-cols-3 gap-3">
                {AVATARS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAvatarId(a.id)}
                    disabled={isDeleting}
                    className={`p-2 rounded-xl hand-drawn-sm transition-transform flex justify-center items-center text-3xl ${
                      avatarId === a.id ? 'bg-brand-100 border-brand-500 scale-110' : 'bg-white hover:bg-slate-50'
                    }`}
                    title={a.label}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-graphite mb-2">Color de fondo</label>
              <div className="flex gap-3 flex-wrap justify-center">
                {AVAILABLE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    disabled={isDeleting}
                    className={`w-10 h-10 rounded-full ${c} hand-drawn-sm transition-transform ${color === c ? 'scale-125 border-4' : 'hover:scale-110'}`}
                    aria-label={`Seleccionar color ${c}`}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t-2 border-graphite bg-white/50 flex justify-between items-center gap-3">
          {userToEdit && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
              title="Eliminar perfil"
            >
              <Trash2 size={24} strokeWidth={2.5} />
            </button>
          ) : <div></div>}
          <div className="flex gap-3">
            {!isFirstUser && (
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-5 py-2 text-lg font-bold text-graphite bg-white hand-drawn-btn disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              form="user-form"
              disabled={isDeleting}
              className="px-5 py-2 text-lg font-bold text-white bg-graphite hand-drawn-btn w-full sm:w-auto disabled:opacity-50"
            >
              {isDeleting ? 'Borrando...' : (userToEdit ? 'Guardar' : 'Continuar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
