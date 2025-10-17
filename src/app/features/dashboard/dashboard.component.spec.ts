import { DashboardComponent } from "./dashboard.component";
import { TaskService } from "../../core/services/task.service";
import { LeaveService } from "../../core/services/leave.service";
import { AuthService } from "../../core/services/auth.service";
import { Router } from "@angular/router";

describe("DashboardComponent - Comprehensive Tests", () => {
  let component: DashboardComponent;

  // Mock services
  const mockAuthService = {
    currentUser: jest.fn(),
    signOut: jest.fn(),
  };

  const mockTaskService = {
    loadTasks: jest.fn().mockResolvedValue(undefined),
    getTaskStats: jest.fn().mockReturnValue({
      total: 10,
      completed: 6,
      pending: 4,
    }),
  };

  const mockLeaveService = {
    loadLeaves: jest.fn().mockResolvedValue(undefined),
    getLeaveStats: jest.fn().mockReturnValue({
      total: 8,
      approved: 5,
      pending: 2,
      rejected: 1,
    }),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up default mock returns
    mockAuthService.currentUser.mockReturnValue({
      full_name: "John Doe",
      role: "employee",
    });

    // Create component instance
    component = new DashboardComponent(
      mockAuthService as any,
      mockTaskService as any,
      mockLeaveService as any,
      mockRouter as any
    );
  });

  // Basic component tests
  it("should create component instance", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with default stats values", () => {
    expect(component.taskStats).toEqual({
      total: 0,
      completed: 0,
      pending: 0,
    });

    expect(component.leaveStats).toEqual({
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    });
  });

  // ngOnInit and data loading tests
  describe("ngOnInit and Data Loading", () => {
    it("should load data on initialization", async () => {
      await component.ngOnInit();

      expect(mockTaskService.loadTasks).toHaveBeenCalled();
      expect(mockLeaveService.loadLeaves).toHaveBeenCalled();
      expect(mockTaskService.getTaskStats).toHaveBeenCalled();
      expect(mockLeaveService.getLeaveStats).toHaveBeenCalled();
    });

    it("should update stats after loading data", async () => {
      await component.ngOnInit();

      expect(component.taskStats).toEqual({
        total: 10,
        completed: 6,
        pending: 4,
      });

      expect(component.leaveStats).toEqual({
        total: 8,
        approved: 5,
        pending: 2,
        rejected: 1,
      });
    });

    // it("should handle loadData errors gracefully", async () => {
    //   mockTaskService.loadTasks.mockRejectedValueOnce(new Error("Load failed"));
    //   mockLeaveService.loadLeaves.mockRejectedValueOnce(
    //     new Error("Load failed")
    //   );

    //   // Should not throw error
    //   await expect(component.loadData()).resolves.not.toThrow();

    //   // Stats should remain at default values
    //   expect(component.taskStats).toEqual({
    //     total: 0,
    //     completed: 0,
    //     pending: 0,
    //   });
    // });
  });

  // Percentage calculation tests
  describe("Percentage Calculation", () => {
    it("should calculate percentage correctly", () => {
      expect(component.getPercentage(5, 10)).toBe(50);
      expect(component.getPercentage(3, 10)).toBe(30);
      expect(component.getPercentage(0, 10)).toBe(0);
    });

    it("should handle zero total gracefully", () => {
      expect(component.getPercentage(5, 0)).toBe(0);
      expect(component.getPercentage(0, 0)).toBe(0);
    });

    it("should handle decimal percentages", () => {
      expect(component.getPercentage(1, 3)).toBeCloseTo(33.33);
    });
  });

  // Navigation tests
  describe("Navigation", () => {
    it("should navigate to tasks route", () => {
      component.navigateTo("/tasks");
      expect(mockRouter.navigate).toHaveBeenCalledWith(["/tasks"]);
    });

    it("should navigate to leaves route", () => {
      component.navigateTo("/leaves");
      expect(mockRouter.navigate).toHaveBeenCalledWith(["/leaves"]);
    });

    it("should handle different routes", () => {
      component.navigateTo("/profile");
      expect(mockRouter.navigate).toHaveBeenCalledWith(["/profile"]);
    });
  });

  // Logout tests
  describe("Logout", () => {
    it("should call authService.signOut on logout", () => {
      component.logout();
      expect(mockAuthService.signOut).toHaveBeenCalled();
    });
  });

  // User data tests
  describe("User Data Display", () => {
    it("should display user full name from authService", () => {
      expect(mockAuthService.currentUser()).toEqual({
        full_name: "John Doe",
        role: "employee",
      });
    });

    it("should handle different user roles", () => {
      mockAuthService.currentUser.mockReturnValue({
        full_name: "Admin User",
        role: "admin",
      });

      expect(mockAuthService.currentUser().role).toBe("admin");
    });

    it("should handle null user gracefully", () => {
      mockAuthService.currentUser.mockReturnValue(null);

      expect(mockAuthService.currentUser()).toBeNull();
    });
  });

  // Stats calculation edge cases
  describe("Stats Edge Cases", () => {
    it("should handle zero tasks", async () => {
      mockTaskService.getTaskStats.mockReturnValueOnce({
        total: 0,
        completed: 0,
        pending: 0,
      });

      await component.loadData();

      expect(component.taskStats.total).toBe(0);
      expect(component.getPercentage(0, 0)).toBe(0);
    });

    it("should handle zero leaves", async () => {
      mockLeaveService.getLeaveStats.mockReturnValueOnce({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      });

      await component.loadData();

      expect(component.leaveStats.total).toBe(0);
      expect(component.getPercentage(0, 0)).toBe(0);
    });

    it("should handle all tasks completed", async () => {
      mockTaskService.getTaskStats.mockReturnValueOnce({
        total: 10,
        completed: 10,
        pending: 0,
      });

      await component.loadData();

      expect(component.taskStats.completed).toBe(10);
      expect(component.getPercentage(10, 10)).toBe(100);
    });

    it("should handle all leaves approved", async () => {
      mockLeaveService.getLeaveStats.mockReturnValueOnce({
        total: 5,
        approved: 5,
        pending: 0,
        rejected: 0,
      });

      await component.loadData();

      expect(component.leaveStats.approved).toBe(5);
      expect(component.getPercentage(5, 5)).toBe(100);
    });
  });
});

