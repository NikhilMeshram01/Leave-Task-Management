import { Injectable } from "@angular/core";
import {
  createClient,
  SupabaseClient,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import { environment } from "../../../environments/environment";

const supabaseUrl = environment.supabaseUrl;
const supabaseKey = environment.supabaseKey;

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
