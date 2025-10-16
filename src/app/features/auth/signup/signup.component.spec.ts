import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { signal } from "@angular/core";

import { SignupComponent } from "./signup.component";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

// Mocks
class AuthServiceMock {
  isLoading = signal(false);
  signUp = jest.fn().mockResolvedValue({ success: true });
}

class ToastServiceMock {
  showSuccess = jest.fn();
  showError = jest.fn();
}

const routerMock = { navigate: jest.fn() };

describe("SignupComponent", () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SignupComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: ToastService, useClass: ToastServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call signUp on form submit", async () => {
    component.signupForm.setValue({
      full_name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    await component.onSubmit();

    expect(component.authService.signUp).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(["/login"]);
  });
});

// import {
//   ComponentFixture,
//   TestBed,
//   fakeAsync,
//   tick,
// } from "@angular/core/testing";
// import { SignupComponent } from "./signup.component";
// import { AuthService } from "../../../core/services/auth.service";
// import { ToastService } from "../../../core/services/toast.service";
// import { Router } from "@angular/router";
// import { ReactiveFormsModule } from "@angular/forms";
// import { RouterModule } from "@angular/router";
// import { signal, WritableSignal } from "@angular/core";
// import { By } from "@angular/platform-browser";
// import { SupabaseService } from "../../../core/services/supabase.service";

// describe("SignupComponent", () => {
//   let component: SignupComponent;
//   let fixture: ComponentFixture<SignupComponent>;
//   let authServiceMock: Partial<AuthService> & {
//     isLoading: WritableSignal<boolean>;
//   };
//   let toastServiceMock: Partial<ToastService>;
//   let routerMock: { navigate: jest.Mock };

//   beforeEach(async () => {
//     authServiceMock = {
//       isLoading: signal(false),
//       signUp: jest.fn().mockResolvedValue({ success: true }),
//       signIn: jest.fn().mockResolvedValue({ success: true }),
//     };

//     toastServiceMock = {
//       showSuccess: jest.fn(),
//       showError: jest.fn(),
//     };

//     routerMock = { navigate: jest.fn() };

//     await TestBed.configureTestingModule({
//       imports: [ReactiveFormsModule, RouterModule, SignupComponent], // Include RouterModule for routerLink
//       providers: [
//         { provide: AuthService, useValue: authServiceMock },
//         { provide: ToastService, useValue: toastServiceMock },
//         { provide: Router, useValue: routerMock },
//         { provide: SupabaseService, useValue: {} }, // Provide a minimal mock for SupabaseService
//       ],
//     }).compileComponents();

//     fixture = TestBed.createComponent(SignupComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   // it("should create", () => {
//   //   expect(component).toBeTruthy();
//   // });

//   // it("should initialize form with empty values and required validators", () => {
//   //   const form = component.signupForm;
//   //   expect(form.get("full_name")?.value).toBe("");
//   //   expect(form.get("full_name")?.valid).toBe(false);
//   //   expect(form.get("email")?.value).toBe("");
//   //   expect(form.get("email")?.valid).toBe(false);
//   //   expect(form.get("password")?.value).toBe("");
//   //   expect(form.get("password")?.valid).toBe(false);
//   // });

//   // it("should disable submit button when form is invalid", () => {
//   //   const submitButton = fixture.debugElement.query(By.css(".btn-primary"));
//   //   expect(submitButton.nativeElement.disabled).toBe(true);

//   //   component.signupForm.setValue({
//   //     full_name: "Test User",
//   //     email: "invalid-email",
//   //     password: "short",
//   //   });
//   //   fixture.detectChanges();

//   //   expect(submitButton.nativeElement.disabled).toBe(true);
//   // });

//   // it("should enable submit button when form is valid and not loading", () => {
//   //   const submitButton = fixture.debugElement.query(By.css(".btn-primary"));

//   //   component.signupForm.setValue({
//   //     full_name: "Test User",
//   //     email: "test@example.com",
//   //     password: "123456",
//   //   });
//   //   fixture.detectChanges();

//   //   expect(submitButton.nativeElement.disabled).toBe(false);
//   // });

//   // it("should disable submit button when authService is loading", () => {
//   //   component.signupForm.setValue({
//   //     full_name: "Test User",
//   //     email: "test@example.com",
//   //     password: "123456",
//   //   });
//   //   authServiceMock.isLoading.set(true);
//   //   fixture.detectChanges();

