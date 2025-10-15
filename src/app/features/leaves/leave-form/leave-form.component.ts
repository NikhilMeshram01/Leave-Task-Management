import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { LeaveService } from '../../../core/services/leave.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-leave-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h3>Apply for Leave</h3>

      <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-group">
            <label for="leave_type">Leave Type</label>
            <select id="leave_type" formControlName="leave_type">
              <option value="sick">Sick Leave</option>
              <option value="annual">Annual Leave</option>
              <option value="casual">Casual Leave</option>
            </select>
          </div>

          <div class="form-group">
            <label for="start_date">Start Date</label>
            <input
              id="start_date"
              type="date"
              formControlName="start_date"
            />
            @if (leaveForm.get('start_date')?.invalid && leaveForm.get('start_date')?.touched) {
              <span class="error-text">Start date cannot be in the past</span>
            }
          </div>

          <div class="form-group">
            <label for="end_date">End Date</label>
            <input
              id="end_date"
              type="date"
              formControlName="end_date"
            />
            @if (leaveForm.get('end_date')?.invalid && leaveForm.get('end_date')?.touched) {
              <span class="error-text">End date must be after start date</span>
            }
          </div>
        </div>

        <div class="form-group">
          <label for="reason">Reason</label>
          <textarea
            id="reason"
            formControlName="reason"
            placeholder="Enter reason for leave"
            rows="3"
          ></textarea>
        </div>

        <button type="submit" [disabled]="leaveForm.invalid" class="btn-submit">
          Submit Leave Request
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 24px;
    }

    h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #333;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 6px;
      color: #555;
      font-weight: 500;
      font-size: 14px;
    }

    input,
    select,
    textarea {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    textarea {
      resize: vertical;
      font-family: inherit;
    }

    .error-text {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
    }

    .btn-submit {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 15px;
      transition: background 0.3s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #5568d3;
    }

    .btn-submit:disabled {
      background: #a5b4fc;
      cursor: not-allowed;
    }
  `]
})
export class LeaveFormComponent {
  leaveForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private toastService: ToastService
  ) {
    this.leaveForm = this.fb.group({
      leave_type: ['sick', Validators.required],
      start_date: ['', [Validators.required, this.futureDateValidator]],
      end_date: ['', Validators.required],
      reason: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today ? { pastDate: true } : null;
  }

  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const startDate = group.get('start_date')?.value;
    const endDate = group.get('end_date')?.value;

    if (!startDate || !endDate) return null;

    return new Date(endDate) >= new Date(startDate) ? null : { invalidRange: true };
  }

  async onSubmit() {
    if (this.leaveForm.invalid) return;

    try {
      await this.leaveService.createLeave(this.leaveForm.value);
      this.toastService.showSuccess('Leave request submitted successfully!');
      this.leaveForm.reset({ leave_type: 'sick' });
    } catch (error) {
      this.toastService.showError('Failed to submit leave request');
    }
  }
}
