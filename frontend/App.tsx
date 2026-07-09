import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, CheckSquare, Home, Clock, Smartphone, Angry, RotateCcw, Settings, Trash2 } from 'lucide-react';
import { Task, Member, HistoryEvent, ResetInterval } from './types';
import { INITIAL_TASKS, INITIAL_MEMBERS } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { Avatar } from './components/Avatar';
import { UserSelection } from './components/UserSelection';
import { FlyingIcon } from './components/FlyingIcon';
import { UserModal } from './components/UserModal';

type MainTab = 'tareas' | 'castigos' | 'uso';

interface AnimationData {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  delay: number;
  iconType: 'clock' | 'phone' | 'angry';
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('hogarsync_tasks', INITIAL_TASKS);
  const [members, setMembers] = useLocalStorage<Member[]>('hogarsync_members', INITIAL_MEMBERS);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('hogarsync_current_user', null);
  const [history, setHistory] = useLocalStorage<HistoryEvent[]>('hogarsync_history', []);
  
  const [mainTab, setMainTab] = useState<MainTab>('tareas');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [modalTaskType, setModalTaskType] = useState<'tarea' | 'castigo'>('tarea');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [showResetMenu, setShowResetMenu] = useState(false);

  // Use time state
  const [useHours, setUseHours] = useState(0);
  const [useMinutes, setUseMinutes] = useState(30);

  // Animation state
  const clockRef = useRef<HTMLDivElement>(null);
  const useBtnRef = useRef<HTMLButtonElement>(null);
  const [flyingIcons, setFlyingIcons] = useState<AnimationData[]>([]);

  const currentUser = members.find(m => m.id === currentUserId);

  // --- Automatic Reset Logic ---
  useEffect(() => {
    if (!currentUserId) return;
    
    const now = new Date();
    let updated = false;
    let historyUpdates: HistoryEvent[] = [];
    
    const updatedMembers = members.map(m => {
      if (m.id !== currentUserId || !m.resetInterval || m.resetInterval === 'never') return m;
      
      if (!m.lastResetDate) {
        updated = true;
        return { ...m, lastResetDate: now.toISOString() };
      }
      
      const lastReset = new Date(m.lastResetDate);
      let shouldReset = false;
      
      if (m.resetInterval === 'daily') {
        if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
          shouldReset = true;
        }
      } else if (m.resetInterval === 'weekly') {
        const diffTime = Math.abs(now.getTime() - lastReset.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) shouldReset = true;
      } else if (m.resetInterval === 'monthly') {
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
          shouldReset = true;
        }
      }

      if (shouldReset) {
        updated = true;
        if (m.availableTime && m.availableTime > 0) {
          historyUpdates.push({
            id: `h_${Date.now()}_${m.id}`,
            userId: m.id,
            type: 'used',
            title: 'Reseteo automático',
            amount: m.availableTime,
            timestamp: now.toISOString()
          });
        }
        return { ...m, availableTime: 0, lastResetDate: now.toISOString() };
      }
      
      return m;
    });

    if (updated) {
      setMembers(updatedMembers);
      if (historyUpdates.length > 0) {
        setHistory(prev => [...historyUpdates, ...prev]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // --- User Management Handlers ---
  const handleAddUser = (userData: Omit<Member, 'id'>) => {
    const newUser: Member = {
      ...userData,
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      availableTime: 0, // Default 0h 0min
    };
    setMembers(prev => [...prev, newUser]);
    if (members.length === 0) {
      setCurrentUserId(newUser.id);
    }
  };

  const handleEditUser = (updatedUser: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedUser.id ? updatedUser : m));
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // 1. Eliminar el miembro de la base de datos local
      setMembers(prev => prev.filter(m => m.id !== userId));
      
      // 2. Desasignar las tareas que tenía este usuario (para no perder las tareas de la casa)
      setTasks(prev => prev.map(t => t.assigneeId === userId ? { ...t, assigneeId: null } : t));
      
      // 3. Limpiar su historial de la base de datos local
      setHistory(prev => prev.filter(h => h.userId !== userId));
      
      // 4. Si es el usuario actual, cerrar sesión para forzar la redirección a la selección de perfiles
      if (currentUserId === userId) {
        setCurrentUserId(null);
      }
      
      // 5. Cerrar el modal de ajustes si estuviera abierto
      setIsUserModalOpen(false);

      return Promise.resolve();
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      return Promise.reject(error);
    }
  };

  const handleLogout = () => {
    setCurrentUserId(null);
  };

  // --- Time Management Handlers ---
  const handleSetResetInterval = (interval: ResetInterval) => {
    if (!currentUser) return;
    handleEditUser({ 
      ...currentUser, 
      resetInterval: interval,
      lastResetDate: new Date().toISOString()
    });
    setShowResetMenu(false);
  };

