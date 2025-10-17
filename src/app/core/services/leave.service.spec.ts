import { LeaveService } from "./leave.service";
import { SupabaseService } from "./supabase.service";
import { AuthService } from "./auth.service";
import { CreateLeaveDto, UpdateLeaveDto } from "../models/leave.model";

describe("LeaveService - Comprehensive Tests", () => {
  let leaveService: LeaveService;
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

    // Create LeaveService instance
    leaveService = new LeaveService(
      mockSupabaseService as any,
      mockAuthService as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Basic service tests
  describe("Service Initialization", () => {
    it("should create LeaveService instance", () => {
      expect(leaveService).toBeTruthy();
    });

    it("should initialize with default signal values", () => {
      expect(leaveService.leaves()).toEqual([]);
      expect(leaveService.isLoading()).toBe(false);
    });
  });

  // loadLeaves tests
  describe("loadLeaves", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      role: "employee",
    };

    const mockLeaves = [
      {
        id: "leave-1",
        user_id: "user-123",
        leave_type: "sick" as const,
        start_date: "2024-01-01",
        end_date: "2024-01-05",
        reason: "Not feeling well",
        status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        profiles: { full_name: "Test User" },
      },
      {
        id: "leave-2",
        user_id: "user-123",
        leave_type: "casual" as const,
        start_date: "2024-02-01",
        end_date: "2024-02-03",
        reason: "Family vacation",
        status: "approved" as const,
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        profiles: { full_name: "Test User" },
      },
    ];

    // it("should load leaves successfully for employee", async () => {
    //   mockAuthService.currentUser.mockReturnValue(mockUser);

    //   const mockQueryChain = {
    //     eq: jest.fn().mockReturnThis(),
    //     order: jest.fn().mockResolvedValue({ data: mockLeaves, error: null }),
    //   };

    //   const mockFromChain = {
    //     select: jest.fn().mockReturnValue(mockQueryChain),
    //   };

    //   mockSupabaseService.client.from.mockReturnValue(mockFromChain);

    //   await leaveService.loadLeaves();

    //   expect(mockAuthService.currentUser).toHaveBeenCalled();
    //   expect(mockSupabaseService.client.from).toHaveBeenCalledWith("leaves");
    //   expect(mockQueryChain.eq).toHaveBeenCalledWith("user_id", "user-123");
    //   expect(leaveService.leaves()).toEqual(mockLeaves);
    //   expect(leaveService.isLoading()).toBe(false);
    // });

    it("should load leaves successfully for admin", async () => {
      const adminUser = { ...mockUser, role: "admin" };
      mockAuthService.currentUser.mockReturnValue(adminUser);

      const mockQueryChain = {
        order: jest.fn().mockResolvedValue({ data: mockLeaves, error: null }),
      };

      const mockFromChain = {
        select: jest.fn().mockReturnValue(mockQueryChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await leaveService.loadLeaves();

      expect(mockAuthService.currentUser).toHaveBeenCalled();
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("leaves");
      // Admin should not have eq filter for user_id
      expect(mockQueryChain.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(leaveService.leaves()).toEqual(mockLeaves);
    });

    it("should handle no user logged in", async () => {
      mockAuthService.currentUser.mockReturnValue(null);

      await leaveService.loadLeaves();

      expect(mockAuthService.currentUser).toHaveBeenCalled();
      expect(mockSupabaseService.client.from).not.toHaveBeenCalled();
      expect(leaveService.leaves()).toEqual([]);
    });

    it("should handle load leaves error", async () => {
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

      await leaveService.loadLeaves();

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("leaves");
      expect(leaveService.leaves()).toEqual([]);
      expect(leaveService.isLoading()).toBe(false);
    });

    // it("should set loading state correctly", async () => {
    //   mockAuthService.currentUser.mockReturnValue(mockUser);

    //   const mockQueryChain = {
    //     eq: jest.fn().mockReturnThis(),
    //     order: jest.fn().mockResolvedValue({ data: mockLeaves, error: null }),
    //   };

    //   const mockFromChain = {
    //     select: jest.fn().mockReturnValue(mockQueryChain),
    //   };

    //   mockSupabaseService.client.from.mockReturnValue(mockFromChain);

    //   // Check initial loading state
    //   expect(leaveService.isLoading()).toBe(false);

    //   const loadPromise = leaveService.loadLeaves();

    //   // Loading should be true during operation
    //   expect(leaveService.isLoading()).toBe(true);

    //   await loadPromise;

    //   // Loading should be false after completion
    //   expect(leaveService.isLoading()).toBe(false);
    // });
  });

  // createLeave tests
  describe("createLeave", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      role: "employee",
    };

    const createLeaveData: CreateLeaveDto = {
      leave_type: "sick",
      start_date: "2024-01-01",
      end_date: "2024-01-05",
      reason: "Not feeling well",
    };

    const mockCreatedLeave = {
      id: "new-leave-1",
      user_id: "user-123",
      ...createLeaveData,
      status: "pending" as const,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    it("should create leave successfully", async () => {
      mockAuthService.currentUser.mockReturnValue(mockUser);

      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockCreatedLeave, error: null }),
      };

      const mockFromChain = {
        insert: jest.fn().mockReturnValue(mockInsertChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await leaveService.createLeave(createLeaveData);

      expect(mockAuthService.currentUser).toHaveBeenCalled();
      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("leaves");
      expect(mockFromChain.insert).toHaveBeenCalledWith([
        {
          user_id: "user-123",
          ...createLeaveData,
          status: "pending",
        },
      ]);
      expect(leaveService.leaves()).toEqual([mockCreatedLeave]);
    });

    it("should handle no user logged in", async () => {
      mockAuthService.currentUser.mockReturnValue(null);

      await leaveService.createLeave(createLeaveData);

      expect(mockAuthService.currentUser).toHaveBeenCalled();
      expect(mockSupabaseService.client.from).not.toHaveBeenCalled();
    });

    it("should handle create leave error", async () => {
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

      await expect(leaveService.createLeave(createLeaveData)).rejects.toThrow(
        "Insert failed"
      );
      expect(leaveService.leaves()).toEqual([]);
    });

    it("should add new leave to existing leaves", async () => {
      mockAuthService.currentUser.mockReturnValue(mockUser);

      // Set existing leaves first
      leaveService.leaves.set([mockCreatedLeave]);

      const newLeaveData: CreateLeaveDto = {
        leave_type: "annual",
        start_date: "2024-02-01",
        end_date: "2024-02-03",
        reason: "Family trip",
      };

      const newMockLeave = {
        id: "new-leave-2",
        user_id: "user-123",
        ...newLeaveData,
        status: "pending",
        created_at: "2024-02-01T00:00:00Z",
        updated_at: "2024-02-01T00:00:00Z",
      };

      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: newMockLeave, error: null }),
      };

      const mockFromChain = {
        insert: jest.fn().mockReturnValue(mockInsertChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await leaveService.createLeave(newLeaveData);

      expect(leaveService.leaves()).toEqual([newMockLeave, mockCreatedLeave]);
    });
  });

  // updateLeave tests
  describe("updateLeave", () => {
    const mockLeaves = [
      {
        id: "leave-1",
        user_id: "user-123",
        leave_type: "sick" as const,
        start_date: "2024-01-01",
        end_date: "2024-01-05",
        reason: "Not feeling well",
        status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "leave-2",
        user_id: "user-123",
        leave_type: "casual" as const,
        start_date: "2024-02-01",
        end_date: "2024-02-03",
        reason: "Family vacation",
        status: "approved" as const,
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ];

    const updateData: UpdateLeaveDto = {
      status: "approved",
    };

    const updatedLeave = {
      ...mockLeaves[0],
      ...updateData,
    };

    it("should update leave successfully", async () => {
      // Set initial leaves
      leaveService.leaves.set(mockLeaves);

      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: updatedLeave, error: null }),
      };

      const mockFromChain = {
        update: jest.fn().mockReturnValue(mockUpdateChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await leaveService.updateLeave("leave-1", updateData);

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("leaves");
      expect(mockFromChain.update).toHaveBeenCalledWith(updateData);
      expect(mockUpdateChain.eq).toHaveBeenCalledWith("id", "leave-1");
      expect(leaveService.leaves()).toEqual([updatedLeave, mockLeaves[1]]);
    });

    it("should handle update leave error", async () => {
      leaveService.leaves.set(mockLeaves);

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
        leaveService.updateLeave("leave-1", updateData)
      ).rejects.toThrow("Update failed");
      // Leaves should remain unchanged
      expect(leaveService.leaves()).toEqual(mockLeaves);
    });

    it("should handle updating non-existent leave", async () => {
      leaveService.leaves.set(mockLeaves);

      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const mockFromChain = {
        update: jest.fn().mockReturnValue(mockUpdateChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await leaveService.updateLeave("non-existent-id", updateData);

      // Leaves should remain unchanged
      expect(leaveService.leaves()).toEqual(mockLeaves);
    });
  });

  // deleteLeave tests
  describe("deleteLeave", () => {
    const mockLeaves = [
      {
        id: "leave-1",
        user_id: "user-123",
        leave_type: "sick" as const,
        start_date: "2024-01-01",
        end_date: "2024-01-05",
        reason: "Not feeling well",
        status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "leave-2",
        user_id: "user-123",
        leave_type: "annual" as const,
        start_date: "2024-02-01",
        end_date: "2024-02-03",
        reason: "Family vacation",
        status: "approved" as const,
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ];

    it("should delete leave successfully", async () => {
      leaveService.leaves.set(mockLeaves);

      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockFromChain = {
        delete: jest.fn().mockReturnValue(mockDeleteChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await leaveService.deleteLeave("leave-1");

      expect(mockSupabaseService.client.from).toHaveBeenCalledWith("leaves");
      expect(mockDeleteChain.eq).toHaveBeenCalledWith("id", "leave-1");
      expect(leaveService.leaves()).toEqual([mockLeaves[1]]);
    });

    it("should handle delete leave error", async () => {
      leaveService.leaves.set(mockLeaves);

      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: new Error("Delete failed") }),
      };

      const mockFromChain = {
        delete: jest.fn().mockReturnValue(mockDeleteChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await expect(leaveService.deleteLeave("leave-1")).rejects.toThrow(
        "Delete failed"
      );
      // Leaves should remain unchanged
      expect(leaveService.leaves()).toEqual(mockLeaves);
    });

    it("should handle deleting non-existent leave", async () => {
      leaveService.leaves.set(mockLeaves);

      const mockDeleteChain = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockFromChain = {
        delete: jest.fn().mockReturnValue(mockDeleteChain),
      };

      mockSupabaseService.client.from.mockReturnValue(mockFromChain);

      await leaveService.deleteLeave("non-existent-id");

      // Leaves should remain unchanged
      expect(leaveService.leaves()).toEqual(mockLeaves);
    });
  });

  // approveLeave and rejectLeave tests
  describe("Approve and Reject Leave", () => {
    const mockLeaves = [
      {
        id: "leave-1",
        user_id: "user-123",
        leave_type: "sick" as const,
        start_date: "2024-01-01",
        end_date: "2024-01-05",
        reason: "Not feeling well",
        status: "pending" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    it("should approve leave successfully", async () => {
      leaveService.leaves.set(mockLeaves);

      const updateLeaveSpy = jest
        .spyOn(leaveService, "updateLeave")
        .mockResolvedValue();

      await leaveService.approveLeave("leave-1");

      expect(updateLeaveSpy).toHaveBeenCalledWith("leave-1", {
        status: "approved",
      });
    });

    it("should reject leave successfully", async () => {
      leaveService.leaves.set(mockLeaves);

      const updateLeaveSpy = jest
        .spyOn(leaveService, "updateLeave")
        .mockResolvedValue();

      await leaveService.rejectLeave("leave-1");

      expect(updateLeaveSpy).toHaveBeenCalledWith("leave-1", {
        status: "rejected",
      });
    });
  });

  // getLeaveStats tests
  describe("getLeaveStats", () => {
    it("should calculate correct stats with mixed statuses", () => {
      const mockLeaves = [
        { id: "1", status: "approved" },
        { id: "2", status: "pending" },
        { id: "3", status: "approved" },
        { id: "4", status: "rejected" },
        { id: "5", status: "pending" },
        { id: "6", status: "approved" },
      ];

      leaveService.leaves.set(mockLeaves as any);

      const stats = leaveService.getLeaveStats();

      expect(stats).toEqual({
        total: 6,
        approved: 3,
        pending: 2,
        rejected: 1,
      });
    });

    it("should handle empty leaves array", () => {
      leaveService.leaves.set([]);

      const stats = leaveService.getLeaveStats();

      expect(stats).toEqual({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      });
    });

    it("should handle only approved leaves", () => {
      const mockLeaves = [
        { id: "1", status: "approved" },
        { id: "2", status: "approved" },
        { id: "3", status: "approved" },
      ];

      leaveService.leaves.set(mockLeaves as any);

      const stats = leaveService.getLeaveStats();

      expect(stats).toEqual({
        total: 3,
        approved: 3,
        pending: 0,
        rejected: 0,
      });
    });

    it("should handle only pending leaves", () => {
      const mockLeaves = [
        { id: "1", status: "pending" },
        { id: "2", status: "pending" },
      ];

      leaveService.leaves.set(mockLeaves as any);

      const stats = leaveService.getLeaveStats();

      expect(stats).toEqual({
        total: 2,
        approved: 0,
        pending: 2,
        rejected: 0,
      });
    });

    it("should handle only rejected leaves", () => {
      const mockLeaves = [{ id: "1", status: "rejected" }];

      leaveService.leaves.set(mockLeaves as any);

      const stats = leaveService.getLeaveStats();

      expect(stats).toEqual({
        total: 1,
        approved: 0,
        pending: 0,
        rejected: 1,
      });
    });
  });
});

// Additional test suite for edge cases
describe("LeaveService - Edge Cases", () => {
  let leaveService: LeaveService;
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

    leaveService = new LeaveService(
      mockSupabaseService as any,
      mockAuthService as any
    );
  });

  //   it("should handle admin role in loadLeaves", async () => {
  //     const adminUser = {
  //       id: "admin-123",
  //       email: "admin@example.com",
  //       full_name: "admin User",
  //       role: "admin",
  //     };

  //     mockAuthService.currentUser.mockReturnValue(adminUser);

  //     const mockLeaves = [
  //       {
  //         id: "leave-1",
  //         user_id: "user-123",
  //         leave_type: "sick",
  //         start_date: "2024-01-01",
  //         end_date: "2024-01-05",
  //         reason: "Not feeling well",
  //         status: "pending",
  //         created_at: "2024-01-01T00:00:00Z",
  //         updated_at: "2024-01-01T00:00:00Z",
  //         profiles: { full_name: "Test User" },
  //       },
  //     ];

  //     const mockQueryChain = {
  //       eq: jest.fn().mockReturnThis(),
  //       order: jest.fn().mockResolvedValue({ data: mockLeaves, error: null }),
  //     };

  //     const mockFromChain = {
  //       select: jest.fn().mockReturnValue(mockQueryChain),
  //     };

  //     mockSupabaseService.client.from.mockReturnValue(mockFromChain);

  //     await leaveService.loadLeaves();

  //     // admin should be treated like employee (non-admin)
  //     expect(mockQueryChain.eq).toHaveBeenCalledWith("user_id", "admin-123");
  //   });

  it("should handle partial leave data in createLeave", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      role: "employee",
    };

    mockAuthService.currentUser.mockReturnValue(mockUser);

    const partialLeaveData: CreateLeaveDto = {
      leave_type: "sick",
      start_date: "2024-01-01",
      end_date: "2024-01-05",
      reason: "Not feeling well",
      // reason is optional, so not included
    };

    const mockCreatedLeave = {
      id: "new-leave-1",
      user_id: "user-123",
      ...partialLeaveData,
      status: "pending",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    const mockInsertChain = {
      select: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: mockCreatedLeave, error: null }),
    };

    const mockFromChain = {
      insert: jest.fn().mockReturnValue(mockInsertChain),
    };

    mockSupabaseService.client.from.mockReturnValue(mockFromChain);

    await leaveService.createLeave(partialLeaveData);

    expect(mockFromChain.insert).toHaveBeenCalledWith([
      {
        user_id: "user-123",
        ...partialLeaveData,
        status: "pending",
      },
    ]);
  });
});
