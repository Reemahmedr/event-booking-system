import authController from "../controller/authController.js";
import { User } from "../models/userModel.js";
import { describe, expect, jest, test } from "@jest/globals";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("check register function unit testing", () => {
  test("Mock for findOne user", () => {
    const findOneMock = jest.spyOn(User, "findOne");
    findOneMock.mockResolvedValue(null);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  test("Mock for email exists check", async () => {
    const findOneMock = jest.spyOn(User, "findOne");
    findOneMock.mockResolvedValue({ email: "test@example.com" });
    const req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "Password123",
        role: "user",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await authController.register(req, res, next);
    expect(findOneMock).toHaveBeenCalled();
  });

  test("Mock for email does not exist , create new user", async () => {
    const findOneMock = jest.spyOn(User, "findOne");
    findOneMock.mockResolvedValue(null);
    const createUserMock = jest.spyOn(User, "create");
    const hashMock = jest.spyOn(bcrypt, "hash");
    hashMock.mockResolvedValue("hashedPassword");
    createUserMock.mockResolvedValue({
      name: "John Doe",
      email: "test@example.com",
      password: "hashedPassword",
      role: "user",
      avatar: "/uploads/download (1).jpg",
    });
    const req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "Password123",
        role: "user",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await authController.register(req, res, next);
    expect(createUserMock).toHaveBeenCalledWith({
      name: "John Doe",
      email: "test@example.com",
      password: "hashedPassword",
      role: "user",
      avatar: "/uploads/download (1).jpg",
    });
  });

  test("should return error if user already exists", async () => {
    const findOneMock = jest.spyOn(User, "findOne");
    findOneMock.mockResolvedValue({ email: "test@example.com" });
    const req = {
      body: {
        name: "John Doe",
        email: "test@example.com",
        password: "Password123",
        role: "user",
      },
      file: {
        path: "uploads/test.jpg",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await authController.register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Email already exists",
    });
  });
});

describe("check login function unit testing", () => {
  test("should return error if email or password is missing", async () => {
    const req = {
      body: {
        email: "",
        password: "",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await authController.login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "All fileds are requied",
    });
  });

  test("should return error if email does not exist", async () => {
    const findOneMock = jest.spyOn(User, "findOne");
    findOneMock.mockResolvedValue(null);
    const req = {
      body: {
        email: "nonexistent@example.com",
        password: "Password123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await authController.login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Invalid email or password",
    });
  });

  test("should return error if incorrect password", async () => {
    const findOneMock = jest.spyOn(User, "findOne");
    findOneMock.mockResolvedValue({
      email: "test@example.com",
      password: "hashedPassword",
    });
    const compareMock = jest.spyOn(bcrypt, "compare");
    compareMock.mockResolvedValue(false);
    const req = {
      body: {
        email: "test@example.com",
        password: "wrongPassword",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await authController.login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "password is not correct",
    });
  });

  test("should return success if login is successful", async () => {
    const findOneMock = jest.spyOn(User, "findOne");
    findOneMock.mockResolvedValue({
      _id: "userId",
      email: "test@example.com",
      password: "hashedPassword",
    });
    const compareMock = jest.spyOn(bcrypt, "compare");
    compareMock.mockResolvedValue(true);
    const signMock = jest.spyOn(jwt, "sign");
    signMock.mockReturnValue("fake-token");
    const req = {
      body: {
        email: "test@example.com",
        password: "Password123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await authController.login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        message: "login successfully",
        token: "fake-token",
      },
    });
  });
});
