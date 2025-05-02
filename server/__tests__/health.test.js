import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";

describe("Health Check Endpoint", () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(
      process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/phono-test"
    );
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  it("should return 200 and health check data", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("message", "OK");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("database");
    expect(response.body).toHaveProperty("memoryUsage");
  });

  it("should return database status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.body.database).toHaveProperty("status");
    expect(response.body.database).toHaveProperty("state");
    expect(response.body.database.status).toBe("connected");
    expect(response.body.database.state).toBe(1);
  });
});
