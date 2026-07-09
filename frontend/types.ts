export type ResetInterval = 'never' | 'daily' | 'weekly' | 'monthly';

export interface Member {
  id: string;
  name: string;
  color: string;
  avatarId?: string;
  availableTime?: number; // Time in minutes
  resetInterval?: ResetInterval;
  lastResetDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null;
  createdAt: string;
  timeReward?: number; // Time rewarded in minutes when completed
  type?: 'tarea' | 'castigo'; // Default to 'tarea' if undefined
}

export interface HistoryEvent {
  id: string;
  userId: string;
  type: 'earned' | 'used';
  title: string;
  amount: number; // in minutes
  timestamp: string;
}
