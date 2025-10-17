describe("Basic Test Suite", () => {
  it("should run basic tests", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle async code", async () => {
    const result = await Promise.resolve("success");
    expect(result).toBe("success");
  });
});
