import { Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { SupabaseService } from "./supabase.service";
import { User, LoginCredentials, SignupData } from "../models/user.model";
import { NgZone } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);
  isAuthReady = signal<boolean>(false);

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    this.isLoading.set(true);

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
      this.isAuthReady.set(true);
    }

    this.supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.currentUser.set(null);
      }
    });
  }

  private async loadUserProfile(userId: string) {
    console.log("userId from loadUserProfile", userId);
    const { data, error } = await this.supabase.client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    console.log("error from loadUserProfile", error);
    console.log("data from loadUserProfile", data);
    if (error) console.error("Error loading profile:", error);
    if (data) this.currentUser.set(data as User);
  }

  async signUp(signupData: SignupData) {
    this.isLoading.set(true);
    console.log("signupData from signUp", signupData);
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
      });

      console.log("error from signUp", error);
      console.log("data from signUp", data);
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await this.supabase.client
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              email: signupData.email,
              full_name: signupData.full_name,
              password: signupData.password,
              role: "employee",
            },
          ]);
        if (profileError) throw profileError;
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error signing up:", error);
      return { success: false, error: error.message };
    } finally {
      this.isLoading.set(false);
    }
  }

  // async signIn(credentials: LoginCredentials) {
  //   this.isLoading.set(true);
  //   try {
  //     const { data, error } = await this.supabase.auth.signInWithPassword({
  //       email: credentials.email,
  //       password: credentials.password,
  //     });

  //     console.log("error", error);
  //     console.log("data", data);

  //     if (error) throw error;

  //     if (data.user) {
  //       await this.loadUserProfile(data.user.id);
  //       this.router.navigate(["/dashboard"]); // ✅ Navigate after profile loaded
  //     }

  //     return { success: true };
  //   } catch (error: any) {
  //     return { success: false, error: error.message };
  //   } finally {
  //     this.isLoading.set(false);
  //   }
  // }

  async signIn(credentials: LoginCredentials) {
    this.isLoading.set(true);
    console.log("credentials from signIn", credentials);
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      console.log("error from signIn", error);
      console.log("data from signIn", data);

      if (error) throw error;

      if (data.user) {
        await this.loadUserProfile(data.user.id);

        // Wrap navigation in Angular zone to trigger change detection
        this.ngZone.run(() => {
          this.router.navigate(["/dashboard"]);
        });
      }

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

  isAuthenticated() {
    return this.currentUser() !== null;
  }

  isAdmin() {
    return this.currentUser()?.role === "admin";
  }
}
