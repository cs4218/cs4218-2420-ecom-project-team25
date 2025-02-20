import "@testing-library/jest-dom";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { useAuth } from "../../context/auth";

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

jest.mock("../../components/Layout", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Dashboard Component", () => {
  const mockUser = {
    name: "John Doe",
    email: "john@gmail.com",
    address: "NUS, Singapore",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render user details", () => {
    useAuth.mockReturnValue([{ user: mockUser }]);
    renderWithRouter(<Dashboard />);

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.address)).toBeInTheDocument();
  });

  it("should render dashboard without user details if no user", () => {
    useAuth.mockReturnValue([null]);
    renderWithRouter(<Dashboard />);

    expect(screen.queryByText(mockUser.name)).toBeNull();
    expect(screen.queryByText(mockUser.email)).toBeNull();
    expect(screen.queryByText(mockUser.address)).toBeNull();
  });
});
