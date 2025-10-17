export interface Leave {
  id: string;
  user_id: string;
  leave_type: "sick" | "annual" | "casual";
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  profile?: { full_name: string };
}

export interface CreateLeaveDto {
  leave_type: "sick" | "annual" | "casual";
  start_date: string;
  end_date: string;
  reason: string;
}

export interface UpdateLeaveDto {
  leave_type?: "sick" | "annual" | "casual";
  start_date?: string;
  end_date?: string;
  reason?: string;
  status?: "pending" | "approved" | "rejected";
}
