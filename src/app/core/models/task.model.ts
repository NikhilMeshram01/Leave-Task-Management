export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  due_date?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: "pending" | "completed";
  due_date?: string | null;
}

export type TaskFilter = "all" | "pending" | "completed";
