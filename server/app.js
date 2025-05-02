const express = require("express");
const cors = require("cors");
import discogsRoutes from "./routes/discogs.routes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8081", "exp://*"],
    credentials: true,
  })
);

// ... rest of the existing code ...

// Routes
app.use("/api/discogs", discogsRoutes);
// ... existing routes ...
