import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper";
import { describe } from "node:test";
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
describe("authHelper hashPassword", () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it("should hash password successfully", async () => {
    const password = "testPassword";
    const hashedPassword = "hashedPassword";
    bcrypt.hash.mockResolvedValue(hashedPassword);

    const result = await hashPassword(password);

    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(result).toBe(hashedPassword);
  });

  it("should handle error in hashPassword", async () => {
    const password = "testPassword";
    const error = new Error("hashing error");

    bcrypt.hash.mockRejectedValue(error);

    const result = await hashPassword(password);

    expect(result).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith(error);
  });

  it("should handle null password in hashPassword", async () => {
    const password = null;

    const result = await hashPassword(password);

    expect(result).toBeUndefined();
    expect(console.log).toHaveBeenCalled();
  });
});

describe("authHelper comparePassword", () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it("should return true if passwords match", async () => {
    const password = "testPassword";
    const hashedPassword = "hashedPassword";

    bcrypt.compare.mockResolvedValue(true);

    const result = await comparePassword(password, hashedPassword);

    expect(result).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
  });

  it("should return false if passwords do not match", async () => {
    const password = "testPassword";
    const hashedPassword = "hashedPassword";

    bcrypt.compare.mockResolvedValue(false);

    const result = await comparePassword(password, hashedPassword);

    expect(result).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
  });

  it("should handle error in comparePassword", async () => {
    const password = "testPassword";
    const hashedPassword = "hashedPassword";
    const error = new Error("compare error");

    bcrypt.compare.mockRejectedValue(error);

    const result = await comparePassword(password, hashedPassword);

    expect(result).toBeUndefined();
    expect(consoleLogSpy).toHaveBeenCalledWith(error);
  });

  it("should handle null password in comparePassword", async () => {
    const password = null;
    const hashedPassword = "hashedPassword";

    const result = await comparePassword(password, hashedPassword);

    expect(result).toBeUndefined();
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  it("should handle null hashedPassword in comparePassword", async () => {
    const password = "testPassword";
    const hashedPassword = null;

    const result = await comparePassword(password, hashedPassword);

    expect(result).toBeUndefined();
    expect(consoleLogSpy).toHaveBeenCalled();
  });
});