  const handleUseTime = (e: React.MouseEvent) => {
    const totalMinsToUse = (useHours * 60) + useMinutes;
    if (totalMinsToUse <= 0 || !currentUser) return;

    if (clockRef.current && useBtnRef.current) {
      const startRect = clockRef.current.getBoundingClientRect();
      const targetRect = useBtnRef.current.getBoundingClientRect();

      const startX = startRect.left + startRect.width / 2;
      const startY = startRect.top + startRect.height / 2;
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;

      const newPhones = Array.from({ length: 3 }).map((_, i) => ({
        id: `use-${Date.now()}-${i}`,
        startX,
        startY,
        targetX,
        targetY,
        delay: i * 150,
        iconType: 'phone' as const
      }));

      setFlyingIcons(prev => [...prev, ...newPhones]);

      setTimeout(() => {
        setMembers(prev => prev.map(m => {
          if (m.id === currentUserId) {
            return { ...m, availableTime: Math.max(0, (m.availableTime || 0) - totalMinsToUse) };
          }
          return m;
        }));

        const newHistoryEvent: HistoryEvent = {
          id: `h_${Date.now()}`,
          userId: currentUserId!,
          type: 'used',
          title: 'Tiempo de uso',
          amount: totalMinsToUse,
          timestamp: new Date().toISOString()
        };
        setHistory(prev => [newHistoryEvent, ...prev]);

        setFlyingIcons(prev => prev.filter(c => !newPhones.find(nc => nc.id === c.id)));
        setUseHours(0);
        setUseMinutes(30);
      }, 800 + (2 * 150));
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todo tu historial? Esta acción no se puede deshacer.')) {
      setHistory(prev => prev.filter(h => h.userId !== currentUserId));
    }
  };

  // --- Task Management Handlers ---
  const handleExecuteTask = (taskId: string, e?: React.MouseEvent) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const isCastigo = task.type === 'castigo';

