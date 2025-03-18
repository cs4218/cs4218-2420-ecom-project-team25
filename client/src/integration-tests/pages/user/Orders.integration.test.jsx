import "@testing-library/jest-dom";

import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, waitFor, screen } from "@testing-library/react";
import Orders from "../../../pages/user/Orders";
import { useAuth } from "../../../context/auth";
import { CartProvider } from "../../../context/cart";
import { SearchProvider } from "../../../context/search";
import axios from "axios";

jest.mock("axios");

jest.mock("../../../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(() => [[], jest.fn()]),
}));

jest.mock("../../../context/auth", () => ({
  useAuth: jest.fn(),
}));

const Providers = ({ children }) => {
  return (
    <CartProvider>
      <SearchProvider>{children}</SearchProvider>
    </CartProvider>
  );
};

describe("Orders Integration Tests", () => {
  const mockUser = {
    name: "John Doe",
    email: "john@gmail.com",
    address: "NUS, Singapore",
  };

  const mockToken = "mock-token";

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

  const setup = () => {
    return render(
      <Providers>
        <MemoryRouter initialEntries={["/user/orders"]}>
          <Routes>
            <Route path="/user/orders" element={<Orders />} />
          </Routes>
        </MemoryRouter>
      </Providers>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue(
      [
        {
          token: mockToken,
          user: mockUser,
        },
      ],
      jest.fn()
    );
    axios.get.mockResolvedValue({ data: mockOrders });
  });

  it("should render the right layout", async () => {
    setup();
    await waitFor(() => {
      expect(document.title).toBe("Your Orders");
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "John Doe" })
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Orders")).toBeInTheDocument();
    });
  });

  it("should fetch and display orders if user is authenticated", async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Processing")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });
  });

  it("should not fetch and display orders if user is not authenticated", async () => {
    useAuth.mockReturnValue([null, jest.fn()]);

    setup();
    expect(axios.get).not.toHaveBeenCalled();
    expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
  });

  it("should handle failed fetch of orders", async () => {
    axios.get.mockRejectedValue(new Error("Internal Server Error"));
    setup();

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
    });
  });
});
