import { Injectable, signal } from "@angular/core";
import { SupabaseService } from "./supabase.service";
import { AuthService } from "./auth.service";
import { Leave, CreateLeaveDto, UpdateLeaveDto } from "../models/leave.model";

@Injectable({
  providedIn: "root",
})
export class LeaveService {
  leaves = signal<Leave[]>([]);
  isLoading = signal<boolean>(false);

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  // done
  async loadLeaves() {
    this.isLoading.set(true);

    try {
      const { data, error } = await this.supabase.client
        .from("leaves")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      this.leaves.set(data as Leave[]);
    } catch (error) {
      console.error("Error loading leaves:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // done
  async createLeave(leaveData: CreateLeaveDto) {
    const user = this.authService.currentUser();
    if (!user) return;

    this.isLoading.set(true);

    try {
      const { data, error } = await this.supabase.client
        .from("leaves")
        .insert([
          {
            user_id: user.id,
            ...leaveData,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      this.leaves.update((leaves) => [data as Leave, ...leaves]);
    } catch (error) {
      console.error("Error creating leave:", error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateLeave(id: string, updates: UpdateLeaveDto) {
    this.isLoading.set(true);

    try {
      const { data, error } = await this.supabase.client
        .from("leaves")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      this.leaves.update((leaves) =>
        leaves.map((leave) => (leave.id === id ? (data as Leave) : leave))
      );
    } catch (error) {
      console.error("Error updating leave:", error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteLeave(id: string) {
    this.isLoading.set(true);

    try {
      const { error } = await this.supabase.client
        .from("leaves")
        .delete()
        .eq("id", id);

      if (error) throw error;

      this.leaves.update((leaves) => leaves.filter((leave) => leave.id !== id));
    } catch (error) {
      console.error("Error deleting leave:", error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async approveLeave(id: string) {
    await this.updateLeave(id, { status: "approved" });
  }

  async rejectLeave(id: string) {
    await this.updateLeave(id, { status: "rejected" });
  }

  getLeaveStats() {
    const allLeaves = this.leaves();
    return {
      total: allLeaves.length,
      approved: allLeaves.filter((l) => l.status === "approved").length,
      pending: allLeaves.filter((l) => l.status === "pending").length,
      rejected: allLeaves.filter((l) => l.status === "rejected").length,
    };
  }
}
