export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}

export interface LeaveStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface DashboardStats {
  tasks: TaskStats;
  leaves: LeaveStats;
}
