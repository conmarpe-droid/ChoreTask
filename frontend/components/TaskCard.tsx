import React from 'react';
import { Clock, MoreVertical, Trash2, Edit2, Angry, PlusCircle, MinusCircle } from 'lucide-react';
import { Task, Member } from '../types';
import { Avatar } from './Avatar';

interface TaskCardProps {
  task: Task;
  assignee?: Member;
  onExecute: (taskId: string, e?: React.MouseEvent) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, assignee, onExecute, onEdit, onDelete }) => {
  const isCastigo = task.type === 'castigo';
  const [showMenu, setShowMenu] = React.useState(false);

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExecute(task.id, e);
  };

  return (
    <div className={`group relative p-4 mb-4 transition-all duration-200 hand-drawn bg-white`}>
      <div className="flex items-start gap-3">
        {/* Execute Button */}
        <button
          onClick={handleExecute}
          className={`mt-1 flex-shrink-0 transition-transform hover:scale-110 ${
            isCastigo ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-500 hover:text-emerald-600'
          }`}
        >
          {isCastigo ? <MinusCircle size={26} strokeWidth={2.5} /> : <PlusCircle size={26} strokeWidth={2.5} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg truncate text-graphite">
              {task.title}
            </h3>
            
            {/* Context Menu */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="text-slate-400 hover:text-graphite p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical size={20} />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 mt-1 w-36 hand-drawn py-1 z-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(task); }}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-graphite hover:bg-slate-100 flex items-center gap-2"
                    >
                      <Edit2 size={16} /> Editar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(task.id); }}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-sm mt-1 line-clamp-2 leading-relaxed text-slate-600">
              {task.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {task.timeReward && (
              <div className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 hand-drawn-sm ${
                isCastigo ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isCastigo ? <Angry size={14} /> : <Clock size={14} />}
                <span>{isCastigo ? '-' : '+'}{task.timeReward} min</span>
              </div>
            )}

            <div className="ml-auto">
              <Avatar member={assignee} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
