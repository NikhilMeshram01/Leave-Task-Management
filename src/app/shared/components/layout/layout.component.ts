import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <nav class="sidebar">
        <div class="logo">
          <h2>Employee Portal</h2>
        </div>

        <ul class="nav-links">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active">
              Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/tasks" routerLinkActive="active">
              Tasks
            </a>
          </li>
          <li>
            <a routerLink="/leaves" routerLinkActive="active">
              Leaves
            </a>
          </li>
        </ul>

        <div class="user-info">
          <p class="user-name">{{ authService.currentUser()?.full_name }}</p>
          <p class="user-email">{{ authService.currentUser()?.email }}</p>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
    }

    .logo {
      padding: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo h2 {
      margin: 0;
      font-size: 20px;
    }

    .nav-links {
      list-style: none;
      padding: 16px 0;
      margin: 0;
      flex: 1;
    }

    .nav-links li {
      margin: 0;
    }

    .nav-links a {
      display: block;
      padding: 12px 24px;
      color: white;
      text-decoration: none;
      transition: background 0.3s;
      font-weight: 500;
    }

    .nav-links a:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-links a.active {
      background: rgba(255, 255, 255, 0.2);
      border-left: 4px solid white;
    }

    .user-info {
      padding: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-name {
      margin: 0 0 4px 0;
      font-weight: 600;
      font-size: 14px;
    }

    .user-email {
      margin: 0 0 16px 0;
      font-size: 12px;
      opacity: 0.8;
    }

    .btn-logout {
      width: 100%;
      padding: 8px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      background: #f3f4f6;
      min-height: 100vh;
    }
  `]
})
export class LayoutComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.signOut();
  }
}
