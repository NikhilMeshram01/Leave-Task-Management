import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { TaskService } from '../../../core/services/task.service';
import { ToastService } from '../../../core/services/toast.service';
import { HighlightOverdueDirective } from '../../../shared/directives/highlight-overdue.directive';
import { CapitalizeFirstPipe } from '../../../shared/pipes/capitalize-first.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    HighlightOverdueDirective,
    CapitalizeFirstPipe,
    DateFormatPipe
  ],
  animations: [
    trigger('taskAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ],
  template: `
    <div class="task-list">
      @if (taskService.filteredTasks().length === 0) {
        <div class="empty-state">
          <p>No tasks found. Create your first task!</p>
        </div>
      } @else {
        @for (task of taskService.filteredTasks(); track task.id) {
          <div
            class="task-item"
            [appHighlightOverdue]="task.due_date"
            [taskStatus]="task.status"
            @taskAnimation
          >
            <div class="task-header">
              <input
                type="checkbox"
                [checked]="task.status === 'completed'"
                (change)="toggleTaskStatus(task)"
              />
              <h3 [class.completed]="task.status === 'completed'">
                {{ task.title | capitalizeFirst }}
              </h3>
            </div>

            @if (task.description) {
              <p class="task-description">{{ task.description }}</p>
            }

            <div class="task-meta">
              @if (task.due_date) {
                <span class="due-date">Due: {{ task.due_date | dateFormat }}</span>
              }
              <span class="status" [class.completed]="task.status === 'completed'">
                {{ task.status | capitalizeFirst }}
              </span>
            </div>

            <div class="task-actions">
              <button class="btn-delete" (click)="deleteTask(task.id)">
                Delete
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .task-item {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.3s;
    }

    .task-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .task-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
      flex: 1;
    }

    h3.completed {
      text-decoration: line-through;
      color: #999;
    }

    .task-description {
      margin: 8px 0;
      color: #666;
      font-size: 14px;
      padding-left: 32px;
    }

    .task-meta {
      display: flex;
      gap: 16px;
      align-items: center;
      padding-left: 32px;
      margin-top: 8px;
    }

    .due-date {
      font-size: 13px;
      color: #666;
    }

    .status {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      background: #fef3c7;
      color: #92400e;
      font-weight: 600;
    }

    .status.completed {
      background: #d1fae5;
      color: #065f46;
    }

    .task-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
    }

    .btn-delete {
      padding: 6px 12px;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.3s;
    }

    .btn-delete:hover {
      background: #b91c1c;
    }
  `]
})
export class TaskListComponent {
  constructor(
    public taskService: TaskService,
    private toastService: ToastService
  ) {}

  async toggleTaskStatus(task: Task) {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await this.taskService.updateTask(task.id, { status: newStatus });
      this.toastService.showSuccess('Task updated!');
    } catch (error) {
      this.toastService.showError('Failed to update task');
    }
  }

  async deleteTask(id: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await this.taskService.deleteTask(id);
      this.toastService.showSuccess('Task deleted!');
    } catch (error) {
      this.toastService.showError('Failed to delete task');
    }
  }
}
