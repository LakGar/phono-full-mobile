import request from "supertest";
import app from "../server.js";
import User from "../models/user.model.js";
import { logger } from "../utils/logger.js";

describe("User Controller Tests", () => {
  describe("POST /api/users/register", () => {
    it("should register a new user", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty("_id");
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data).toHaveProperty("token");
    });

    it("should not register user with existing email", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      // Create a user first
      await User.create(userData);

      const response = await request(app)
        .post("/api/users/register")
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");
    });

    it("should not login with invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/users/profile", () => {
    let token;

    beforeEach(async () => {
      // Create a test user and get token
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const loginResponse = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "password123",
      });

      token = loginResponse.body.data.token;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe("test@example.com");
    });

    it("should not get profile without token", async () => {
      const response = await request(app).get("/api/users/profile");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
