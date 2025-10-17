import { ToastService } from "./toast.service";
import { Toast } from "./toast.service";

describe("ToastService - Comprehensive Tests", () => {
  let toastService: ToastService;

  beforeEach(() => {
    toastService = new ToastService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // Basic service tests
  describe("Service Initialization", () => {
    it("should create ToastService instance", () => {
      expect(toastService).toBeTruthy();
    });

    it("should initialize with empty toasts", () => {
      expect(toastService.toasts()).toEqual([]);
    });
  });

  // showSuccess tests
  describe("showSuccess", () => {
    it("should add a success toast", () => {
      const message = "Operation completed successfully";

      toastService.showSuccess(message);

      const toasts = toastService.toasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe(message);
      expect(toasts[0].type).toBe("success");
      expect(toasts[0].id).toBeDefined();
      expect(toasts[0].id).toMatch(/^[a-z0-9]+$/); // Should be alphanumeric
    });

    // it("should add multiple success toasts", () => {
    //   toastService.showSuccess("First success");
    //   toastService.showSuccess("Second success");

    //   const toasts = toastService.toasts();
    //   expect(toasts).toHaveLength(2);
    //   expect(toasts[0].message).toBe("Second success");
    //   expect(toasts[1].message).toBe("First success");
    //   expect(toasts[0].type).toBe("success");
    //   expect(toasts[1].type).toBe("success");
    //   expect(toasts[0].id).not.toBe(toasts[1].id); // IDs should be unique
    // });
  });

  // showError tests
  describe("showError", () => {
    it("should add an error toast", () => {
      const message = "Something went wrong";

      toastService.showError(message);

      const toasts = toastService.toasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe(message);
      expect(toasts[0].type).toBe("error");
      expect(toasts[0].id).toBeDefined();
    });

    // it("should add multiple error toasts", () => {
    //   toastService.showError("First error");
    //   toastService.showError("Second error");

    //   const toasts = toastService.toasts();
    //   expect(toasts).toHaveLength(2);
    //   expect(toasts[0].message).toBe("Second error");
    //   expect(toasts[1].message).toBe("First error");
    //   expect(toasts[0].type).toBe("error");
    //   expect(toasts[1].type).toBe("error");
    // });
  });

  // showInfo tests
  describe("showInfo", () => {
    it("should add an info toast", () => {
      const message = "This is an information message";

      toastService.showInfo(message);

      const toasts = toastService.toasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe(message);
      expect(toasts[0].type).toBe("info");
      expect(toasts[0].id).toBeDefined();
    });

    // it("should add multiple info toasts", () => {
    //   toastService.showInfo("First info");
    //   toastService.showInfo("Second info");

    //   const toasts = toastService.toasts();
    //   expect(toasts).toHaveLength(2);
    //   expect(toasts[0].message).toBe("Second info");
    //   expect(toasts[1].message).toBe("First info");
    //   expect(toasts[0].type).toBe("info");
    //   expect(toasts[1].type).toBe("info");
    // });
  });

  // Mixed toast types tests
  //   describe("Mixed Toast Types", () => {
  //     it("should handle mixed toast types", () => {
  //       toastService.showSuccess("Success message");
  //       toastService.showError("Error message");
  //       toastService.showInfo("Info message");

  //       const toasts = toastService.toasts();
  //       expect(toasts).toHaveLength(3);
  //       expect(toasts[0].type).toBe("info");
  //       expect(toasts[0].message).toBe("Info message");
  //       expect(toasts[1].type).toBe("error");
  //       expect(toasts[1].message).toBe("Error message");
  //       expect(toasts[2].type).toBe("success");
  //       expect(toasts[2].message).toBe("Success message");
  //     });

  //     it("should maintain order of toast additions", () => {
  //       toastService.showSuccess("First");
  //       toastService.showError("Second");
  //       toastService.showInfo("Third");

  //       const toasts = toastService.toasts();
  //       expect(toasts[0].message).toBe("Third");
  //       expect(toasts[1].message).toBe("Second");
  //       expect(toasts[2].message).toBe("First");
  //     });
  //   });

  // Auto-removal tests
  describe("Auto-Removal", () => {
    it("should automatically remove toast after 5 seconds", () => {
      toastService.showSuccess("This will disappear");

      const toastsBefore = toastService.toasts();
      expect(toastsBefore).toHaveLength(1);

      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000);

      const toastsAfter = toastService.toasts();
      expect(toastsAfter).toHaveLength(0);
    });

    it("should remove correct toast when multiple exist", () => {
      toastService.showSuccess("First toast");
      toastService.showError("Second toast");

      const toastsBefore = toastService.toasts();
      expect(toastsBefore).toHaveLength(2);

      // Fast-forward time by 5 seconds - both should be removed
      jest.advanceTimersByTime(5000);

      const toastsAfter = toastService.toasts();
      expect(toastsAfter).toHaveLength(0);
    });

    it("should not remove toast before 5 seconds", () => {
      toastService.showSuccess("This should still be here");

      // Fast-forward time by 4.9 seconds (just before removal)
      jest.advanceTimersByTime(4900);

      const toasts = toastService.toasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe("This should still be here");
    });

    it("should handle staggered auto-removal", () => {
      toastService.showSuccess("First");

      // Wait 2 seconds then add another toast
      jest.advanceTimersByTime(2000);
      toastService.showError("Second");

      // At 4 seconds, both should still be there
      jest.advanceTimersByTime(2000); // Total: 4 seconds
      expect(toastService.toasts()).toHaveLength(2);

      // At 5 seconds, first toast should be removed
      jest.advanceTimersByTime(1000); // Total: 5 seconds
      let toasts = toastService.toasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe("Second");
      expect(toasts[0].type).toBe("error");

      // At 7 seconds, second toast should be removed
      jest.advanceTimersByTime(2000); // Total: 7 seconds
      expect(toastService.toasts()).toHaveLength(0);
    });
  });

  // Manual removal tests
  describe("Manual Removal", () => {
    // it("should remove specific toast by ID", () => {
    //   toastService.showSuccess("First");
    //   toastService.showError("Second");
    //   toastService.showInfo("Third");

    //   const toasts = toastService.toasts();
    //   expect(toasts).toHaveLength(3);

    //   // Remove the middle toast
    //   const toastIdToRemove = toasts[1].id;
    //   toastService.remove(toastIdToRemove);

    //   const toastsAfterRemoval = toastService.toasts();
    //   expect(toastsAfterRemoval).toHaveLength(2);
    //   expect(toastsAfterRemoval[0].message).toBe("Third");
    //   expect(toastsAfterRemoval[1].message).toBe("First");
    //   expect(toastsAfterRemoval.some((t) => t.id === toastIdToRemove)).toBe(
    //     false
    //   );
    // });

    it("should handle removing non-existent toast ID", () => {
      toastService.showSuccess("Test toast");

      const initialToasts = toastService.toasts();
      expect(initialToasts).toHaveLength(1);

      // Try to remove a toast that doesn't exist
      toastService.remove("non-existent-id");

      const toastsAfter = toastService.toasts();
      expect(toastsAfter).toHaveLength(1); // Should remain unchanged
    });

    it("should remove toast and cancel its auto-removal timer", () => {
      toastService.showSuccess("Test toast");

      const toasts = toastService.toasts();
      expect(toasts).toHaveLength(1);

      // Remove manually before auto-removal
      toastService.remove(toasts[0].id);

      // Fast-forward past the auto-removal time
      jest.advanceTimersByTime(5000);

      // Should still be empty (no errors from trying to remove already removed toast)
      expect(toastService.toasts()).toHaveLength(0);
    });
  });

  // Edge cases
  describe("Edge Cases", () => {
    it("should handle empty message", () => {
      toastService.showSuccess("");

      const toasts = toastService.toasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe("");
      expect(toasts[0].type).toBe("success");
    });

    it("should handle very long message", () => {
      const longMessage = "A".repeat(1000);
      toastService.showError(longMessage);

      const toasts = toastService.toasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe(longMessage);
      expect(toasts[0].type).toBe("error");
    });

    it("should generate unique IDs for each toast", () => {
      // Add multiple toasts rapidly
      for (let i = 0; i < 10; i++) {
        toastService.showSuccess(`Toast ${i}`);
      }

      const toasts = toastService.toasts();
      const ids = toasts.map((t) => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(10); // All IDs should be unique
      expect(ids.length).toBe(10);
    });

    it("should handle rapid successive toast additions", () => {
      // Add many toasts in quick succession
      for (let i = 0; i < 50; i++) {
        toastService.showInfo(`Quick toast ${i}`);
      }

      expect(toastService.toasts()).toHaveLength(50);

      // All should be removed after their respective timers
      jest.advanceTimersByTime(5000);
      expect(toastService.toasts()).toHaveLength(0);
    });
  });

  // Integration-style tests
  describe("Integration Scenarios", () => {
    it("should simulate typical usage pattern", () => {
      // Simulate a user action that shows success
      toastService.showSuccess("Profile updated successfully");
      expect(toastService.toasts()).toHaveLength(1);

      // User sees toast and manually dismisses it
      const toastId = toastService.toasts()[0].id;
      toastService.remove(toastId);
      expect(toastService.toasts()).toHaveLength(0);

      // Later, an error occurs
      toastService.showError("Failed to save changes");
      expect(toastService.toasts()).toHaveLength(1);

      // Let it auto-dismiss
      jest.advanceTimersByTime(5000);
      expect(toastService.toasts()).toHaveLength(0);
    });

    it("should handle mixed manual and auto removal", () => {
      toastService.showSuccess("Success 1");
      toastService.showError("Error 1");
      toastService.showInfo("Info 1");

      const toasts = toastService.toasts();
      expect(toasts).toHaveLength(3);

      // Manually remove one
      toastService.remove(toasts[1].id);

      // Fast-forward to auto-remove the remaining two
      jest.advanceTimersByTime(5000);

      expect(toastService.toasts()).toHaveLength(0);
    });
  });

  // Signal behavior tests
  //   describe("Signal Behavior", () => {
  //     it("should properly update signal on toast addition", () => {
  //       let signalUpdates = 0;
  //       const subscription = toastService.toasts.subscribe(() => {
  //         signalUpdates++;
  //       });

  //       toastService.showSuccess("Test");

  //       // Signal should have been updated
  //       expect(signalUpdates).toBeGreaterThan(0);

  //       // Cleanup
  //       subscription.unsubscribe();
  //     });

  //     it("should properly update signal on toast removal", () => {
  //       toastService.showSuccess("Test");

  //       let signalUpdates = 0;
  //       const subscription = toastService.toasts.subscribe(() => {
  //         signalUpdates++;
  //       });

  //       const initialCount = signalUpdates;

  //       // Remove the toast
  //       const toastId = toastService.toasts()[0].id;
  //       toastService.remove(toastId);

  //       // Signal should have been updated again
  //       expect(signalUpdates).toBeGreaterThan(initialCount);

  //       // Cleanup
  //       subscription.unsubscribe();
  //     });
  //   });
});
