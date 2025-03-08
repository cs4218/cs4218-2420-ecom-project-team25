import React from "react";
import toast from "react-hot-toast";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";

import Users, { API_URLS, USERS_STRINGS } from "./Users";

// Mock dependencies
jest.mock("axios");

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

jest.mock("../../components/AdminMenu", () => () => (
  <div data-testid="admin-menu">Mock AdminMenu</div>
));

describe("Users Component", () => {
  const mockUsers = [
    {
      _id: "1",
      name: "John Doe",
      email: "johndoe@gmail.com",
      phone: "91234567",
      address: "BLK 84 MARINE PARADE CENTRAL, #01-70",
    },
    {
      _id: "2",
      name: "Jane Doe",
      email: "janedoe@email.com",
      phone: "98765432",
      address: "BLK 123 BUKIT TIMAH, #02-34",
    },
  ];
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should display users when API call is successful", async () => {
    axios.get.mockResolvedValueOnce({
      data: { users: mockUsers, success: true },
    });

    render(<Users />);

    // Wait for the users to be displayed
    await waitFor(() =>
      expect(screen.queryAllByTestId(/user-display-item-/)).toHaveLength(
        mockUsers.length
      )
    );
    expect(axios.get).toHaveBeenCalledWith(API_URLS.GET_USERS);
  });

  it("should display error message when API call fails", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: false } });

    render(<Users />);

    // Wait for the error message to be displayed
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(USERS_STRINGS.FETCH_USERS_ERROR)
    );
    expect(screen.queryAllByTestId(/user-display-item-/)).toHaveLength(0);
    expect(axios.get).toHaveBeenCalledWith(API_URLS.GET_USERS);
  });

  it("should display error message when API call throws an exception", async () => {
    axios.get.mockRejectedValueOnce(new Error("API failed"));

    render(<Users />);

    // Wait for the error message to be displayed
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(USERS_STRINGS.FETCH_USERS_ERROR)
    );
    expect(screen.queryAllByTestId(/user-display-item-/)).toHaveLength(0);
    expect(axios.get).toHaveBeenCalledWith(API_URLS.GET_USERS);
  });

  it("should not update state if component is unmounted before API response", async () => {
    const mockDelayedResponse = new Promise((resolve) => {
      setTimeout(
        () => resolve({ data: { users: mockUsers, success: true } }),
        100
      );
    });

    axios.get.mockReturnValueOnce(mockDelayedResponse);

    const { unmount } = render(<Users />);

    // Unmount before the API call resolves
    unmount();

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(USERS_STRINGS.COMPONENT_UNMOUNTED)
    );
    expect(toast.error).not.toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith(API_URLS.GET_USERS);
  });
});
