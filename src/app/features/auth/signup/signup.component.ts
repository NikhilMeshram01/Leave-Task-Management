import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <h1>Employee Portal</h1>
        <h2>Sign Up</h2>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="full_name">Full Name</label>
            <input
              id="full_name"
              type="text"
              formControlName="full_name"
              placeholder="Enter your full name"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            [disabled]="signupForm.invalid || authService.isLoading()"
            class="btn-primary"
          >
            <span *ngIf="authService.isLoading(); else signupText"
              >Creating account...</span
            >
            <ng-template #signupText>Sign Up</ng-template>
          </button>
        </form>

        <p class="login-link">
          Already have an account? <a routerLink="/login">Login</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .signup-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .signup-card {
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        width: 100%;
        max-width: 400px;
      }

      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        color: #667eea;
        text-align: center;
      }

      h2 {
        margin: 0 0 32px 0;
        font-size: 20px;
        color: #333;
        text-align: center;
        font-weight: 500;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 8px;
        color: #555;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.3s;
      }

      input:focus {
        outline: none;
        border-color: #667eea;
      }

      .btn-primary {
        width: 100%;
        padding: 12px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.3s;
      }

      .btn-primary:hover:not(:disabled) {
        background: #5568d3;
      }

      .btn-primary:disabled {
        background: #a5b4fc;
        cursor: not-allowed;
      }

      .login-link {
        text-align: center;
        margin-top: 24px;
        color: #666;
      }

      .login-link a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
      }

      .login-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      full_name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;

    const result = await this.authService.signUp(this.signupForm.value);

    if (result.success) {
      this.toastService.showSuccess("Account created! Please login.");
      this.router.navigate(["/login"]);
    } else {
      this.toastService.showError(result.error || "Signup failed");
    }
  }
}
