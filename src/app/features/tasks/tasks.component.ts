import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { TaskFilterComponent } from './task-filter/task-filter.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskFormComponent } from './task-form/task-form.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TaskFilterComponent, TaskListComponent, TaskFormComponent],
  template: `
    <div class="tasks-container">
      <h1>My Tasks</h1>

      <app-task-filter />

      <app-task-form />

      <app-task-list />

      @if (taskService.isLoading()) {
        <div class="loading">Loading tasks...</div>
      }
    </div>
  `,
  styles: [`
    .tasks-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    h1 {
      font-size: 32px;
      margin-bottom: 24px;
      color: #111;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  `]
})
export class TasksComponent implements OnInit {
  constructor(public taskService: TaskService) {}

  ngOnInit() {
    this.taskService.loadTasks();
  }
}
