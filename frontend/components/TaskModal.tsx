import React, { useState, useEffect } from 'react';
import { X, Clock, Angry } from 'lucide-react';
import { Task, Member } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'> | Task) => void;
  members: Member[];
  taskToEdit?: Task | null;
  defaultType?: 'tarea' | 'castigo';
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, members, taskToEdit, defaultType = 'tarea' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [timeReward, setTimeReward] = useState<number | ''>('');
  const [type, setType] = useState<'tarea' | 'castigo'>(defaultType);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setAssigneeId(taskToEdit.assigneeId || '');
        setTimeReward(taskToEdit.timeReward || '');
        setType(taskToEdit.type || 'tarea');
      } else {
        setTitle('');
        setDescription('');
        setAssigneeId('');
        setTimeReward('');
        setType(defaultType);
      }
    }
  }, [isOpen, taskToEdit, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      assigneeId: assigneeId || null,
      timeReward: typeof timeReward === 'number' ? timeReward : undefined,
      type,
    };

    if (taskToEdit) {
      onSave({ ...taskToEdit, ...taskData });
    } else {
      onSave(taskData);
    }
    onClose();
  };

  const isCastigo = type === 'castigo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="hand-drawn w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] bg-paper">
        <div className="flex items-center justify-between p-4 border-b-2 border-graphite bg-white/50">
          <h2 className="text-2xl font-bold text-graphite">
            {taskToEdit ? (isCastigo ? 'Editar Castigo' : 'Editar Tarea') : (isCastigo ? 'Nuevo Castigo' : 'Nueva Tarea')}
          </h2>
          <button onClick={onClose} className="text-graphite hover:text-rose-500 transition-colors">
            <X size={28} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-lg font-bold text-graphite mb-1">Título *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isCastigo ? "Ej. No hacer la cama" : "Ej. Limpiar el baño"}
                className="w-full px-3 py-2 hand-drawn-sm bg-white outline-none focus:ring-2 focus:ring-brand-400 text-lg"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="timeReward" className={`block text-lg font-bold text-graphite mb-1 flex items-center gap-2`}>
                {isCastigo ? <Angry size={20} className="text-rose-500" /> : <Clock size={20} className="text-emerald-500" />} 
                {isCastigo ? 'Tiempo restado (min)' : 'Tiempo ganado (min)'}
              </label>
              <input
                type="number"
                id="timeReward"
                min="0"
                value={timeReward}
                onChange={(e) => setTimeReward(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Ej. 15"
                className={`w-full px-3 py-2 hand-drawn-sm outline-none focus:ring-2 text-xl font-bold ${
                  isCastigo ? 'bg-rose-50 focus:ring-rose-400' : 'bg-emerald-50 focus:ring-emerald-400'
                }`}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-lg font-bold text-graphite mb-1">Descripción</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles..."
                rows={3}
                className="w-full px-3 py-2 hand-drawn-sm bg-white outline-none focus:ring-2 focus:ring-brand-400 resize-none text-lg"
              />
            </div>

            <div>
              <label htmlFor="assignee" className="block text-lg font-bold text-graphite mb-1">Asignar a</label>
              <select
                id="assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 hand-drawn-sm bg-white outline-none focus:ring-2 focus:ring-brand-400 text-lg"
              >
                <option value="">Todos</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        <div className="p-4 border-t-2 border-graphite bg-white/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-lg font-bold text-graphite bg-white hand-drawn-btn"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="task-form"
            className={`px-5 py-2 text-lg font-bold text-white hand-drawn-btn ${isCastigo ? 'bg-rose-500' : 'bg-brand-500'}`}
          >
            {taskToEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};
