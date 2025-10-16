import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { TaskService } from "../../../core/services/task.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-task-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h3>Add New Task</h3>

      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <input
            type="text"
            formControlName="title"
            placeholder="Task title"
            class="task-input"
          />
          <input type="date" formControlName="due_date" class="date-input" />
          <button type="submit" [disabled]="taskForm.invalid" class="btn-add">
            Add Task
          </button>
        </div>

        <textarea
          formControlName="description"
          placeholder="Task description (optional)"
          class="description-input"
          rows="2"
        ></textarea>
      </form>
    </div>
  `,
  styles: [
    `
      .form-container {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
      }

      h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #333;
      }

      .form-row {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }

      .task-input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }

      .date-input {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }

      .description-input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        resize: vertical;
      }

      .task-input:focus,
      .date-input:focus,
      .description-input:focus {
        outline: none;
        border-color: #667eea;
      }

      .btn-add {
        padding: 10px 20px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.3s;
      }

      .btn-add:hover:not(:disabled) {
        background: #5568d3;
      }

      .btn-add:disabled {
        background: #a5b4fc;
        cursor: not-allowed;
      }
    `,
  ],
})
export class TaskFormComponent {
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private toastService: ToastService
  ) {
    this.taskForm = this.fb.group({
      title: ["", Validators.required],
      description: [""],
      due_date: [null],
    });
  }

  async onSubmit() {
    if (this.taskForm.invalid) return;

    try {
      await this.taskService.createTask(this.taskForm.value);
      this.toastService.showSuccess("Task created successfully!");
      this.taskForm.reset();
    } catch (error: any) {
      this.toastService.showError("Failed to create task");
    }
  }
}
