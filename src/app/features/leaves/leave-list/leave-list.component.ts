import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CapitalizeFirstPipe } from '../../../shared/pipes/capitalize-first.pipe';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, DateFormatPipe, CapitalizeFirstPipe],
  template: `
    <div class="leave-list">
      <h3>Leave Requests</h3>

      @if (leaveService.leaves().length === 0) {
        <div class="empty-state">
          <p>No leave requests found.</p>
        </div>
      } @else {
        @for (leave of leaveService.leaves(); track leave.id) {
          <div class="leave-item">
            <div class="leave-header">
              <h4>{{ leave.leave_type | capitalizeFirst }} Leave</h4>
              <span
                class="status"
                [class.pending]="leave.status === 'pending'"
                [class.approved]="leave.status === 'approved'"
                [class.rejected]="leave.status === 'rejected'"
              >
                {{ leave.status | capitalizeFirst }}
              </span>
            </div>

            <div class="leave-details">
              <div class="detail-row">
                <span class="label">From:</span>
                <span>{{ leave.start_date | dateFormat }}</span>
              </div>
              <div class="detail-row">
                <span class="label">To:</span>
                <span>{{ leave.end_date | dateFormat }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Reason:</span>
                <span>{{ leave.reason }}</span>
              </div>
            </div>

            @if (authService.isAdmin() && leave.status === 'pending') {
              <div class="admin-actions">
                <button class="btn-approve" (click)="approveLeave(leave.id)">
                  Approve
                </button>
                <button class="btn-reject" (click)="rejectLeave(leave.id)">
                  Reject
                </button>
              </div>
            }

            @if (leave.status === 'pending' && !authService.isAdmin()) {
              <div class="user-actions">
                <button class="btn-delete" (click)="deleteLeave(leave.id)">
                  Cancel Request
                </button>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .leave-list {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #333;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .leave-item {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      transition: box-shadow 0.3s;
    }

    .leave-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .leave-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    h4 {
      margin: 0;
      font-size: 18px;
      color: #111;
    }

    .status {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .status.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status.approved {
      background: #d1fae5;
      color: #065f46;
    }

    .status.rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .leave-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .detail-row {
      display: flex;
      gap: 8px;
      font-size: 14px;
    }

    .label {
      font-weight: 600;
      color: #555;
      min-width: 60px;
    }

    .admin-actions,
    .user-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }

    .btn-approve {
      padding: 8px 16px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-approve:hover {
      background: #059669;
    }

    .btn-reject {
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-reject:hover {
      background: #dc2626;
    }

    .btn-delete {
      padding: 8px 16px;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-delete:hover {
      background: #4b5563;
    }
  `]
})
export class LeaveListComponent {
  constructor(
    public leaveService: LeaveService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  async approveLeave(id: string) {
    try {
      await this.leaveService.approveLeave(id);
      this.toastService.showSuccess('Leave approved!');
    } catch (error) {
      this.toastService.showError('Failed to approve leave');
    }
  }

  async rejectLeave(id: string) {
    try {
      await this.leaveService.rejectLeave(id);
      this.toastService.showSuccess('Leave rejected!');
    } catch (error) {
      this.toastService.showError('Failed to reject leave');
    }
  }

  async deleteLeave(id: string) {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;

    try {
      await this.leaveService.deleteLeave(id);
      this.toastService.showSuccess('Leave request cancelled!');
    } catch (error) {
      this.toastService.showError('Failed to cancel leave request');
    }
  }
}
