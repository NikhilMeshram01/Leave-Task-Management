import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../core/services/leave.service';
import { LeaveFormComponent } from './leave-form/leave-form.component';
import { LeaveListComponent } from './leave-list/leave-list.component';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, LeaveFormComponent, LeaveListComponent],
  template: `
    <div class="leaves-container">
      <h1>Leave Management</h1>

      <app-leave-form />

      <app-leave-list />

      @if (leaveService.isLoading()) {
        <div class="loading">Loading leaves...</div>
      }
    </div>
  `,
  styles: [`
    .leaves-container {
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
export class LeavesComponent implements OnInit {
  constructor(public leaveService: LeaveService) {}

  ngOnInit() {
    this.leaveService.loadLeaves();
  }
}
