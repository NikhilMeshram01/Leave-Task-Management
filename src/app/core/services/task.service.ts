import { Injectable, signal } from "@angular/core";
import { SupabaseService } from "./supabase.service";
import { AuthService } from "./auth.service";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilter,
} from "../models/task.model";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  tasks = signal<Task[]>([]);
  filteredTasks = signal<Task[]>([]);
  currentFilter = signal<TaskFilter>("all");
  isLoading = signal<boolean>(false);

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  async loadTasks() {
    this.isLoading.set(true);
    console.log("loadTasks");

    try {
      const user = this.authService.currentUser();
      if (!user) throw new Error("User not logged in");

      let query = this.supabase.client
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      // ✅ Non-admin users can see only their own tasks
      if (user.role !== "admin") {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      console.log("data from loadTasks", data);
      console.log("error from loadTasks", error);

      if (error) throw error;

      this.tasks.set(data as Task[]);
      this.applyFilter(this.currentFilter());
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createTask(taskData: CreateTaskDto) {
    const user = this.authService.currentUser();
    if (!user) return;

    this.isLoading.set(true);

    try {
      const { data, error } = await this.supabase.client
        .from("tasks")
        .insert([
          {
            user_id: user.id,
            ...taskData,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      this.tasks.update((tasks) => [data as Task, ...tasks]);
      this.applyFilter(this.currentFilter());
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateTask(id: string, updates: UpdateTaskDto) {
    this.isLoading.set(true);

    try {
      const { data, error } = await this.supabase.client
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      this.tasks.update((tasks) =>
        tasks.map((task) => (task.id === id ? (data as Task) : task))
      );
      this.applyFilter(this.currentFilter());
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteTask(id: string) {
    this.isLoading.set(true);

    try {
      const { error } = await this.supabase.client
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      this.tasks.update((tasks) => tasks.filter((task) => task.id !== id));
      this.applyFilter(this.currentFilter());
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  setFilter(filter: TaskFilter) {
    this.currentFilter.set(filter);
    this.applyFilter(filter);
  }

  private applyFilter(filter: TaskFilter) {
    const allTasks = this.tasks();

    if (filter === "all") {
      this.filteredTasks.set(allTasks);
    } else {
      this.filteredTasks.set(allTasks.filter((task) => task.status === filter));
    }
  }

  getTaskStats() {
    const allTasks = this.tasks();
    return {
      total: allTasks.length,
      completed: allTasks.filter((t) => t.status === "completed").length,
      pending: allTasks.filter((t) => t.status === "pending").length,
    };
  }
}