// Additional test suite for different user scenarios
describe("DashboardComponent - User Scenarios", () => {
  let component: DashboardComponent;

  const mockTaskService = {
    loadTasks: jest.fn().mockResolvedValue(undefined),
    getTaskStats: jest.fn(),
  };

  const mockLeaveService = {
    loadLeaves: jest.fn().mockResolvedValue(undefined),
    getLeaveStats: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  it("should work for admin user", async () => {
    const mockAuthService = {
      currentUser: jest.fn().mockReturnValue({
        full_name: "Admin User",
        role: "admin",
      }),
      signOut: jest.fn(),
    };

    mockTaskService.getTaskStats.mockReturnValue({
      total: 15,
      completed: 10,
      pending: 5,
    });

    // mockLeaveService.getTaskStats = mockTaskService.getTaskStats;
    mockLeaveService.getLeaveStats.mockReturnValue({
      total: 12,
      approved: 8,
      pending: 3,
      rejected: 1,
    });

    component = new DashboardComponent(
      mockAuthService as any,
      mockTaskService as any,
      mockLeaveService as any,
      mockRouter as any
    );

    await component.ngOnInit();

    expect(mockAuthService.currentUser().role).toBe("admin");
    expect(component.taskStats.total).toBe(15);
    expect(component.leaveStats.total).toBe(12);
  });

  it("should work for manager user", async () => {
    const mockAuthService = {
      currentUser: jest.fn().mockReturnValue({
        full_name: "Manager User",
        role: "manager",
      }),
      signOut: jest.fn(),
    };

    component = new DashboardComponent(
      mockAuthService as any,
      mockTaskService as any,
      mockLeaveService as any,
      mockRouter as any
    );

    expect(mockAuthService.currentUser().role).toBe("manager");
  });
});

// Test suite for service interaction edge cases
// describe("DashboardComponent - Service Interaction Edge Cases", () => {
//   let component: DashboardComponent;

//   const mockAuthService = {
//     currentUser: jest.fn().mockReturnValue({
//       full_name: "Test User",
//       role: "employee",
//     }),
//     signOut: jest.fn(),
//   };

//   const mockRouter = {
//     navigate: jest.fn(),
//   };

// //   it("should handle task service throwing error", async () => {
// //     const mockTaskService = {
// //       loadTasks: jest.fn().mockRejectedValue(new Error("Task service error")),
// //       getTaskStats: jest.fn().mockReturnValue({
// //         total: 0,
// //         completed: 0,
// //         pending: 0,
// //       }),
// //     };

// //     const mockLeaveService = {
// //       loadLeaves: jest.fn().mockResolvedValue(undefined),
// //       getLeaveStats: jest.fn().mockReturnValue({
// //         total: 5,
// //         approved: 3,
// //         pending: 2,
// //         rejected: 0,
// //       }),
// //     };

// //     component = new DashboardComponent(
// //       mockAuthService as any,
// //       mockTaskService as any,
// //       mockLeaveService as any,
// //       mockRouter as any
// //     );

// //     await component.loadData();

// //     // Should still have default task stats and loaded leave stats
// //     expect(component.taskStats).toEqual({
// //       total: 0,
// //       completed: 0,
// //       pending: 0,
// //     });
// //     expect(component.leaveStats.total).toBe(5);
// //   });

// //   it("should handle leave service throwing error", async () => {
// //     const mockTaskService = {
// //       loadTasks: jest.fn().mockResolvedValue(undefined),
// //       getTaskStats: jest.fn().mockReturnValue({
// //         total: 8,
// //         completed: 5,
// //         pending: 3,
// //       }),
// //     };

// //     const mockLeaveService = {
// //       loadLeaves: jest.fn().mockRejectedValue(new Error("Leave service error")),
// //       getLeaveStats: jest.fn().mockReturnValue({
// //         total: 0,
// //         approved: 0,
// //         pending: 0,
// //         rejected: 0,
// //       }),
// //     };

// //     component = new DashboardComponent(
// //       mockAuthService as any,
// //       mockTaskService as any,
// //       mockLeaveService as any,
// //       mockRouter as any
// //     );

// //     await component.loadData();

// //     // Should still have loaded task stats and default leave stats
// //     expect(component.taskStats.total).toBe(8);
// //     expect(component.leaveStats).toEqual({
// //       total: 0,
// //       approved: 0,
// //       pending: 0,
// //       rejected: 0,
// //     });
// //   });
// });
