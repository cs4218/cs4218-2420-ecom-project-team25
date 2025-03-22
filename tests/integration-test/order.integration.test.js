import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import JWT from "jsonwebtoken";
import app from "../../app";
import orderModel from "../../models/orderModel";
import categoryModel from "../../models/categoryModel";
import productModel from "../../models/productModel";
import userModel from "../../models/userModel";

jest.mock("../../config/db.js", () => jest.fn());

jest.mock("braintree", () => ({
  BraintreeGateway: jest.fn(() => {
    return {
      clientToken: {
        generate: jest.fn(),
      },
      transaction: {
        sale: jest.fn(),
      },
    };
  }),
  Environment: {
    Sandbox: "sandbox",
  },
}));

describe("Order API Integration Tests", () => {
  let mongoServer;
  let admin;
  let user;
  let adminToken;
  let userToken;
  const { JWT_SECRET: originalJwtSecret } = process.env;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    process.env.JWT_SECRET = "jwt_secret";

    // Create sample user (admin)
    admin = await userModel.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password",
      phone: "1234567890",
      address: "1234th St, San Francisco, CA",
      answer: "John",
      role: 1, // Admin user
    });

    // Create sample user
    user = await userModel.create({
      name: "Sample User",
      email: "user@example.com",
      password: "password",
      phone: "1234567890",
      address: "1234th St, San Francisco, CA",
      answer: "John",
    });

    // Generate JWT token
    adminToken = JWT.sign({ _id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    userToken = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Create sample category
    const category = await categoryModel.create({
      name: "Sample Category",
      slug: "sample-category",
    });

    // Create sample product
    const product = await productModel.create({
      name: "Sample Product",
      slug: "sample-product",
      description: "Sample Description",
      price: 100,
      quantity: 10,
      category: category._id,
      photo: "sample.jpg",
    });

    // Create sample order by admin
    await orderModel.create({
      buyer: admin._id,
      products: [product._id],
      status: "Processing",
      payment: {
        id: "123",
        status: "paid",
        amount: 100,
      },
    });
    // Add a delay to ensure timestamps are different
    // so that we can ensure first order is created by admin before second order by user
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create sample order by user
    await orderModel.create({
      buyer: user._id,
      products: [product._id],
      status: "Shipped",
      payment: {
        id: "100",
        status: "paid",
        amount: 100,
      },
    });
  });

  afterEach(async () => {
    process.env.JWT_SECRET = originalJwtSecret;
    await orderModel.deleteMany();
    await categoryModel.deleteMany();
    await productModel.deleteMany();
    await userModel.deleteMany();
  });

  // GET ORDERS CONTROLLER
  test("GET /api/v1/order/orders should fetch own user order when user is signed in", async () => {
    const res = await request(app)
      .get("/api/v1/order/orders")
      .set("Authorization", userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].buyer.name).toBe("Sample User");
  });

  test("GET /api/v1/order/orders should fetch own admin order when admin is signed in", async () => {
    const res = await request(app)
      .get("/api/v1/order/orders")
      .set("Authorization", adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].buyer.name).toBe("Admin User");
  });

  test("GET /api/v1/order/orders should return 401 when user is not signed in", async () => {
    const res = await request(app).get("/api/v1/order/orders");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Error in requireSignIn middleware");
  });

  test("GET /api/v1/order/orders should return 401 when admin is not signed in", async () => {
    const res = await request(app).get("/api/v1/order/orders");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Error in requireSignIn middleware");
  });

  test("GET /api/v1/order/orders should return 500 when database error occurs", async () => {
    jest.spyOn(orderModel, "find").mockResolvedValueOnce(null);

    const res = await request(app)
      .get("/api/v1/order/orders")
      .set("Authorization", userToken);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error While Getting Orders");

    orderModel.find.mockRestore();
  });

  test("GET /api/v1/order/orders should return empty array when user has no orders", async () => {
    // create new user without orders
    const newUserNoOrder = await userModel.create({
      name: "User Without Orders",
      email: "nouser@email.com",
      password: "password",
      phone: "1234567890",
      address: "1234th St, San Francisco, CA",
      answer: "John",
      role: 0, // user
    });
    const newUserNoOrderToken = JWT.sign(
      { _id: newUserNoOrder._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const res = await request(app)
      .get("/api/v1/order/orders")
      .set("Authorization", newUserNoOrderToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0);
  });

  // GET ALL ORDERS CONTROLLER
  test("GET /api/v1/order/all-orders should fetch all orders when user is signed in and is admin", async () => {
    const res = await request(app)
      .get("/api/v1/order/all-orders")
      .set("Authorization", adminToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2);
    expect(res.body[0].buyer.name).toBe("Sample User");
    expect(res.body[1].buyer.name).toBe("Admin User");
  });

  test("GET /api/v1/order/all-orders should return 401 when user is not signed in", async () => {
    const res = await request(app).get("/api/v1/order/all-orders");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Error in requireSignIn middleware");
  });

  test("GET /api/v1/order/all-orders should return 401 when user is not admin", async () => {
    const res = await request(app)
      .get("/api/v1/order/all-orders")
      .set("Authorization", userToken);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("UnAuthorized Access");
  });

  test("GET /api/v1/order/all-orders should return 500 when database error occurs", async () => {
    jest.spyOn(orderModel, "find").mockResolvedValueOnce(null);

    const res = await request(app)
      .get("/api/v1/order/all-orders")
      .set("Authorization", adminToken);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error While Getting Orders");

    orderModel.find.mockRestore();
  });

  // ORDER STATUS CONTROLLER
  test("PUT /api/v1/order/order-status/:orderId should update order status when user is signed in and is admin", async () => {
    const order = await orderModel.findOne();
    const res = await request(app)
      .put(`/api/v1/order/order-status/${order._id}`)
      .set("Authorization", adminToken)
      .send({ status: "Shipped" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("Shipped");
  });

  test("PUT /api/v1/order/order-status/:orderId should return 401 when user is not signed in", async () => {
    const order = await orderModel.findOne();
    const res = await request(app)
      .put(`/api/v1/order/order-status/${order._id}`)
      .send({ status: "Shipped" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Error in requireSignIn middleware");
  });

  test("PUT /api/v1/order/order-status/:orderId should return 401 when user is not admin", async () => {
    const order = await orderModel.findOne();
    const res = await request(app)
      .put(`/api/v1/order/order-status/${order._id}`)
      .set("Authorization", userToken)
      .send({ status: "Shipped" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("UnAuthorized Access");
  });

  test("PUT /api/v1/order/order-status/:orderId should return 500 for invalid order ID", async () => {
    const res = await request(app)
      .put(`/api/v1/order/order-status/invalidOrderId`)
      .set("Authorization", adminToken)
      .send({ status: "Shipped" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error While Updating Order Status");
  });

  test("PUT /api/v1/order/order-status/:orderId should not update order status when status is not provided", async () => {
    const order = await orderModel.findOne();
    const res = await request(app)
      .put(`/api/v1/order/order-status/${order._id}`)
      .set("Authorization", adminToken)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(order.status);
  });

  test("PUT /api/v1/order/order-status/:orderId should return 500 when database error occurs", async () => {
    jest
      .spyOn(orderModel, "findByIdAndUpdate")
      .mockRejectedValueOnce(new Error("DB FindByIdAndUpdate Error"));

    const order = await orderModel.findOne();
    const res = await request(app)
      .put(`/api/v1/order/order-status/${order._id}`)
      .set("Authorization", adminToken)
      .send({ status: "Shipped" });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error While Updating Order Status");

    orderModel.findByIdAndUpdate.mockRestore();
  });
});
