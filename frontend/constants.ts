import { Member, Task } from './types';

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Lavar los platos',
    description: 'Lavar todos los platos de la cena y limpiar la encimera.',
    assigneeId: null,
    createdAt: new Date().toISOString(),
    timeReward: 15,
    type: 'tarea'
  },
  {
    id: 't2',
    title: 'Aspirar el salón',
    description: 'Pasar la aspiradora por la alfombra y debajo del sofá.',
    assigneeId: null,
    createdAt: new Date().toISOString(),
    timeReward: 30,
    type: 'tarea'
  }
];

export const AVAILABLE_COLORS = [
  'bg-rose-400',
  'bg-blue-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-purple-400',
  'bg-cyan-400',
];

export const AVATARS = [
  { id: 'dog', emoji: '🐶', label: 'Perrito' },
  { id: 'cat', emoji: '🐱', label: 'Gatito' },
  { id: 'monkey', emoji: '🐒', label: 'Monito' },
  { id: 'trex', emoji: '🦖', label: 'T-Rex' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicornio' },
  { id: 'ninja', emoji: '🥷', label: 'Ninja' },
  { id: 'hero', emoji: '🦸‍♂️', label: 'Héroe' },
  { id: 'wizard', emoji: '🧙‍♀️', label: 'Maga' },
  { id: 'astronaut', emoji: '🧑‍🚀', label: 'Astronauta' },
] as const;
