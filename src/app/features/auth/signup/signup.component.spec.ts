// import { SignupComponent } from "./signup.component";
// import { FormBuilder } from "@angular/forms";

// describe("SignupComponent - Simple Test", () => {
//   let component: SignupComponent;
//   const formBuilder = new FormBuilder();

//   // Mock services
//   const mockAuthService = {
//     isLoading: () => false,
//     signUp: jest.fn().mockResolvedValue({ success: true }),
//   };

//   const mockToastService = {
//     showSuccess: jest.fn(),
//     showError: jest.fn(),
//   };

//   const mockRouter = {
//     navigate: jest.fn(),
//   };

//   beforeEach(() => {
//     // Create component instance directly
//     component = new SignupComponent(
//       formBuilder,
//       mockAuthService as any,
//       mockToastService as any,
//       mockRouter as any
//     );

//     // Manually call ngOnInit if needed, or the form is created in constructor
//   });

//   it("should create component instance", () => {
//     expect(component).toBeTruthy();
//   });

//   it("should initialize form with empty values", () => {
//     expect(component.signupForm.value).toEqual({
//       full_name: "",
//       email: "",
//       password: "",
//     });
//   });

//   it("should have invalid form when empty", () => {
//     expect(component.signupForm.valid).toBe(false);
//   });

//   it("should validate required fields", () => {
//     const fullNameControl = component.signupForm.get("full_name");
//     const emailControl = component.signupForm.get("email");
//     const passwordControl = component.signupForm.get("password");

//     expect(fullNameControl?.errors?.["required"]).toBeTruthy();
//     expect(emailControl?.errors?.["required"]).toBeTruthy();
//     expect(passwordControl?.errors?.["required"]).toBeTruthy();
//   });

//   it("should have valid form when all fields are filled correctly", () => {
//     component.signupForm.setValue({
//       full_name: "Test User",
//       email: "test@example.com",
//       password: "123456",
//     });

//     expect(component.signupForm.valid).toBe(true);
//   });

//   it("should call authService.signUp when form is valid", async () => {
//     component.signupForm.setValue({
//       full_name: "Test User",
//       email: "test@example.com",
//       password: "123456",
//     });

//     await component.onSubmit();

//     expect(mockAuthService.signUp).toHaveBeenCalledWith({
//       full_name: "Test User",
//       email: "test@example.com",
//       password: "123456",
//     });
//   });
// });

import { SignupComponent } from "./signup.component";
import { FormBuilder } from "@angular/forms";

describe("SignupComponent - Comprehensive Tests", () => {
  let component: SignupComponent;
  const formBuilder = new FormBuilder();

  // Mock services
  const mockAuthService = {
    isLoading: () => false,
    signUp: jest.fn().mockResolvedValue({ success: true }),
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
    component = new SignupComponent(
      formBuilder,
      mockAuthService as any,
      mockToastService as any,
      mockRouter as any
    );
  });

  // Basic tests (already working)
  it("should create component instance", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize form with empty values", () => {
    expect(component.signupForm.value).toEqual({
      full_name: "",
      email: "",
      password: "",
    });
  });

  it("should have invalid form when empty", () => {
    expect(component.signupForm.valid).toBe(false);
  });

  it("should validate required fields", () => {
    const fullNameControl = component.signupForm.get("full_name");
    const emailControl = component.signupForm.get("email");
    const passwordControl = component.signupForm.get("password");

    expect(fullNameControl?.errors?.["required"]).toBeTruthy();
    expect(emailControl?.errors?.["required"]).toBeTruthy();
    expect(passwordControl?.errors?.["required"]).toBeTruthy();
  });

  it("should have valid form when all fields are filled correctly", () => {
    component.signupForm.setValue({
      full_name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    expect(component.signupForm.valid).toBe(true);
  });

  // Form validation tests
  it("should validate email format", () => {
    const emailControl = component.signupForm.get("email");

    emailControl?.setValue("invalid-email");
    expect(emailControl?.errors?.["email"]).toBeTruthy();

    emailControl?.setValue("valid@example.com");
    expect(emailControl?.errors).toBeNull();
  });

  it("should validate password minimum length", () => {
    const passwordControl = component.signupForm.get("password");

    passwordControl?.setValue("12345"); // 5 characters
    expect(passwordControl?.errors?.["minlength"]).toBeTruthy();

    passwordControl?.setValue("123456"); // 6 characters
    expect(passwordControl?.errors).toBeNull();
  });

  // Success scenario tests
  it("should call authService.signUp when form is valid", async () => {
    component.signupForm.setValue({
      full_name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    await component.onSubmit();

    expect(mockAuthService.signUp).toHaveBeenCalledWith({
      full_name: "Test User",
      email: "test@example.com",
      password: "123456",
    });
  });

  it("should show success message and navigate on successful signup", async () => {
    component.signupForm.setValue({
      full_name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    await component.onSubmit();

    expect(mockToastService.showSuccess).toHaveBeenCalledWith(
      "Account created! Please login."
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(["/login"]);
  });

  // Error scenario tests
  it("should show error message on signup failure", async () => {
    mockAuthService.signUp.mockResolvedValueOnce({
      success: false,
      error: "Email already exists",
    });

    component.signupForm.setValue({
      full_name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    await component.onSubmit();

    expect(mockToastService.showError).toHaveBeenCalledWith(
      "Email already exists"
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it("should show generic error message when no specific error is returned", async () => {
    mockAuthService.signUp.mockResolvedValueOnce({
      success: false,
      error: null,
    });

    component.signupForm.setValue({
      full_name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    await component.onSubmit();

    expect(mockToastService.showError).toHaveBeenCalledWith("Signup failed");
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  // Edge case tests
  it("should not call signUp when form is invalid", async () => {
    // Form is invalid by default (empty)
    await component.onSubmit();

    expect(mockAuthService.signUp).not.toHaveBeenCalled();
    expect(mockToastService.showSuccess).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  //   it("should handle signUp promise rejection", async () => {
  //     mockAuthService.signUp.mockRejectedValueOnce(new Error("Network error"));

  //     component.signupForm.setValue({
  //       full_name: "Test User",
  //       email: "test@example.com",
  //       password: "123456",
  //     });

  //     await component.onSubmit();

  //     expect(mockToastService.showError).toHaveBeenCalledWith("Signup failed");
  //   });
});
