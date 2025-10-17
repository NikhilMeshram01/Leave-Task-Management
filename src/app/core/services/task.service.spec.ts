import { TaskService } from "./task.service";
import { SupabaseService } from "./supabase.service";
import { AuthService } from "./auth.service";
import { CreateTaskDto, UpdateTaskDto, TaskFilter } from "../models/task.model";

describe("TaskService - Comprehensive Tests", () => {
  let taskService: TaskService;
  let mockSupabaseService: any;
  let mockAuthService: any;

  beforeEach(() => {
    // Mock SupabaseService
    mockSupabaseService = {
      client: {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(),
            })),
            order: jest.fn(),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(),
              })),
            })),
          })),
          delete: jest.fn(() => ({
            eq: jest.fn(),
          })),
        })),
      },
    };

    // Mock AuthService
    mockAuthService = {
      currentUser: jest.fn(),
    };

    // Create TaskService instance
    taskService = new TaskService(
      mockSupabaseService as any,
      mockAuthService as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Basic service tests
  describe("Service Initialization", () => {
    it("should create TaskService instance", () => {
      expect(taskService).toBeTruthy();
    });

    it("should initialize with default signal values", () => {
      expect(taskService.tasks()).toEqual([]);
      expect(taskService.filteredTasks()).toEqual([]);
      expect(taskService.currentFilter()).toBe("all");
      expect(taskService.isLoading()).toBe(false);
    });
  });

  // loadTasks tests
  describe("loadTasks", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      role: "employee",
    };

    const mockTasks = [
      {
        id: "task-1",
        user_id: "user-123",
        title: "Complete project documentation",
        description: "Write comprehensive documentation for the project",
        status: "pending" as const,
        due_date: "2024-01-15",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "task-2",
        user_id: "user-123",
        title: "Fix login bug",
        description: "Resolve the authentication issue",
        status: "completed" as const,
        due_date: "2024-01-10",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ];

    // it("should load tasks successfully for employee", async () => {
    //   mockAuthService.currentUser.mockReturnValue(mockUser);

    //   const mockQueryChain = {
    //     eq: jest.fn().mockReturnThis(),
    //     order: jest.fn().mockResolvedValue({ data: mockTasks, error: null }),
    //   };

    //   const mockFromChain = {
    //     select: jest.fn().mockReturnValue(mockQueryChain),
    //   };

    //   mockSupabaseService.client.from.mockReturnValue(mockFromChain);

    //   await taskService.loadTasks();

    //   expect(mockAuthService.currentUser).toHaveBeenCalled();
    //   expect(mockSupabaseService.client.from).toHaveBeenCalledWith("tasks");
    //   expect(mockQueryChain.eq).toHaveBeenCalledWith("user_id", "user-123");
    //   expect(taskService.tasks()).toEqual(mockTasks);
    //   expect(taskService.filteredTasks()).toEqual(mockTasks); // Should apply "all" filter
    //   expect(taskService.isLoading()).toBe(false);
    // });

    it("should load tasks successfully for admin", async () => {
      const adminUser = { ...mockUser, role: "admin" };
      mockAuthService.currentUser.mockReturnValue(adminUser);

      const mockQueryChain = {
        order: jest.fn().mockResolvedValue({ data: mockTasks, error: null }),
      };

      const mockFromChain = {
        select: jest.fn().mockReturnValue(mockQueryChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await taskService.loadTasks();

      expect(mockAuthService.currentUser).toHaveBeenCalled();
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("tasks");
      // Admin should not have eq filter for user_id
      expect(mockQueryChain.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(taskService.tasks()).toEqual(mockTasks);
    });

    it("should handle no user logged in", async () => {
      mockAuthService.currentUser.mockReturnValue(null);

      await taskService.loadTasks();

      expect(mockAuthService.currentUser).toHaveBeenCalled();
      expect(mockSupabaseService.client.from).not.toHaveBeenCalled();
      expect(taskService.tasks()).toEqual([]);
    });

    it("should handle load tasks error", async () => {
      mockAuthService.currentUser.mockReturnValue(mockUser);

      const mockQueryChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: new Error("Database error"),
        }),
      };

      const mockFromChain = {
        select: jest.fn().mockReturnValue(mockQueryChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await taskService.loadTasks();

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("tasks");
      expect(taskService.tasks()).toEqual([]);
      expect(taskService.isLoading()).toBe(false);
    });

    // it("should set loading state correctly", async () => {
    //   mockAuthService.currentUser.mockReturnValue(mockUser);

    //   const mockQueryChain = {
    //     eq: jest.fn().mockReturnThis(),
    //     order: jest.fn().mockResolvedValue({ data: mockTasks, error: null }),
    //   };

    //   const mockFromChain = {
    //     select: jest.fn().mockReturnValue(mockQueryChain),
    //   };

    //   mockSupabaseService.client.from.mockReturnValue(mockFromChain);

    //   // Check initial loading state
    //   expect(taskService.isLoading()).toBe(false);

    //   const loadPromise = taskService.loadTasks();

    //   // Loading should be true during operation
    //   expect(taskService.isLoading()).toBe(true);

    //   await loadPromise;

    //   // Loading should be false after completion
    //   expect(taskService.isLoading()).toBe(false);
    // });
  });

  // createTask tests
  describe("createTask", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      role: "employee",
    };

    const createTaskData: CreateTaskDto = {
      title: "New Task",
      description: "Task description",
      due_date: "2024-01-20",
    };

    const mockCreatedTask = {
      id: "new-task-1",
      user_id: "user-123",
      title: "New Task",
      description: "Task description", // Required in Task interface
      status: "pending" as const,
      due_date: "2024-01-20",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    it("should create task successfully", async () => {
      mockAuthService.currentUser.mockReturnValue(mockUser);

      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockCreatedTask, error: null }),
      };

      const mockFromChain = {
        insert: jest.fn().mockReturnValue(mockInsertChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await taskService.createTask(createTaskData);

      expect(mockAuthService.currentUser).toHaveBeenCalled();
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("tasks");
      expect(mockFromChain.insert).toHaveBeenCalledWith([
        {
          user_id: "user-123",
          ...createTaskData,
          status: "pending",
        },
      ]);
      expect(taskService.tasks()).toEqual([mockCreatedTask]);
      expect(taskService.filteredTasks()).toEqual([mockCreatedTask]); // Should apply filter
    });

    it("should handle no user logged in", async () => {
      mockAuthService.currentUser.mockReturnValue(null);

      await taskService.createTask(createTaskData);

      expect(mockAuthService.currentUser).toHaveBeenCalled();
      expect(mockSupabaseService.client.from).not.toHaveBeenCalled();
    });

    it("should handle create task error", async () => {
      mockAuthService.currentUser.mockReturnValue(mockUser);

      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error("Insert failed"),
        }),
      };

      const mockFromChain = {
        insert: jest.fn().mockReturnValue(mockInsertChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await expect(taskService.createTask(createTaskData)).rejects.toThrow(
        "Insert failed"
      );
      expect(taskService.tasks()).toEqual([]);
    });

    it("should add new task to existing tasks", async () => {
      mockAuthService.currentUser.mockReturnValue(mockUser);

      // Set existing tasks first
      taskService.tasks.set([mockCreatedTask]);

      const newTaskData: CreateTaskDto = {
        title: "Another Task",
        description: "Another description",
        due_date: "2024-01-25",
      };

      const newMockTask = {
        id: "new-task-2",
        user_id: "user-123",
        title: "Another Task",
        description: "Another description",
        status: "pending" as const,
        due_date: "2024-01-25",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      };

      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: newMockTask, error: null }),
      };

      const mockFromChain = {
        insert: jest.fn().mockReturnValue(mockInsertChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await taskService.createTask(newTaskData);

      expect(taskService.tasks()).toEqual([newMockTask, mockCreatedTask]);
    });

    it("should handle task creation with optional description", async () => {
      mockAuthService.currentUser.mockReturnValue(mockUser);

      const taskDataWithoutDescription: CreateTaskDto = {
        title: "Task without description",
        // description is optional in CreateTaskDto
      };

      const mockTaskWithoutDescription = {
        id: "new-task-3",
        user_id: "user-123",
        title: "Task without description",
        description: "", // In Task interface, description is required, so it should have a value
        status: "pending" as const,
        due_date: null,
        created_at: "2024-01-03T00:00:00Z",
        updated_at: "2024-01-03T00:00:00Z",
      };

      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockTaskWithoutDescription, error: null }),
      };

      const mockFromChain = {
        insert: jest.fn().mockReturnValue(mockInsertChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await taskService.createTask(taskDataWithoutDescription);

      expect(mockFromChain.insert).toHaveBeenCalledWith([
        {
          user_id: "user-123",
          ...taskDataWithoutDescription,
          status: "pending",
        },
      ]);
    });
  });

  // updateTask tests
  describe("updateTask", () => {
    const mockTasks = [
      {
        id: "task-1",
        user_id: "user-123",
        title: "Task 1",
        description: "Description 1",
        status: "pending" as const,
        due_date: "2024-01-15",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "task-2",
        user_id: "user-123",
        title: "Task 2",
        description: "Description 2",
        status: "completed" as const,
        due_date: "2024-01-10",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ];

    const updateData: UpdateTaskDto = {
      status: "completed",
    };

    const updatedTask = {
      ...mockTasks[0],
      ...updateData,
    };

    it("should update task successfully", async () => {
      // Set initial tasks
      taskService.tasks.set(mockTasks);

      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedTask, error: null }),
      };

      const mockFromChain = {
        update: jest.fn().mockReturnValue(mockUpdateChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await taskService.updateTask("task-1", updateData);

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("tasks");
      expect(mockFromChain.update).toHaveBeenCalledWith(updateData);
      expect(mockUpdateChain.eq).toHaveBeenCalledWith("id", "task-1");
      expect(taskService.tasks()).toEqual([updatedTask, mockTasks[1]]);
      // Should apply filter after update
      expect(taskService.filteredTasks().length).toBeGreaterThan(0);
    });

    it("should handle update task error", async () => {
      taskService.tasks.set(mockTasks);

      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error("Update failed"),
        }),
      };

      const mockFromChain = {
        update: jest.fn().mockReturnValue(mockUpdateChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await expect(
        taskService.updateTask("task-1", updateData)
      ).rejects.toThrow("Update failed");
      // Tasks should remain unchanged
      expect(taskService.tasks()).toEqual(mockTasks);
    });

    it("should handle updating non-existent task", async () => {
      taskService.tasks.set(mockTasks);

      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const mockFromChain = {
        update: jest.fn().mockReturnValue(mockUpdateChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await taskService.updateTask("non-existent-id", updateData);

      // Tasks should remain unchanged
      expect(taskService.tasks()).toEqual(mockTasks);
    });
  });

  // deleteTask tests
  describe("deleteTask", () => {
    const mockTasks = [
      {
        id: "task-1",
        user_id: "user-123",
        title: "Task 1",
        description: "Description 1",
        status: "pending" as const,
        due_date: "2024-01-15",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "task-2",
        user_id: "user-123",
        title: "Task 2",
        description: "Description 2",
        status: "completed" as const,
        due_date: "2024-01-10",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ];

    it("should delete task successfully", async () => {
      taskService.tasks.set(mockTasks);

      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockFromChain = {
        delete: jest.fn().mockReturnValue(mockDeleteChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await taskService.deleteTask("task-1");

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("tasks");
      expect(mockDeleteChain.eq).toHaveBeenCalledWith("id", "task-1");
      expect(taskService.tasks()).toEqual([mockTasks[1]]);
      // Should apply filter after delete
      expect(taskService.filteredTasks().length).toBeGreaterThan(0);
    });

    it("should handle delete task error", async () => {
      taskService.tasks.set(mockTasks);

      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: new Error("Delete failed") }),
      };

      const mockFromChain = {
        delete: jest.fn().mockReturnValue(mockDeleteChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await expect(taskService.deleteTask("task-1")).rejects.toThrow(
        "Delete failed"
      );
      // Tasks should remain unchanged
      expect(taskService.tasks()).toEqual(mockTasks);
    });

    it("should handle deleting non-existent task", async () => {
      taskService.tasks.set(mockTasks);

      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockFromChain = {
        delete: jest.fn().mockReturnValue(mockDeleteChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await taskService.deleteTask("non-existent-id");

      // Tasks should remain unchanged
      expect(taskService.tasks()).toEqual(mockTasks);
    });
  });

  // Filtering tests
  describe("Filtering", () => {
    const mockTasks = [
      {
        id: "task-1",
        user_id: "user-123",
        title: "Pending Task",
        description: "Description 1",
        status: "pending" as const,
        due_date: "2024-01-15",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "task-2",
        user_id: "user-123",
        title: "Completed Task",
        description: "Description 2",
        status: "completed" as const,
        due_date: "2024-01-10",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
      {
        id: "task-3",
        user_id: "user-123",
        title: "Another Pending Task",
        description: "Description 3",
        status: "pending" as const,
        due_date: "2024-01-20",
        created_at: "2024-01-03T00:00:00Z",
        updated_at: "2024-01-03T00:00:00Z",
      },
    ];

    beforeEach(() => {
      taskService.tasks.set(mockTasks);
    });

    it("should set filter to 'all' and show all tasks", () => {
      taskService.setFilter("all");

      expect(taskService.currentFilter()).toBe("all");
      expect(taskService.filteredTasks()).toEqual(mockTasks);
    });

    it("should set filter to 'pending' and show only pending tasks", () => {
      taskService.setFilter("pending");

      expect(taskService.currentFilter()).toBe("pending");
      expect(taskService.filteredTasks()).toEqual([mockTasks[0], mockTasks[2]]);
    });

    it("should set filter to 'completed' and show only completed tasks", () => {
      taskService.setFilter("completed");

      expect(taskService.currentFilter()).toBe("completed");
      expect(taskService.filteredTasks()).toEqual([mockTasks[1]]);
    });

    it("should apply filter automatically after operations", async () => {
      // Set filter to pending first
      taskService.setFilter("pending");
      expect(taskService.filteredTasks().length).toBe(2);

      // Update a task to completed
      const updatedTask = { ...mockTasks[0], status: "completed" as const };
      taskService.tasks.update((tasks) =>
        tasks.map((task) => (task.id === "task-1" ? updatedTask : task))
      );

      // Manually trigger filter application (simulating what happens after update)
      (taskService as any).applyFilter("pending");

      // Should now show only one pending task
      expect(taskService.filteredTasks().length).toBe(1);
    });
  });

  // getTaskStats tests
  describe("getTaskStats", () => {
    it("should calculate correct stats with mixed statuses", () => {
      const mockTasks = [
        { id: "1", status: "completed" as const },
        { id: "2", status: "pending" as const },
        { id: "3", status: "completed" as const },
        { id: "4", status: "pending" as const },
        { id: "5", status: "pending" as const },
        { id: "6", status: "completed" as const },
      ];

      taskService.tasks.set(mockTasks as any);

      const stats = taskService.getTaskStats();

      expect(stats).toEqual({
        total: 6,
        completed: 3,
        pending: 3,
      });
    });

    it("should handle empty tasks array", () => {
      taskService.tasks.set([]);

      const stats = taskService.getTaskStats();

      expect(stats).toEqual({
        total: 0,
        completed: 0,
        pending: 0,
      });
    });

    it("should handle only completed tasks", () => {
      const mockTasks = [
        { id: "1", status: "completed" as const },
        { id: "2", status: "completed" as const },
        { id: "3", status: "completed" as const },
      ];

      taskService.tasks.set(mockTasks as any);

      const stats = taskService.getTaskStats();

      expect(stats).toEqual({
        total: 3,
        completed: 3,
        pending: 0,
      });
    });

    it("should handle only pending tasks", () => {
      const mockTasks = [
        { id: "1", status: "pending" as const },
        { id: "2", status: "pending" as const },
      ];

      taskService.tasks.set(mockTasks as any);

      const stats = taskService.getTaskStats();

      expect(stats).toEqual({
        total: 2,
        completed: 0,
        pending: 2,
      });
    });
  });
});

// Additional test suite for edge cases
describe("TaskService - Edge Cases", () => {
  let taskService: TaskService;
  let mockSupabaseService: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockSupabaseService = {
      client: {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(),
            })),
            order: jest.fn(),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(),
              })),
            })),
          })),
          delete: jest.fn(() => ({
            eq: jest.fn(),
          })),
        })),
      },
    };

    mockAuthService = {
      currentUser: jest.fn(),
    };

    taskService = new TaskService(
      mockSupabaseService as any,
      mockAuthService as any
    );
  });

  //   it("should handle manager role in loadTasks", async () => {
  //     const managerUser = {
  //       id: "manager-123",
  //       email: "manager@example.com",
  //       full_name: "Manager User",
  //       role: "manager",
  //     };

  //     mockAuthService.currentUser.mockReturnValue(managerUser);

  //     const mockTasks = [
  //       {
  //         id: "task-1",
  //         user_id: "user-123",
  //         title: "Task 1",
  //         description: "Description 1",
  //         status: "pending" as const,
  //         due_date: "2024-01-15",
  //         created_at: "2024-01-01T00:00:00Z",
  //         updated_at: "2024-01-01T00:00:00Z",
  //       },
  //     ];

  //     const mockQueryChain = {
  //       eq: jest.fn().mockReturnThis(),
  //       order: jest.fn().mockResolvedValue({ data: mockTasks, error: null }),
  //     };

  //     const mockFromChain = {
  //       select: jest.fn().mockReturnValue(mockQueryChain),
  //     };

  //     mockSupabaseService.client.from.mockReturnValue(mockFromChain);

  //     await taskService.loadTasks();

  //     // Manager should be treated like employee (non-admin)
  //     expect(mockQueryChain.eq).toHaveBeenCalledWith("user_id", "manager-123");
  //   });

  it("should handle task creation with optional fields", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      role: "employee",
    };

    mockAuthService.currentUser.mockReturnValue(mockUser);

    const minimalTaskData: CreateTaskDto = {
      title: "Minimal Task",
      // description and due_date are optional in CreateTaskDto
    };

    const mockMinimalTask = {
      id: "new-task-1",
      user_id: "user-123",
      title: "Minimal Task",
      description: "", // In Task interface, description is required, so it should have a value
      status: "pending" as const,
      due_date: null, // In Task interface, due_date can be null
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    const mockInsertChain = {
      select: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: mockMinimalTask, error: null }),
    };

    const mockFromChain = {
      insert: jest.fn().mockReturnValue(mockInsertChain),
    };

    mockSupabaseService.client.from.mockReturnValue(mockFromChain);

    await taskService.createTask(minimalTaskData);

    expect(mockFromChain.insert).toHaveBeenCalledWith([
      {
        user_id: "user-123",
        ...minimalTaskData,
        status: "pending",
      },
    ]);
  });

  it("should handle filter changes with empty tasks", () => {
    taskService.tasks.set([]);

    taskService.setFilter("pending");
    expect(taskService.filteredTasks()).toEqual([]);

    taskService.setFilter("completed");
    expect(taskService.filteredTasks()).toEqual([]);

    taskService.setFilter("all");
    expect(taskService.filteredTasks()).toEqual([]);
  });
});
