import { Injectable } from "@angular/core";
import {
  createClient,
  SupabaseClient,
  User as SupabaseUser,
} from "@supabase/supabase-js";

const supabaseUrl = "https://vvdlpivjifdvkxfhoslv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZGxwaXZqaWZkdmt4Zmhvc2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTUxMjAsImV4cCI6MjA3NTk5MTEyMH0.oJALVYrtQRDVLowBzoMAYkfHkLZCWk-vDG1109lSFS0";

@Injectable({
  providedIn: "root",
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get auth() {
    return this.supabase.auth;
  }
}
