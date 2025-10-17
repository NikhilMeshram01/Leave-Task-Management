import { LoginComponent } from "./login.component";
import { FormBuilder } from "@angular/forms";

describe("LoginComponent - Comprehensive Tests", () => {
  let component: LoginComponent;
  const formBuilder = new FormBuilder();

  // Mock services
  const mockAuthService = {
    isLoading: () => false,
    signIn: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockToastService = {
    showSuccess: jest.fn(),
    showError: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create component instance directly
    component = new LoginComponent(
      formBuilder,
      mockAuthService as any,
      mockToastService as any,
      mockRouter as any
    );
  });

  // Basic component tests
  it("should create component instance", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize form with empty values", () => {
    expect(component.loginForm.value).toEqual({
      email: "",
      password: "",
    });
  });

  it("should have invalid form when empty", () => {
    expect(component.loginForm.valid).toBe(false);
  });

  // Form validation tests
  it("should validate required fields", () => {
    const emailControl = component.loginForm.get("email");
    const passwordControl = component.loginForm.get("password");

    expect(emailControl?.errors?.["required"]).toBeTruthy();
    expect(passwordControl?.errors?.["required"]).toBeTruthy();
  });

  it("should validate email format", () => {
    const emailControl = component.loginForm.get("email");

    // Test invalid email
    emailControl?.setValue("invalid-email");
    expect(emailControl?.errors?.["email"]).toBeTruthy();

    // Test valid email
    emailControl?.setValue("valid@example.com");
    expect(emailControl?.errors).toBeNull();
  });

  it("should have valid form when all fields are filled correctly", () => {
    component.loginForm.setValue({
      email: "test@example.com",
      password: "password123",
    });

    expect(component.loginForm.valid).toBe(true);
  });

  // Success scenario tests
  it("should call authService.signIn when form is valid", async () => {
    component.loginForm.setValue({
      email: "test@example.com",
      password: "password123",
    });

    await component.onSubmit();

    expect(mockAuthService.signIn).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("should show success message on successful login", async () => {
    component.loginForm.setValue({
      email: "test@example.com",
      password: "password123",
    });

    await component.onSubmit();

    expect(mockToastService.showSuccess).toHaveBeenCalledWith(
      "Login successful!"
    );
    // Note: Login doesn't navigate like signup - it stays on the same page or handles navigation differently
  });

  // Error scenario tests
  it("should show error message on login failure", async () => {
    mockAuthService.signIn.mockResolvedValueOnce({
      success: false,
      error: "Invalid credentials",
    });

    component.loginForm.setValue({
      email: "test@example.com",
      password: "wrongpassword",
    });

    await component.onSubmit();

    expect(mockToastService.showError).toHaveBeenCalledWith(
      "Invalid credentials"
    );
  });

  it("should show generic error message when no specific error is returned", async () => {
    mockAuthService.signIn.mockResolvedValueOnce({
      success: false,
      error: null,
    });

    component.loginForm.setValue({
      email: "test@example.com",
      password: "password123",
    });

    await component.onSubmit();

    expect(mockToastService.showError).toHaveBeenCalledWith("Login failed");
  });

  // Edge case tests
  it("should not call signIn when form is invalid", async () => {
    // Form is invalid by default (empty)
    await component.onSubmit();

    expect(mockAuthService.signIn).not.toHaveBeenCalled();
    expect(mockToastService.showSuccess).not.toHaveBeenCalled();
    expect(mockToastService.showError).not.toHaveBeenCalled();
  });

  //   it("should handle signIn promise rejection", async () => {
  //     mockAuthService.signIn.mockRejectedValueOnce(new Error("Network error"));

  //     component.loginForm.setValue({
  //       email: "test@example.com",
  //       password: "password123",
  //     });

  //     await component.onSubmit();

  //     expect(mockToastService.showError).toHaveBeenCalledWith("Login failed");
  //   });

  // Form control specific tests
  it("should mark email as invalid when empty and touched", () => {
    const emailControl = component.loginForm.get("email");

    emailControl?.setValue("");
    emailControl?.markAsTouched();

    expect(emailControl?.invalid).toBe(true);
    expect(emailControl?.errors?.["required"]).toBeTruthy();
  });

  it("should mark password as invalid when empty and touched", () => {
    const passwordControl = component.loginForm.get("password");

    passwordControl?.setValue("");
    passwordControl?.markAsTouched();

    expect(passwordControl?.invalid).toBe(true);
    expect(passwordControl?.errors?.["required"]).toBeTruthy();
  });

  // Loading state tests
  it("should reflect loading state from authService", () => {
    // Test when not loading
    expect(component.authService.isLoading()).toBe(false);

    // If you want to test loading state, you'd need to mock the signal
    // This is more complex and might require a different approach
  });

  // Form reset scenarios
  it("should maintain form state after failed submission", async () => {
    mockAuthService.signIn.mockResolvedValueOnce({
      success: false,
      error: "Invalid credentials",
    });

    const formData = {
      email: "test@example.com",
      password: "password123",
    };

    component.loginForm.setValue(formData);
    await component.onSubmit();

    // Form should maintain its values after failed submission
    expect(component.loginForm.value).toEqual(formData);
    expect(component.loginForm.valid).toBe(true);
  });
});

// Additional test suite for different scenarios
describe("LoginComponent - Loading State Tests", () => {
  let component: LoginComponent;
  const formBuilder = new FormBuilder();

  const mockToastService = {
    showSuccess: jest.fn(),
    showError: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  it("should handle isLoading signal correctly", () => {
    // Create a mock auth service with a controllable isLoading signal
    const mockAuthServiceWithLoading = {
      isLoading: jest.fn(),
      signIn: jest.fn().mockResolvedValue({ success: true }),
    };

    component = new LoginComponent(
      formBuilder,
      mockAuthServiceWithLoading as any,
      mockToastService as any,
      mockRouter as any
    );

    // Test different loading states
    mockAuthServiceWithLoading.isLoading.mockReturnValue(true);
    expect(component.authService.isLoading()).toBe(true);

    mockAuthServiceWithLoading.isLoading.mockReturnValue(false);
    expect(component.authService.isLoading()).toBe(false);
  });
});

// Test suite for form submission edge cases
describe("LoginComponent - Form Submission Edge Cases", () => {
  let component: LoginComponent;
  const formBuilder = new FormBuilder();

  const mockAuthService = {
    isLoading: () => false,
    signIn: jest.fn(),
  };

  const mockToastService = {
    showSuccess: jest.fn(),
    showError: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    component = new LoginComponent(
      formBuilder,
      mockAuthService as any,
      mockToastService as any,
      mockRouter as any
    );
  });

  it("should handle form with only email filled", async () => {
    component.loginForm.setValue({
      email: "test@example.com",
      password: "",
    });

    await component.onSubmit();

    expect(mockAuthService.signIn).not.toHaveBeenCalled();
    expect(component.loginForm.valid).toBe(false);
  });

  it("should handle form with only password filled", async () => {
    component.loginForm.setValue({
      email: "",
      password: "password123",
    });

    await component.onSubmit();

    expect(mockAuthService.signIn).not.toHaveBeenCalled();
    expect(component.loginForm.valid).toBe(false);
  });

  it("should handle valid email but invalid format", async () => {
    component.loginForm.setValue({
      email: "invalid-email-format",
      password: "password123",
    });

    await component.onSubmit();

    expect(mockAuthService.signIn).not.toHaveBeenCalled();
    expect(component.loginForm.valid).toBe(false);
  });
});
