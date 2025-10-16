import { TestBed } from "@angular/core/testing";
import { SupabaseService } from "./supabase.service";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../../../environments/environment";

// Mock the createClient function
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  }),
}));

describe("SupabaseService", () => {
  let service: SupabaseService;
  let mockCreateClient: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    mockCreateClient = (createClient as jest.Mock).mockClear();

    // Mock environment variables
    jest
      .spyOn(require("../../../environments/environment"), "environment")
      .mockReturnValue({
        supabaseUrl: "https://mock-supabase-url.supabase.co",
        supabaseKey: "mock-supabase-key",
      });

    TestBed.configureTestingModule({
      providers: [SupabaseService],
    });

    service = TestBed.inject(SupabaseService);
  });

  // it("should create the service", () => {
  //   expect(service).toBeTruthy();
  // });

  // it("should initialize supabase client with correct environment variables", () => {
  //   expect(mockCreateClient).toHaveBeenCalledWith(
  //     "https://mock-supabase-url.supabase.co",
  //     "mock-supabase-key"
  //   );
  //   expect(service.client).toBeDefined();
  // });

  // it("should provide access to supabase client via client getter", () => {
  //   const client = service.client;
  //   expect(client).toBeDefined();
  //   expect(client).toEqual(
  //     expect.objectContaining({
  //       auth: expect.any(Object),
  //     })
  //   );
  // });

  // it("should provide access to supabase auth via auth getter", () => {
  //   const auth = service.auth;
  //   expect(auth).toBeDefined();
  //   expect(auth).toEqual(
  //     expect.objectContaining({
  //       signUp: expect.any(Function),
  //       signInWithPassword: expect.any(Function),
  //       getSession: expect.any(Function),
  //       onAuthStateChange: expect.any(Function),
  //     })
  //   );
  // });

  // it("should throw an error if supabaseUrl is missing", () => {
  //   jest
  //     .spyOn(require("../../../environments/environment"), "environment")
  //     .mockReturnValue({
  //       supabaseUrl: "",
  //       supabaseKey: "mock-supabase-key",
  //     });

  //   expect(() => new SupabaseService()).toThrowError(
  //     "Supabase URL is not defined"
  //   );
  // });

  // it("should throw an error if supabaseKey is missing", () => {
  //   jest
  //     .spyOn(require("../../../environments/environment"), "environment")
  //     .mockReturnValue({
  //       supabaseUrl: "https://mock-supabase-url.supabase.co",
  //       supabaseKey: "",
  //     });

  //   expect(() => new SupabaseService()).toThrowError(
  //     "Supabase Key is not defined"
  //   );
  // });
});
