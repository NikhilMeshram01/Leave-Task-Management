import { Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { SupabaseService } from "./supabase.service";
import { User, LoginCredentials, SignupData } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);

  constructor(private supabase: SupabaseService, private router: Router) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    this.isLoading.set(true);

    (async () => {
      try {
        const {
          data: { session },
        } = await this.supabase.auth.getSession();
        if (session?.user) {
          await this.loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        this.isLoading.set(false);
      }
    })();

    this.supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          await this.loadUserProfile(session.user.id);
        } else {
          this.currentUser.set(null);
        }
      })();
    });
  }

  private async loadUserProfile(userId: string) {
    const { data, error } = await this.supabase.client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      this.currentUser.set(data as User);
    }
  }

  // done
  async signUp(
    signupData: SignupData
  ): Promise<{ success: boolean; error?: string }> {
    this.isLoading.set(true);

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
      });

      if (error) throw error;

      if (data.user) {
        console.log(data.user);
        console.log("-->", signupData);
        const { error: profileError } = await this.supabase.client
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              email: signupData.email,
              full_name: signupData.full_name,
              role: "employee",
              password: signupData.password,
            },
          ]);

        // Fetch the profile to see full_name
        const { data: profileData, error: fetchError } =
          await this.supabase.client
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
        console.log("profileError", profileError);
        if (profileError) throw profileError;

        console.log(profileData); // full_name will be here
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      this.isLoading.set(false);
    }
  }

  // done
  async signIn(
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string }> {
    this.isLoading.set(true);

    try {
      console.log("credentials", credentials);
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      console.log("data", data);

      console.log("error", error);
      if (error) throw error;
      if (data.user) {
        await this.loadUserProfile(data.user.id);
      }

      this.router.navigate(["/dashboard"]);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      this.isLoading.set(false);
    }
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
    this.router.navigate(["/login"]);
  }

  getToken(): string | null {
    const token = localStorage.getItem("supabase.auth.token");
    return token;
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === "admin";
  }
}
