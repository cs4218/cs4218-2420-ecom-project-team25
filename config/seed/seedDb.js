import slugify from "slugify";

import categoryModel from "../../models/categoryModel.js";
import userModel from "../../models/userModel.js";
import productModel from "../../models/productModel.js";
import { hashPassword } from "../../helpers/authHelper.js";

const ADMIN_USERS = [
  {
    name: "Admin User",
    email: "admin@email.com",
    password: "password",
    phone: "1234567890",
    address: "1234 Admin St",
    answer: "Admin",
  },
];

const USERS = [
  {
    name: "User",
    email: "user@email.com",
    password: "password",
    phone: "1234567890",
    address: "1234 User St",
    answer: "User",
  },
];

export const CATEGORIES = ["Books", "Electronics", "Clothing"];

export const PRODUCTS = [
  {
    name: "Novel",
    description:
      "A novel is a relatively long work of narrative fiction, typically written in prose and published as a book.",
    price: 10,
    category: CATEGORIES[0],
    quantity: 10,
    shipping: "Yes",
    photo: {
      base64:
        "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",
      contentType: "image/jpeg",
    },
  },
  {
    name: "Laptop",
    description:
      "A laptop is a small, portable personal computer (PC) with a clamshell form factor, typically having a thin LCD or LED computer screen mounted on the inside of the upper lid of the clamshell and an alphanumeric keyboard on the inside of the lower lid.",
    price: 1000,
    category: CATEGORIES[1],
    quantity: 5,
    shipping: "Yes",
    photo: {
      base64:
        "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",
      contentType: "image/jpeg",
    },
  },
  {
    name: "Phone",
    description:
      "A telephone, or phone, is a telecommunications device that permits two or more users to conduct a conversation when they are too far apart to be heard directly.",
    price: 500,
    category: CATEGORIES[1],
    quantity: 15,
    shipping: "No",
    photo: {
      base64:
        "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",
      contentType: "image/jpeg",
    },
  },
  {
    name: "Tshirt",
    description:
      "A T-shirt, or tee shirt, is a style of fabric shirt named after the T shape of its body and sleeves.",
    price: 20,
    category: CATEGORIES[2],
    quantity: 20,
    shipping: "No",
    photo: {
      base64:
        "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.jpeg",
      contentType: "image/jpeg",
    },
  },
];

export const seedDb = async () => {
  const adminUsersIdMap = {};
  const usersIdMap = {};
  const categoriesIdMap = {};
  const productsIdMap = {};

  for (const admin of ADMIN_USERS) {
    const object = await new userModel({
      name: admin.name,
      email: admin.email,
      password: await hashPassword(admin.password),
      phone: admin.phone,
      address: admin.address,
      answer: admin.answer,
      role: 1,
    }).save();
    adminUsersIdMap[admin.email] = object._id;
    console.log("Admin user created: ", admin.email);
  }
  console.log(adminUsersIdMap);

  //--

  for (const user of USERS) {
    const object = await new userModel({
      name: user.name,
      email: user.email,
      password: await hashPassword(user.password),
      phone: user.phone,
      address: user.address,
      answer: user.answer,
    }).save();
    usersIdMap[user.email] = object._id;
    console.log("User created: ", user.email);
  }
  console.log(usersIdMap);

  //--

  for (const category of CATEGORIES) {
    const object = await new categoryModel({
      name: category,
      slug: slugify(category),
    }).save();
    categoriesIdMap[category] = object._id;
    console.log("Category created: ", category);
  }
  console.log(categoriesIdMap);

  //--

  for (const product of PRODUCTS) {
    const object = await new productModel({
      name: product.name,
      slug: slugify(product.name),
      description: product.description,
      price: product.price,
      category: categoriesIdMap[product.category],
      quantity: product.quantity,
      photo: {
        data: Buffer.from(product.photo.base64, "base64"),
        contentType: product.contentType,
      },
      shipping: product.shipping === "Yes",
    }).save();
    productsIdMap[product.name] = object._id;
    console.log("Product created: ", product.name);
  }
  console.log(productsIdMap);
};

export const ADMIN_USER = ADMIN_USERS[0];
export const USER = USERS[0];