//   //   const submitButton = fixture.debugElement.query(By.css(".btn-primary"));
//   //   expect(submitButton.nativeElement.disabled).toBe(true);
//   // });

//   // it("should show loading text when authService is loading", () => {
//   //   authServiceMock.isLoading.set(true);
//   //   fixture.detectChanges();

//   //   const loadingSpan = fixture.debugElement.query(By.css(".btn-primary span"));
//   //   expect(loadingSpan.nativeElement.textContent.trim()).toBe(
//   //     "Creating account..."
//   //   );
//   // });

//   // it("should not call signUp if form is invalid", async () => {
//   //   component.signupForm.setValue({
//   //     full_name: "",
//   //     email: "",
//   //     password: "",
//   //   });

//   //   await component.onSubmit();

//   //   expect(authServiceMock.signUp).not.toHaveBeenCalled();
//   // });

//   // it("should call signUp on valid form submit, show success toast, and navigate on success", async () => {
//   //   component.signupForm.setValue({
//   //     full_name: "Test User",
//   //     email: "test@example.com",
//   //     password: "123456",
//   //   });

//   //   await component.onSubmit();

//   //   expect(authServiceMock.signUp).toHaveBeenCalledWith({
//   //     full_name: "Test User",
//   //     email: "test@example.com",
//   //     password: "123456",
//   //   });
//   //   expect(toastServiceMock.showSuccess).toHaveBeenCalledWith(
//   //     "Account created! Please login."
//   //   );
//   //   expect(routerMock.navigate).toHaveBeenCalledWith(["/login"]);
//   // });

//   // it("should show error toast on signup failure", async () => {
//   //   (authServiceMock.signUp as jest.Mock).mockResolvedValueOnce({
//   //     success: false,
//   //     error: "Email already exists",
//   //   });

//   //   component.signupForm.setValue({
//   //     full_name: "Test User",
//   //     email: "test@example.com",
//   //     password: "123456",
//   //   });

//   //   await component.onSubmit();

//   //   expect(authServiceMock.signUp).toHaveBeenCalled();
//   //   expect(toastServiceMock.showError).toHaveBeenCalledWith(
//   //     "Email already exists"
//   //   );
//   //   expect(routerMock.navigate).not.toHaveBeenCalled();
//   // });

//   // it("should handle signup submit via form UI interaction", fakeAsync(() => {
//   //   const formValues = {
//   //     full_name: "Test User",
//   //     email: "test@example.com",
//   //     password: "123456",
//   //   };

//   //   // Set form values via UI elements
//   //   const fullNameInput = fixture.debugElement.query(
//   //     By.css("#full_name")
//   //   ).nativeElement;
//   //   const emailInput = fixture.debugElement.query(
//   //     By.css("#email")
//   //   ).nativeElement;
//   //   const passwordInput = fixture.debugElement.query(
//   //     By.css("#password")
//   //   ).nativeElement;
//   //   const submitButton = fixture.debugElement.query(
//   //     By.css(".btn-primary")
//   //   ).nativeElement;

//   //   fullNameInput.value = formValues.full_name;
//   //   fullNameInput.dispatchEvent(new Event("input"));
//   //   emailInput.value = formValues.email;
//   //   emailInput.dispatchEvent(new Event("input"));
//   //   passwordInput.value = formValues.password;
//   //   passwordInput.dispatchEvent(new Event("input"));

//   //   fixture.detectChanges();
//   //   tick();

//   //   expect(submitButton.disabled).toBe(false);

//   //   // Mock signUp to be async
//   //   (authServiceMock.signUp as jest.Mock).mockImplementation(() => {
//   //     authServiceMock.isLoading.set(true);
//   //     fixture.detectChanges();
//   //     return new Promise((resolve) =>
//   //       setTimeout(() => resolve({ success: true }), 100)
//   //     );
//   //   });

//   //   submitButton.click();
//   //   fixture.detectChanges();
//   //   tick(100);

//   //   expect(authServiceMock.signUp).toHaveBeenCalledWith(formValues);
//   //   expect(toastServiceMock.showSuccess).toHaveBeenCalled();
//   //   expect(routerMock.navigate).toHaveBeenCalledWith(["/login"]);
//   // }));

//   // it("should navigate to login on link click", () => {
//   //   const routerSpy = jest.spyOn(routerMock, "navigate");
//   //   const loginLink = fixture.debugElement.query(By.css(".login-link a"));

//   //   loginLink.triggerEventHandler("click", null);

//   //   expect(routerSpy).toHaveBeenCalledWith(["/login"]);
//   // });
// });
