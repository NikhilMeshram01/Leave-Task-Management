import { Component, signal } from "@angular/core";
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
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Employee Portal</h1>
        <h2>Login</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="
                loginForm.get('email')?.invalid &&
                loginForm.get('email')?.touched
              "
            />
            @if (loginForm.get('email')?.invalid &&
            loginForm.get('email')?.touched) {
            <span class="error-text">Valid email is required</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              [class.error]="
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              "
            />
            @if (loginForm.get('password')?.invalid &&
            loginForm.get('password')?.touched) {
            <span class="error-text">Password is required</span>
            }
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || authService.isLoading()"
            class="btn-primary"
          >
            @if (authService.isLoading()) {
            <span>Loading...</span>
            } @else {
            <span>Login</span>
            }
          </button>
        </form>

        <p class="signup-link">
          Don't have an account? <a routerLink="/signup">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .login-card {
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

      input.error {
        border-color: #dc2626;
      }

      .error-text {
        display: block;
        color: #dc2626;
        font-size: 12px;
        margin-top: 4px;
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

      .signup-link {
        text-align: center;
        margin-top: 24px;
        color: #666;
      }

      .signup-link a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
      }

      .signup-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    const result = await this.authService.signIn(this.loginForm.value);

    if (result.success) {
      this.toastService.showSuccess("Login successful!");
    } else {
      this.toastService.showError(result.error || "Login failed");
    }
  }
}
