import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, waitFor, screen } from "@testing-library/react";
import Orders from "./Orders";
import "@testing-library/jest-dom/extend-expect";
import { useAuth } from "../../context/auth";
import axios from "axios";

jest.mock("axios");

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

// ensure react router context is available
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Orders Page", () => {
  const mockUser = {
    name: "John Doe",
    email: "john@gmail.com",
    address: "NUS, Singapore",
  };
  const mockToken = "test-token";

  const mockOrders = [
    {
      _id: "1",
      status: "Processing",
      buyer: { name: "John Doe" },
      createAt: "2023-10-01T00:00:00.000Z",
      payment: { success: true },
      products: [
        {
          _id: "p1",
          name: "Product 1",
          description: "Description of Product 1",
          price: 100,
        },
        {
          _id: "p2",
          name: "Product 2",
          description: "Description of Product 2",
          price: 200,
        },
      ],
    },
  ];

  let consoleLogSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {}); // mock console.log to suppress output
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it("should get and display orders", async () => {
    useAuth.mockReturnValue(
      [
        {
          token: mockToken,
          user: mockUser,
        },
      ],
      jest.fn()
    );

    // mock axios get request to retunr mockOrders
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    renderWithRouter(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    expect(screen.getByText(/all orders/i)).toBeInTheDocument();

    // wait for ui to display table orders
    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });

    const tableRows = screen.getAllByRole("row");
    expect(tableRows.length).toBe(1 + mockOrders.length); // + 1 header row

    // check products
    await waitFor(() => {
      mockOrders[0].products.forEach((product) => {
        const productImage = screen.getByAltText(product.name); // Find by alt text
        expect(productImage).toBeInTheDocument();
      });
    });
  });

  it("should not get orders when auth token does not exist", async () => {
    useAuth.mockReturnValue(
      [
        {
          user: mockUser,
          token: "",
        },
      ],
      jest.fn()
    );

    axios.get.mockResolvedValueOnce({ data: [] });

    renderWithRouter(<Orders />);

    await waitFor(() => expect(axios.get).not.toHaveBeenCalled());
  });

  it("should log error when orders fetch fails", async () => {
    // spy on console.log

    useAuth.mockReturnValue(
      [
        {
          token: mockToken,
          user: mockUser,
        },
      ],
      jest.fn()
    );
    const mockError = new Error("Error fetching orders");
    axios.get = jest.fn().mockRejectedValueOnce(mockError);

    renderWithRouter(<Orders />);

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    });
  });

  it("should not display orders when no orders are available", async () => {
    useAuth.mockReturnValue(
      [
        {
          token: mockToken,
          user: mockUser,
        },
      ],
      jest.fn()
    );

    // mock axios get request to return empty orders
    axios.get.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    await waitFor(() => {
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  it("should render Success for successful payment", async () => {
    useAuth.mockReturnValue(
      [
        {
          token: mockToken,
          user: mockUser,
        },
      ],
      jest.fn()
    );

    // mock axios get request to retunr mockOrders
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    renderWithRouter(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    await waitFor(() => {
      expect(screen.getByText(/Success/i)).toBeInTheDocument();
    });
  });

  it("should render Failed for failed payment", async () => {
    useAuth.mockReturnValue(
      [
        {
          token: mockToken,
          user: mockUser,
        },
      ],
      jest.fn()
    );

    // mock axios get request to return mockOrders
    axios.get.mockResolvedValueOnce({
      data: [
        {
          ...mockOrders[0],
          payment: { success: false },
        },
      ],
    });
    renderWithRouter(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed/i)).toBeInTheDocument();
    });
  });
});
