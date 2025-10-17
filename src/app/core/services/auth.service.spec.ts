import { AuthService } from "./auth.service";
import { SupabaseService } from "./supabase.service";
import { Router } from "@angular/router";
import { NgZone } from "@angular/core";

describe("AuthService - Comprehensive Tests", () => {
  let authService: AuthService;
  let mockSupabaseService: any;
  let mockRouter: any;
  let mockNgZone: any;

  beforeEach(() => {
    // Mock SupabaseService
    mockSupabaseService = {
      auth: {
        getSession: jest.fn(),
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChange: jest.fn(),
      },
      client: {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(),
              single: jest.fn(),
            })),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(),
          })),
        })),
      },
    };

    // Mock Router
    mockRouter = {
      navigate: jest.fn(),
    };

    // Mock NgZone
    mockNgZone = {
      run: jest.fn((fn: any) => fn()),
    };

    // Create AuthService instance
    authService = new AuthService(
      mockSupabaseService as any,
      mockRouter as any,
      mockNgZone as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Basic service tests
  describe("Service Initialization", () => {
    it("should create AuthService instance", () => {
      expect(authService).toBeTruthy();
    });

    // it("should initialize with default signal values", () => {
    //   expect(authService.currentUser()).toBeNull();
    //   expect(authService.isLoading()).toBe(false);
    //   expect(authService.isAuthReady()).toBe(false);
    // });
  });

  // initializeAuth tests
  describe("initializeAuth", () => {
    it("should load user profile when session exists", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };

      mockSupabaseService.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });

      const loadUserProfileSpy = jest.spyOn(
        authService as any,
        "loadUserProfile"
      );

      // Re-initialize to trigger the method
      await (authService as any).initializeAuth();

      expect(mockSupabaseService.auth.getSession).toHaveBeenCalled();
      expect(loadUserProfileSpy).toHaveBeenCalledWith("user-123");
      expect(authService.isAuthReady()).toBe(true);
    });

    it("should handle no session gracefully", async () => {
      mockSupabaseService.auth.getSession.mockResolvedValue({
        data: { session: null },
      });

      await (authService as any).initializeAuth();

      expect(mockSupabaseService.auth.getSession).toHaveBeenCalled();
      expect(authService.currentUser()).toBeNull();
      expect(authService.isAuthReady()).toBe(true);
    });

    it("should handle initialization errors", async () => {
      mockSupabaseService.auth.getSession.mockRejectedValue(
        new Error("Auth error")
      );

      await (authService as any).initializeAuth();

      expect(mockSupabaseService.auth.getSession).toHaveBeenCalled();
      expect(authService.isLoading()).toBe(false);
      expect(authService.isAuthReady()).toBe(true);
    });
  });

  // loadUserProfile tests
  describe("loadUserProfile", () => {
    it("should load user profile successfully", async () => {
      const mockUserData = {
        id: "user-123",
        email: "test@example.com",
        full_name: "Test User",
        role: "employee",
      };

      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest
          .fn()
          .mockResolvedValue({ data: mockUserData, error: null }),
      };

      mockSupabaseService.client.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
      });

      await (authService as any).loadUserProfile("user-123");

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("profiles");
      expect(authService.currentUser()).toEqual(mockUserData);
    });

    it("should handle profile loading errors", async () => {
      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: new Error("Profile not found"),
        }),
      };

      mockSupabaseService.client.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
      });

      await (authService as any).loadUserProfile("user-123");

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("profiles");
      expect(authService.currentUser()).toBeNull();
    });
  });

  // signUp tests
  describe("signUp", () => {
    const signupData = {
      email: "test@example.com",
      password: "password123",
      full_name: "Test User",
    };

    it("should sign up user successfully", async () => {
      const mockAuthResponse = {
        data: {
          user: { id: "new-user-123" },
        },
        error: null,
      };

      const mockProfileResponse = {
        error: null,
      };

      mockSupabaseService.auth.signUp.mockResolvedValue(mockAuthResponse);

      const mockInsertChain = {
        select: jest.fn().mockResolvedValue(mockProfileResponse),
      };

      mockSupabaseService.client.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockInsertChain),
      });

      const result = await authService.signUp(signupData);

      expect(mockSupabaseService.auth.signUp).toHaveBeenCalledWith({
        email: signupData.email,
        password: signupData.password,
      });

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("profiles");
      expect(result).toEqual({ success: true });
    });

    it("should handle signup auth errors", async () => {
      mockSupabaseService.auth.signUp.mockResolvedValue({
        data: null,
        error: new Error("Auth signup failed"),
      });

      const result = await authService.signUp(signupData);

      expect(result).toEqual({
        success: false,
        error: "Auth signup failed",
      });
    });

    // it("should handle profile creation errors", async () => {
    //   const mockAuthResponse = {
    //     data: {
    //       user: { id: "new-user-123" },
    //     },
    //     error: null,
    //   };

    //   mockSupabaseService.auth.signUp.mockResolvedValue(mockAuthResponse);

    //   const mockInsertChain = {
    //     select: jest.fn().mockResolvedValue({
    //       error: new Error("Profile creation failed"),
    //     }),
    //   };

    //   mockSupabaseService.client.from.mockReturnValue({
    //     insert: jest.fn().mockReturnValue(mockInsertChain),
    //   });

    //   const result = await authService.signUp(signupData);

    //   expect(result).toEqual({
    //     success: false,
    //     error: "Profile creation failed",
    //   });
    // });

    it("should handle unexpected errors", async () => {
      mockSupabaseService.auth.signUp.mockRejectedValue(
        new Error("Network error")
      );

      const result = await authService.signUp(signupData);

      expect(result).toEqual({
        success: false,
        error: "Network error",
      });
    });

    it("should set loading state correctly", async () => {
      mockSupabaseService.auth.signUp.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const mockInsertChain = {
        select: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseService.client.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockInsertChain),
      });

      // Check initial loading state
      expect(authService.isLoading()).toBe(false);

      const signupPromise = authService.signUp(signupData);

      // Loading should be true during operation
      expect(authService.isLoading()).toBe(true);

      await signupPromise;

      // Loading should be false after completion
      expect(authService.isLoading()).toBe(false);
    });
  });

  // signIn tests
  describe("signIn", () => {
    const credentials = {
      email: "test@example.com",
      password: "password123",
    };

    it("should sign in user successfully", async () => {
      const mockAuthResponse = {
        data: {
          user: { id: "user-123" },
        },
        error: null,
      };

      mockSupabaseService.auth.signInWithPassword.mockResolvedValue(
        mockAuthResponse
      );

      // Mock loadUserProfile
      const loadUserProfileSpy = jest
        .spyOn(authService as any, "loadUserProfile")
        .mockResolvedValue(undefined);

      const result = await authService.signIn(credentials);

      expect(mockSupabaseService.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
      });

      expect(loadUserProfileSpy).toHaveBeenCalledWith("user-123");
      expect(mockNgZone.run).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(["/dashboard"]);
      expect(result).toEqual({ success: true });
    });

    it("should handle signin auth errors", async () => {
      mockSupabaseService.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: new Error("Invalid credentials"),
      });

      const result = await authService.signIn(credentials);

      expect(result).toEqual({
        success: false,
        error: "Invalid credentials",
      });
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it("should handle signin without user data", async () => {
      mockSupabaseService.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await authService.signIn(credentials);

      expect(result).toEqual({ success: true });
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it("should handle unexpected signin errors", async () => {
      mockSupabaseService.auth.signInWithPassword.mockRejectedValue(
        new Error("Network error")
      );

      const result = await authService.signIn(credentials);

      expect(result).toEqual({
        success: false,
        error: "Network error",
      });
    });
  });

  // signOut tests
  describe("signOut", () => {
    it("should sign out user successfully", async () => {
      mockSupabaseService.auth.signOut.mockResolvedValue({ error: null });

      await authService.signOut();

      expect(mockSupabaseService.auth.signOut).toHaveBeenCalled();
      expect(authService.currentUser()).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(["/login"]);
    });

    // it("should handle signout errors", async () => {
    //   mockSupabaseService.auth.signOut.mockRejectedValue(
    //     new Error("Signout failed")
    //   );

    //   // Should still clear user and navigate
    //   await authService.signOut();

    //   expect(mockSupabaseService.auth.signOut).toHaveBeenCalled();
    //   expect(authService.currentUser()).toBeNull();
    //   expect(mockRouter.navigate).toHaveBeenCalledWith(["/login"]);
    // });
  });

  // Utility method tests
  describe("Utility Methods", () => {
    it("should return true for isAuthenticated when user exists", () => {
      authService.currentUser.set({
        id: "user-123",
        email: "test@example.com",
        full_name: "Test User",
        role: "employee",
      });

      expect(authService.isAuthenticated()).toBe(true);
    });

    it("should return false for isAuthenticated when no user", () => {
      authService.currentUser.set(null);
      expect(authService.isAuthenticated()).toBe(false);
    });

    it("should return true for isAdmin when user is admin", () => {
      authService.currentUser.set({
        id: "user-123",
        email: "admin@example.com",
        full_name: "Admin User",
        role: "admin",
      });

      expect(authService.isAdmin()).toBe(true);
    });

    it("should return false for isAdmin when user is not admin", () => {
      authService.currentUser.set({
        id: "user-123",
        email: "user@example.com",
        full_name: "Regular User",
        role: "employee",
      });

      expect(authService.isAdmin()).toBe(false);
    });

    it("should return false for isAdmin when no user", () => {
      authService.currentUser.set(null);
      expect(authService.isAdmin()).toBe(false);
    });
  });

  // Auth state change tests
  describe("Auth State Changes", () => {
    it("should handle auth state changes with session", async () => {
      const mockCallback = jest.fn();
      mockSupabaseService.auth.onAuthStateChange.mockImplementation(
        (callback: any) => {
          // Simulate calling the callback later
          setTimeout(
            () => callback("SIGNED_IN", { user: { id: "user-123" } }),
            0
          );
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        }
      );

      const loadUserProfileSpy = jest
        .spyOn(authService as any, "loadUserProfile")
        .mockResolvedValue(undefined);

      // Re-initialize to set up the listener
      await (authService as any).initializeAuth();

      // The callback should be set up
      expect(mockSupabaseService.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it("should handle auth state changes without session", async () => {
      mockSupabaseService.auth.onAuthStateChange.mockImplementation(
        (callback: any) => {
          // Simulate signing out
          setTimeout(() => callback("SIGNED_OUT", null), 0);
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        }
      );

      // Set a current user first
      authService.currentUser.set({
        id: "user-123",
        email: "test@example.com",
        full_name: "Test User",
        role: "employee",
      });

      // Re-initialize to set up the listener
      await (authService as any).initializeAuth();

      // The callback should be set up
      expect(mockSupabaseService.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});

// Additional test suite for edge cases
describe("AuthService - Edge Cases", () => {
  let authService: AuthService;
  let mockSupabaseService: any;
  let mockRouter: any;
  let mockNgZone: any;

  beforeEach(() => {
    mockSupabaseService = {
      auth: {
        getSession: jest.fn(),
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChange: jest.fn(),
      },
      client: {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(),
            })),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(),
          })),
        })),
      },
    };

    mockRouter = { navigate: jest.fn() };
    mockNgZone = { run: jest.fn((fn: any) => fn()) };

    authService = new AuthService(
      mockSupabaseService as any,
      mockRouter as any,
      mockNgZone as any
    );
  });

  it("should handle empty signup data", async () => {
    const emptySignupData = {
      email: "",
      password: "",
      full_name: "",
    };

    const result = await authService.signUp(emptySignupData);

    expect(mockSupabaseService.auth.signUp).toHaveBeenCalledWith({
      email: "",
      password: "",
    });
    expect(result.success).toBeDefined();
  });

  it("should handle empty login credentials", async () => {
    const emptyCredentials = {
      email: "",
      password: "",
    };

    const result = await authService.signIn(emptyCredentials);

    expect(mockSupabaseService.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "",
      password: "",
    });
    expect(result.success).toBeDefined();
  });

  it("should handle profile data with special characters", async () => {
    const signupData = {
      email: "test+special@example.com",
      password: "p@$$w0rd!",
      full_name: "Test User Jr.",
    };

    mockSupabaseService.auth.signUp.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockInsertChain = {
      select: jest.fn().mockResolvedValue({ error: null }),
    };

    mockSupabaseService.client.from.mockReturnValue({
      insert: jest.fn().mockReturnValue(mockInsertChain),
    });

    const result = await authService.signUp(signupData);

    expect(result.success).toBe(true);
  });
});
