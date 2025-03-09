import { getUsersController } from "./authController.js";
import userModel from "../models/userModel.js";

jest.mock("../models/userModel.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("getUsersController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return all users with role 0", async () => {
    const mockUsers = [
      { _id: "1", name: "John Doe", email: "john@example.com", role: 0 },
      { _id: "2", name: "Jane Doe", email: "jane@example.com", role: 0 },
      { _id: "3", name: "Admin", email: "admin@example.com", role: 1 },
    ];
    userModel.find.mockImplementation((query) =>
      mockUsers.filter((user) => user.role === query.role)
    );

    const req = {};
    const res = mockResponse();

    await getUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Users",
      users: mockUsers.filter((user) => user.role === 0),
    });
  });

  it("should handle errors gracefully", async () => {
    userModel.find.mockRejectedValue(new Error("Database Error"));

    const req = {};
    const res = mockResponse();

    await getUsersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Geting Users",
      error: expect.any(Error),
    });
  });
});
