import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { useAuth } from "../../context/auth";
import axios from "axios";
import Profile from "./Profile";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../components/Routes/Private", () => {
  return {
    __esModule: true,
    default: ({ children }) => <>{children}</>,
  };
});

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Profile Page", () => {
  const mockUser = {
    name: "John Doe",
    email: "john@gmail.com",
    address: "NUS, Singapore",
    phone: "1234567890",
  };

  const updatedMockUser = {
    name: "John Bob Doe",
    email: "bob@gmail.com",
    address: "NTU, Singapore",
    phone: "9876543210",
  };

  const emptyUser = {
    name: "",
    email: "",
    address: "",
    phone: "",
  };

  const mockToken = "test-token";

  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {}); // mock console.log to suppress output
    useAuth.mockReturnValue([{ user: mockUser, token: mockToken }, jest.fn()]);
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it("should render Profile page with user data", () => {
    renderWithRouter(<Profile />);

    // form elements
    expect(screen.getByText(/USER PROFILE/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter Your Password")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Phone")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter Your Address")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /UPDATE/i })).toBeInTheDocument();

    // form values
    expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.phone)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.address)).toBeInTheDocument();
  });

  it("should render Profile page with empty fields", () => {
    useAuth.mockReturnValue([{ user: emptyUser, token: mockToken }, jest.fn()]);

    renderWithRouter(<Profile />);

    // form values
    expect(screen.getByPlaceholderText("Enter Your Name").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your Address").value).toBe("");
  });

  it("should allow typing user details", () => {
    renderWithRouter(<Profile />);

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: updatedMockUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: updatedMockUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: updatedMockUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: updatedMockUser.address },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "newpass" },
    });

    expect(screen.getByPlaceholderText("Enter Your Name").value).toBe(
      updatedMockUser.name
    );
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe(
      updatedMockUser.email
    );
    expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe(
      updatedMockUser.phone
    );
    expect(screen.getByPlaceholderText("Enter Your Address").value).toBe(
      updatedMockUser.address
    );
    expect(screen.getByPlaceholderText("Enter Your Password").value).toBe(
      "newpass"
    );
  });

  it("shoud update user details successfully", async () => {
    // mock axios return value
    axios.put.mockResolvedValueOnce({
      data: { success: true, updatedUser: updatedMockUser, token: mockToken },
    });

    // mock localstorage get item
    window.localStorage.getItem.mockReturnValue(
      JSON.stringify({
        user: mockUser,
        token: mockToken,
      })
    );

    renderWithRouter(<Profile />);

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: updatedMockUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: updatedMockUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: updatedMockUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: updatedMockUser.address },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "newpass" },
    });
    fireEvent.click(screen.getByText(/UPDATE/i));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: updatedMockUser.name,
        email: updatedMockUser.email,
        phone: updatedMockUser.phone,
        address: updatedMockUser.address,
        password: "newpass",
      });
    });
    // verify localstorage called
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "auth",
      JSON.stringify({
        user: updatedMockUser,
        token: mockToken,
      })
    );
    // verify toast message
    expect(toast.success).toHaveBeenCalled();
  });

  it("should display error message on update failure", async () => {
    // covers line 39

    // mock axios return data.error
    axios.put.mockResolvedValueOnce({
      data: { error: "Error updating user" },
    });

    renderWithRouter(<Profile />);

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: updatedMockUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: updatedMockUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: updatedMockUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: updatedMockUser.address },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "newpass" },
    });
    fireEvent.click(screen.getByText(/UPDATE/i));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: updatedMockUser.name,
        email: updatedMockUser.email,
        phone: updatedMockUser.phone,
        address: updatedMockUser.address,
        password: "newpass",
      });
    });

    // verify toast.error
    expect(toast.error).toHaveBeenCalledWith("Error updating user");
  });

  it("should log and display error message if error is thrown", async () => {
    // covers 53 - 54
    // mock error thrown
    const mockError = new Error("Error updating");

    // mock axios throw error
    axios.put = jest.fn().mockRejectedValueOnce(mockError);

    // spy on console.log
    // consoleLogSpy = jest.spyOn(console, "log");

    renderWithRouter(<Profile />);

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: updatedMockUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: updatedMockUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: updatedMockUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: updatedMockUser.address },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "newpass" },
    });
    fireEvent.click(screen.getByText(/UPDATE/i));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", {
        name: updatedMockUser.name,
        email: updatedMockUser.email,
        phone: updatedMockUser.phone,
        address: updatedMockUser.address,
        password: "newpass",
      });
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });
});
