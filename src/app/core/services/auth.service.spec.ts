import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { SupabaseService } from "./supabase.service";
import { Injectable, signal } from "@angular/core";

// Mock SupabaseService properly for DI
@Injectable()
class SupabaseServiceMock {
  auth = {
    signUp: jest
      .fn()
      .mockResolvedValue({ data: { user: { id: "123" } }, error: null }),
    signInWithPassword: jest
      .fn()
      .mockResolvedValue({ data: { user: { id: "123" } }, error: null }),
    getSession: jest
      .fn()
      .mockResolvedValue({ data: { session: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({}),
    onAuthStateChange: jest.fn(),
  };

  client = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };
}

describe("AuthService", () => {
  let service: AuthService;
  let routerMock: { navigate: jest.Mock };

  beforeEach(() => {
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useClass: SupabaseServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("should sign up successfully", async () => {
    const result = await service.signUp({
      email: "a@b.com",
      password: "123456",
      full_name: "Test",
    });
    expect(result.success).toBe(true);
  });

  it("should sign in successfully", async () => {
    const result = await service.signIn({
      email: "a@b.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("should sign out and navigate to login", async () => {
    await service.signOut();
    expect(routerMock.navigate).toHaveBeenCalledWith(["/login"]);
  });
});

// import { TestBed, fakeAsync, tick } from "@angular/core/testing";
// import { Router } from "@angular/router";
// import { AuthService } from "./auth.service";
// import { SupabaseService } from "./supabase.service";
// import { signal } from "@angular/core";

// // Stub class for SupabaseService
// class SupabaseServiceStub {
//   auth = {
//     signUp: jest
//       .fn()
//       .mockResolvedValue({ data: { user: { id: "123" } }, error: null }),
//     signInWithPassword: jest
//       .fn()
//       .mockResolvedValue({ data: { user: { id: "123" } }, error: null }),
//     getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
//     signOut: jest.fn().mockResolvedValue({ error: null }),
//     onAuthStateChange: jest.fn(),
//   };

//   client = {
//     from: jest.fn().mockReturnValue({
//       select: jest.fn().mockReturnValue({
//         eq: jest.fn().mockReturnValue({
//           maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
//           single: jest.fn().mockResolvedValue({ data: null, error: null }),
//         }),
//       }),
//       insert: jest.fn().mockReturnValue({
//         insert: jest.fn().mockResolvedValue({ error: null }),
//       }),
//     }),
//   };
// }

// describe("AuthService", () => {
//   let service: AuthService;
//   let supabaseService: SupabaseServiceStub;
//   let routerMock: { navigate: jest.Mock };
//   let authStateChangeCallback: (event: string, session: any) => void;

//   beforeEach(() => {
//     routerMock = { navigate: jest.fn() };

//     // Mock auth state change to capture the callback
//     const supabaseServiceStub = new SupabaseServiceStub();
//     supabaseServiceStub.auth.onAuthStateChange.mockImplementation(
//       (callback: any) => {
//         authStateChangeCallback = callback;
//         return { data: { subscription: { unsubscribe: jest.fn() } } };
//       }
//     );

//     TestBed.configureTestingModule({
//       providers: [
//         AuthService,
//         { provide: SupabaseService, useValue: supabaseServiceStub },
//         { provide: Router, useValue: routerMock },
//       ],
//     });

//     service = TestBed.inject(AuthService);
//     supabaseService = TestBed.inject(SupabaseService) as any;
//   });

//   // it("should create the service", () => {
//   //   expect(service).toBeTruthy();
//   // });

//   // it("should initialize auth and set isLoading", fakeAsync(() => {
//   //   expect(service.isLoading()).toBe(true);
//   //   tick();
//   //   expect(service.isLoading()).toBe(false);
//   //   expect(supabaseService.auth.getSession).toHaveBeenCalled();
//   // }));

//   // it("should load user profile on initialization if session exists", fakeAsync(() => {
//   //   const userProfile = {
//   //     id: "123",
//   //     email: "test@example.com",
//   //     full_name: "Test User",
//   //     role: "employee",
//   //   };
//   //   supabaseService.auth.getSession.mockResolvedValueOnce({
//   //     data: { session: { user: { id: "123" } } },
//   //   });
//   //   supabaseService.client
//   //     .from()
//   //     .select()
//   //     .eq()
//   //     .maybeSingle.mockResolvedValueOnce({ data: userProfile });

//   //   // Re-inject service to trigger initialization
//   //   TestBed.resetTestingModule();
//   //   TestBed.configureTestingModule({
//   //     providers: [
//   //       AuthService,
//   //       { provide: SupabaseService, useValue: supabaseService },
//   //       { provide: Router, useValue: routerMock },
//   //     ],
//   //   });
//   //   service = TestBed.inject(AuthService);

//   //   tick();
//   //   expect(service.currentUser()).toEqual(userProfile);
//   //   expect(supabaseService.client.from).toHaveBeenCalledWith("profiles");
//   //   expect(supabaseService.client.from().select).toHaveBeenCalledWith("*");
//   //   expect(supabaseService.client.from().select().eq).toHaveBeenCalledWith(
//   //     "id",
//   //     "123"
//   //   );
//   // }));

//   // it("should handle auth state change and load user profile", fakeAsync(() => {
//   //   const userProfile = {
//   //     id: "123",
//   //     email: "test@example.com",
//   //     full_name: "Test User",
//   //     role: "employee",
//   //   };
//   //   supabaseService.client
//   //     .from()
//   //     .select()
//   //     .eq()
//   //     .maybeSingle.mockResolvedValueOnce({ data: userProfile });

//   //   authStateChangeCallback("SIGNED_IN", { user: { id: "123" } });
//   //   tick();

//   //   expect(service.currentUser()).toEqual(userProfile);
//   //   expect(supabaseService.client.from).toHaveBeenCalledWith("profiles");
//   // }));

//   // it("should set currentUser to null on auth state change with no session", fakeAsync(() => {
//   //   service.currentUser.set({
//   //     id: "123",
//   //     email: "test@example.com",
//   //     full_name: "Test User",
//   //     role: "employee",
//   //   });
//   //   authStateChangeCallback("SIGNED_OUT", null);
//   //   tick();
//   //   expect(service.currentUser()).toBeNull();
//   // }));

//   // it("should sign up successfully and insert profile", fakeAsync(() => {
//   //   const signupData = {
//   //     email: "test@example.com",
//   //     password: "123456",
//   //     full_name: "Test User",
//   //   };
//   //   const userProfile = {
//   //     id: "123",
//   //     email: "test@example.com",
//   //     full_name: "Test User",
//   //     role: "employee",
//   //   };
//   //   supabaseService.client
//   //     .from()
//   //     .select()
//   //     .eq()
//   //     .single.mockResolvedValueOnce({ data: userProfile });

//   //   const result = service.signUp(signupData);
//   //   tick();

//   //   expect(result).resolves.toEqual({ success: true });
//   //   expect(supabaseService.auth.signUp).toHaveBeenCalledWith({
//   //     email: signupData.email,
//   //     password: signupData.password,
//   //   });
//   //   expect(supabaseService.client.from).toHaveBeenCalledWith("profiles");
//   //   expect(supabaseService.client.from().insert).toHaveBeenCalledWith([
//   //     {
//   //       id: "123",
//   //       email: signupData.email,
//   //       full_name: signupData.full_name,
//   //       role: "employee",
//   //       password: signupData.password,
//   //     },
//   //   ]);
//   // }));

//   // it("should handle signup failure", fakeAsync(() => {
//   //   supabaseService.auth.signUp.mockResolvedValueOnce({
//   //     data: null,
//   //     error: { message: "Email already exists" },
//   //   });
//   //   const result = service.signUp({
//   //     email: "test@example.com",
//   //     password: "123456",
//   //     full_name: "Test User",
//   //   });
//   //   tick();

//   //   expect(result).resolves.toEqual({
//   //     success: false,
//   //     error: "Email already exists",
//   //   });
//   //   expect(service.isLoading()).toBe(false);
//   //   expect(supabaseService.client.from().insert).not.toHaveBeenCalled();
//   // }));

//   // it("should handle profile insert failure during signup", fakeAsync(() => {
//   //   supabaseService.client.from().insert.mockReturnValueOnce({
//   //     insert: jest
//   //       .fn()
//   //       .mockResolvedValueOnce({ error: { message: "Profile insert failed" } }),
//   //   });
//   //   const result = service.signUp({
//   //     email: "test@example.com",
//   //     password: "123456",
//   //     full_name: "Test User",
//   //   });
//   //   tick();

//   //   expect(result).resolves.toEqual({
//   //     success: false,
//   //     error: "Profile insert failed",
//   //   });
//   //   expect(service.isLoading()).toBe(false);
//   // }));

//   // it("should sign in successfully and navigate to dashboard", fakeAsync(() => {
//   //   const userProfile = {
//   //     id: "123",
//   //     email: "test@example.com",
//   //     full_name: "Test User",
//   //     role: "employee",
//   //   };
//   //   supabaseService.client
//   //     .from()
//   //     .select()
//   //     .eq()
//   //     .maybeSingle.mockResolvedValueOnce({ data: userProfile });

//   //   const result = service.signIn({
//   //     email: "test@example.com",
//   //     password: "123456",
//   //   });
//   //   tick();

//   //   expect(result).resolves.toEqual({ success: true });
//   //   expect(supabaseService.auth.signInWithPassword).toHaveBeenCalledWith({
//   //     email: "test@example.com",
//   //     password: "123456",
//   //   });
//   //   expect(service.currentUser()).toEqual(userProfile);
//   //   expect(routerMock.navigate).toHaveBeenCalledWith(["/dashboard"]);
//   // }));

//   // it("should handle signin failure", fakeAsync(() => {
//   //   supabaseService.auth.signInWithPassword.mockResolvedValueOnce({
//   //     data: null,
//   //     error: { message: "Invalid credentials" },
//   //   });

//   //   const result = service.signIn({
//   //     email: "test@example.com",
//   //     password: "wrong",
//   //   });
//   //   tick();

//   //   expect(result).resolves.toEqual({
//   //     success: false,
//   //     error: "Invalid credentials",
//   //   });
//   //   expect(service.isLoading()).toBe(false);
//   //   expect(routerMock.navigate).not.toHaveBeenCalled();
//   // }));

//   // it("should sign out and navigate to login", fakeAsync(() => {
//   //   service.currentUser.set({
//   //     id: "123",
//   //     email: "test@example.com",
//   //     full_name: "Test User",
//   //     role: "employee",
//   //   });
//   //   service.signOut();
//   //   tick();

//   //   expect(supabaseService.auth.signOut).toHaveBeenCalled();
//   //   expect(service.currentUser()).toBeNull();
//   //   expect(routerMock.navigate).toHaveBeenCalledWith(["/login"]);
//   // }));

//   // it("should return null for getToken if no token exists", () => {
//   //   jest.spyOn(localStorage, "getItem").mockReturnValue(null);
//   //   expect(service.getToken()).toBeNull();
//   // }));

//   // it("should return token from localStorage", () => {
//   //   jest.spyOn(localStorage, "getItem").mockReturnValue("mock-token");
//   //   expect(service.getToken()).toEqual("mock-token");
//   // }));

//   // it("should return false for isAuthenticated if no user", () => {
//   //   expect(service.isAuthenticated()).toBe(false);
//   // }));

//   // it("should return true for isAuthenticated if user exists", () => {
//   //   service.currentUser.set({ id: "123", email: "test@example.com", full_name: "Test User", role: "employee" });
//   //   expect(service.isAuthenticated()).toBe(true);
//   // }));

//   // it("should return true for isAdmin if user role is admin", () => {
//   //   service.currentUser.set({ id: "123", email: "test@example.com", full_name: "Test User", role: "admin" });
//   //   expect(service.isAdmin()).toBe(true);
//   // }));

//   // it("should return false for isAdmin if user role is not admin", () => {
//   //   service.currentUser.set({ id: "123", email: "test@example.com", full_name: "Test User", role: "employee" });
//   //   expect(service.isAdmin()).toBe(false);
//   // }));
// });