    if (task.timeReward) {
      if (e && clockRef.current) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const targetRect = clockRef.current.getBoundingClientRect();

        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;

        const newIcons = Array.from({ length: 3 }).map((_, i) => ({
          id: `${taskId}-${Date.now()}-${i}`,
          startX: rect.left + 12,
          startY: rect.top + 12,
          targetX,
          targetY,
          delay: i * 150,
          iconType: (isCastigo ? 'angry' : 'clock') as 'angry' | 'clock'
        }));

        setFlyingIcons(prev => [...prev, ...newIcons]);

        setTimeout(() => {
          const timeChange = isCastigo ? -task.timeReward! : task.timeReward!;
          
          setMembers(prevMembers => prevMembers.map(m => {
            if (m.id === currentUserId) {
              return { ...m, availableTime: Math.max(0, (m.availableTime || 0) + timeChange) };
            }
            return m;
          }));

          const newHistoryEvent: HistoryEvent = {
            id: `h_${Date.now()}`,
            userId: currentUserId!,
            type: isCastigo ? 'used' : 'earned',
            title: isCastigo ? `Castigo: ${task.title}` : task.title,
            amount: task.timeReward!,
            timestamp: new Date().toISOString()
          };
          setHistory(prev => [newHistoryEvent, ...prev]);

          setFlyingIcons(prev => prev.filter(c => !newIcons.find(nc => nc.id === c.id)));
        }, 800 + (2 * 150));
      } else {
        // Fallback if no event/ref
        const timeChange = isCastigo ? -task.timeReward! : task.timeReward!;
        
        setMembers(prevMembers => prevMembers.map(m => {
          if (m.id === currentUserId) {
            return { ...m, availableTime: Math.max(0, (m.availableTime || 0) + timeChange) };
          }
          return m;
        }));
        
        const newHistoryEvent: HistoryEvent = {
          id: `h_${Date.now()}`,
          userId: currentUserId!,
          type: isCastigo ? 'used' : 'earned',
          title: isCastigo ? `Castigo: ${task.title}` : task.title,
          amount: task.timeReward!,
          timestamp: new Date().toISOString()
        };
        setHistory(prev => [newHistoryEvent, ...prev]);
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'> | Task) => {
    if ('id' in taskData) {
      setTasks(prev => prev.map(t => t.id === taskData.id ? taskData as Task : t));
    } else {
      const newTask: Task = {
        ...taskData,
        id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const openNewTaskModal = (type: 'tarea' | 'castigo') => {
    setTaskToEdit(null);
    setModalTaskType(type);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setModalTaskType(task.type || 'tarea');
    setIsTaskModalOpen(true);
  };

  // --- Derived State ---
  const profileTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter(task => {
      const isAssigned = task.assigneeId === currentUser.id || task.assigneeId === null;
      const isTypeTarea = task.type === 'tarea' || !task.type;
      return isAssigned && isTypeTarea;
    }).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, currentUser]);

  const profileCastigos = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter(task => {
      const isAssigned = task.assigneeId === currentUser.id || task.assigneeId === null;
      return isAssigned && task.type === 'castigo';
    }).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, currentUser]);

  const userHistory = useMemo(() => {
    return history
      .filter(h => h.userId === currentUserId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history, currentUserId]);

  // --- Render Logic ---

  if (!currentUserId || !currentUser) {
    return (
      <UserSelection 
        members={members} 
        onSelectUser={setCurrentUserId} 
        onAddUser={handleAddUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />
    );
  }

  const availableTime = currentUser.availableTime ?? 0;
  const displayHours = Math.floor(availableTime / 60);
  const displayMinutes = availableTime % 60;

  return (
    <div className="max-w-md mx-auto pb-24 px-4">
      {/* Render Flying Icons */}
      {flyingIcons.map(anim => (
        <FlyingIcon
          key={anim.id}
          startX={anim.startX}
          startY={anim.startY}
          targetX={anim.targetX}
          targetY={anim.targetY}
          delay={anim.delay}
          iconType={anim.iconType}
        />
      ))}

      {/* Header / Profile Info */}
      <header className="pb-6 mb-6 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar member={currentUser} size="lg" className="hand-drawn-sm mt-1" />
            <div>
              <h1 className="text-4xl font-bold text-graphite leading-none">
                {currentUser.name}
              </h1>
              
              {/* Digital Clock Section */}
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <div 
                    ref={clockRef}
                    className="bg-white text-emerald-600 font-mono text-3xl px-4 py-2 hand-drawn flex items-center gap-1"
                  >
                    <Clock size={24} className="text-emerald-500 mr-1" strokeWidth={2.5} />
                    <span>{displayHours}h</span>
                    <span className="text-emerald-400">:</span>
                    <span>{String(displayMinutes).padStart(2, '0')}m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button 
                        onClick={() => setShowResetMenu(!showResetMenu)}
                        className="bg-white text-graphite p-2 hand-drawn-btn hover:text-brand-600 hover:bg-slate-50"
                        title="Configurar reseteo"
                      >
                        <RotateCcw size={18} strokeWidth={2.5} />
                      </button>
                      {showResetMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowResetMenu(false)}></div>
                          <div className="absolute top-full left-0 mt-2 w-48 hand-drawn py-1 z-50 bg-white shadow-lg">
                            <div className="px-3 py-2 text-xs font-bold text-slate-400 border-b-2 border-slate-100 mb-1">Resetear a 0h 0m:</div>
                            {(['never', 'daily', 'weekly', 'monthly'] as const).map(interval => (
                              <button
                                key={interval}
                                onClick={() => handleSetResetInterval(interval)}
                                className={`w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 ${currentUser.resetInterval === interval || (!currentUser.resetInterval && interval === 'never') ? 'text-brand-600 bg-brand-50' : 'text-graphite hover:bg-slate-100'}`}
                              >
                                {interval === 'never' ? 'Nunca' : interval === 'daily' ? 'Diariamente' : interval === 'weekly' ? 'Semanalmente' : 'Mensualmente'}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsUserModalOpen(true)}
              className="p-2 text-graphite hover:text-brand-500 transition-colors"
              title="Ajustes de perfil"
            >
              <Settings size={28} strokeWidth={2.5} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-graphite hover:text-rose-500 transition-colors"
              title="Volver a perfiles"
            >
              <Home size={28} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-6">
        {/* Main Tabs */}
        <div className="flex mb-6 border-b-2 border-graphite">
          <button
            onClick={() => setMainTab('tareas')}
            className={`flex-1 py-3 text-xl font-bold text-center hand-drawn-tab ${
              mainTab === 'tareas' ? 'active text-graphite' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Tareas
          </button>
          <button
            onClick={() => setMainTab('castigos')}
            className={`flex-1 py-3 text-xl font-bold text-center hand-drawn-tab ${
              mainTab === 'castigos' ? 'active text-rose-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Castigos
          </button>
          <button
            onClick={() => setMainTab('uso')}
            className={`flex-1 py-3 text-xl font-bold text-center hand-drawn-tab ${
              mainTab === 'uso' ? 'active text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Uso
          </button>
        </div>

        {/* Tab Content */}
        {mainTab === 'tareas' && (
          <div className="space-y-4">
            <div className="space-y-4">
              {profileTasks.length === 0 ? (
                <div className="text-center py-16 hand-drawn bg-white/50 border-dashed">
                  <CheckSquare className="mx-auto h-16 w-16 text-slate-300 mb-3" strokeWidth={1.5} />
                  <h3 className="text-2xl font-bold text-graphite">Página en blanco</h3>
                  <p className="text-slate-500 mt-1 text-lg">No tienes tareas asignadas.</p>
                </div>
              ) : (
                profileTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignee={members.find(m => m.id === task.assigneeId)}
                    onExecute={handleExecuteTask}
                    onEdit={openEditTaskModal}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}

              <button
                onClick={() => openNewTaskModal('tarea')}
                className="w-full py-4 mt-4 hand-drawn-btn bg-brand-50 text-brand-700 text-xl font-bold flex items-center justify-center gap-2"
              >
                <Plus size={24} strokeWidth={2.5} /> Añadir nueva tarea
              </button>
            </div>
          </div>
        )}

        {mainTab === 'castigos' && (
          <div className="space-y-4">
            <div className="space-y-4">
              {profileCastigos.length === 0 ? (
                <div className="text-center py-16 hand-drawn bg-white/50 border-dashed">
                  <Angry className="mx-auto h-16 w-16 text-slate-300 mb-3" strokeWidth={1.5} />
                  <h3 className="text-2xl font-bold text-graphite">¡Bien hecho!</h3>
                  <p className="text-slate-500 mt-1 text-lg">No tienes castigos asignados.</p>
                </div>
              ) : (
                profileCastigos.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignee={members.find(m => m.id === task.assigneeId)}
                    onExecute={handleExecuteTask}
                    onEdit={openEditTaskModal}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}

              <button
                onClick={() => openNewTaskModal('castigo')}
                className="w-full py-4 mt-4 hand-drawn-btn bg-rose-50 text-rose-700 text-xl font-bold flex items-center justify-center gap-2"
              >
                <Plus size={24} strokeWidth={2.5} /> Añadir nuevo castigo
              </button>
            </div>
          </div>
        )}

        {mainTab === 'uso' && (
          <div className="space-y-8">
            <div className="hand-drawn p-8 text-center bg-white">
              <h3 className="text-3xl font-bold text-graphite mb-2">¿Cuánto tiempo?</h3>
              <p className="text-slate-500 mb-8 text-lg">Canjea tu tiempo ganado.</p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min="0"
                    value={useHours}
                    onChange={(e) => setUseHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 text-center font-mono text-4xl hand-drawn-sm py-3 outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <span className="text-graphite font-bold mt-2 text-lg">Horas</span>
                </div>
                <span className="text-4xl font-bold text-graphite mb-8">:</span>
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={useMinutes}
                    onChange={(e) => setUseMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-20 text-center font-mono text-4xl hand-drawn-sm py-3 outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <span className="text-graphite font-bold mt-2 text-lg">Minutos</span>
                </div>
              </div>

              <button
                ref={useBtnRef}
                onClick={handleUseTime}
                disabled={useHours === 0 && useMinutes === 0}
                className="w-full py-4 bg-rose-500 text-white text-2xl font-bold hand-drawn-btn flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Smartphone size={28} strokeWidth={2.5} /> Canjear
              </button>
            </div>
          </div>
        )}

        {/* History Section (Always visible below tabs) */}
        <div className="pt-8 mt-8 border-t-2 border-graphite/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-bold text-graphite">Historial</h3>
            {userHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-rose-600 bg-rose-50 hand-drawn-sm hover:bg-rose-100 transition-colors"
                title="Borrar historial"
              >
                <Trash2 size={16} strokeWidth={2.5} /> Limpiar
              </button>
            )}
          </div>
          <div className="space-y-4">
            {userHistory.length === 0 ? (
              <div className="text-center py-8 hand-drawn bg-white/50 border-dashed">
                <p className="text-slate-500 text-xl">Aún no hay movimientos.</p>
              </div>
            ) : (
              userHistory.map(item => (
                <div key={item.id} className="flex items-center justify-between hand-drawn p-4 bg-white">
                  <div className="flex items-center gap-4">
                    {item.type === 'earned' ? (
                      <div className="text-emerald-600 relative">
                        <Clock size={28} strokeWidth={2.5} />
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white">+</div>
                      </div>
                    ) : (
                      <div className="text-rose-600 relative">
                        <Clock size={28} strokeWidth={2.5} />
                        <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white">-</div>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-graphite text-lg leading-tight">{item.title}</p>
                      <p className="text-sm text-slate-500">{new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <div className={`font-bold text-2xl ${item.type === 'earned' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.type === 'earned' ? '+' : '-'}{item.amount}m
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        members={members}
        taskToEdit={taskToEdit}
        defaultType={modalTaskType}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleEditUser}
        userToEdit={currentUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
