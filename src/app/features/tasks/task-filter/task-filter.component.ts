import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { TaskFilter } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="filter-container">
      <button
        [class.active]="taskService.currentFilter() === 'all'"
        (click)="onFilterChange('all')"
      >
        All
      </button>
      <button
        [class.active]="taskService.currentFilter() === 'pending'"
        (click)="onFilterChange('pending')"
      >
        Pending
      </button>
      <button
        [class.active]="taskService.currentFilter() === 'completed'"
        (click)="onFilterChange('completed')"
      >
        Completed
      </button>
    </div>
  `,
  styles: [`
    .filter-container {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
      font-weight: 500;
    }

    button:hover {
      border-color: #667eea;
      color: #667eea;
    }

    button.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
  `]
})
export class TaskFilterComponent {
  constructor(public taskService: TaskService) {}

  onFilterChange(filter: TaskFilter) {
    this.taskService.setFilter(filter);
  }
}
