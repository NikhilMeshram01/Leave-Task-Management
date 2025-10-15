import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { TaskService } from "../../core/services/task.service";
import { LeaveService } from "../../core/services/leave.service";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Welcome, {{ authService.currentUser()?.full_name }}!</h1>
          <p class="role-badge">{{ authService.currentUser()?.role }}</p>
        </div>
        <button class="btn-logout" (click)="logout()">Logout</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Tasks Completed</h3>
          <p class="stat-number">{{ taskStats.completed }}</p>
          <div class="progress-bar">
            <div
              class="progress-fill completed"
              [style.width.%]="
                getPercentage(taskStats.completed, taskStats.total)
              "
            ></div>
          </div>
        </div>
        <div class="stat-card">
          <h3>Tasks Pending</h3>
          <p class="stat-number">{{ taskStats.pending }}</p>
          <div class="progress-bar">
            <div
              class="progress-fill pending"
              [style.width.%]="
                getPercentage(taskStats.pending, taskStats.total)
              "
            ></div>
          </div>
        </div>
        <div class="stat-card">
          <h3>Leaves Approved</h3>
          <p class="stat-number">{{ leaveStats.approved }}</p>
          <div class="progress-bar">
            <div
              class="progress-fill approved"
              [style.width.%]="
                getPercentage(leaveStats.approved, leaveStats.total)
              "
            ></div>
          </div>
        </div>
        <div class="stat-card">
          <h3>Leaves Pending</h3>
          <p class="stat-number">{{ leaveStats.pending }}</p>
          <div class="progress-bar">
            <div
              class="progress-fill pending"
              [style.width.%]="
                getPercentage(leaveStats.pending, leaveStats.total)
              "
            ></div>
          </div>
        </div>
      </div>

      <div class="overview-grid">
        <div class="overview-card">
          <h3>Task Overview</h3>
          <div class="stats-breakdown">
            <div class="stat-item">
              <span class="label">Total Tasks</span>
              <span class="value">{{ taskStats.total }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Completed</span>
              <span class="value completed-text">{{
                taskStats.completed
              }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Pending</span>
              <span class="value pending-text">{{ taskStats.pending }}</span>
            </div>
          </div>
        </div>

        <div class="overview-card">
          <h3>Leave Overview</h3>
          <div class="stats-breakdown">
            <div class="stat-item">
              <span class="label">Total Leaves</span>
              <span class="value">{{ leaveStats.total }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Approved</span>
              <span class="value approved-text">{{ leaveStats.approved }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Pending</span>
              <span class="value pending-text">{{ leaveStats.pending }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Rejected</span>
              <span class="value rejected-text">{{ leaveStats.rejected }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="action-buttons">
          <button class="action-btn" (click)="navigateTo('/tasks')">
            Manage Tasks
          </button>
          <button class="action-btn" (click)="navigateTo('/leaves')">
            Manage Leaves
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 24px;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
      }

      h1 {
        font-size: 32px;
        margin: 0 0 8px 0;
        color: #111;
      }

      .role-badge {
        display: inline-block;
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        margin: 0;
      }

      .btn-logout {
        padding: 10px 20px;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s;
      }

      .btn-logout:hover {
        background: #b91c1c;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .stat-card {
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .stat-card h3 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #666;
        font-weight: 600;
        text-transform: uppercase;
      }

      .stat-number {
        font-size: 36px;
        font-weight: 700;
        color: #667eea;
        margin: 0 0 12px 0;
      }

      .progress-bar {
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
      }

      .progress-fill.completed,
      .progress-fill.approved {
        background: #10b981;
      }

      .progress-fill.pending {
        background: #fbbf24;
      }

      .overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
      }

      .overview-card {
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .overview-card h3 {
        margin: 0 0 20px 0;
        font-size: 18px;
        color: #333;
      }

      .stats-breakdown {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #f9fafb;
        border-radius: 6px;
      }

      .stat-item .label {
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }

      .stat-item .value {
        font-size: 20px;
        font-weight: 700;
        color: #111;
      }

      .completed-text,
      .approved-text {
        color: #10b981;
      }

      .pending-text {
        color: #fbbf24;
      }

      .rejected-text {
        color: #ef4444;
      }

      .quick-actions {
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .quick-actions h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #333;
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .action-btn {
        padding: 12px 24px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s;
      }

      .action-btn:hover {
        background: #5568d3;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  taskStats = { total: 0, completed: 0, pending: 0 };
  leaveStats = { total: 0, approved: 0, pending: 0, rejected: 0 };

  constructor(
    public authService: AuthService,
    private taskService: TaskService,
    private leaveService: LeaveService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    await Promise.all([
      this.taskService.loadTasks(),
      this.leaveService.loadLeaves(),
    ]);

    this.taskStats = this.taskService.getTaskStats();
    this.leaveStats = this.leaveService.getLeaveStats();
  }

  getPercentage(value: number, total: number): number {
    return total === 0 ? 0 : (value / total) * 100;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.signOut();
  }
}
