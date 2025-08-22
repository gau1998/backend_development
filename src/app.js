import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
// - origin: allows requests only from the specified frontend origin (set in .env)
// - credentials: allows cookies and authentication headers to be sent
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Middleware to parse incoming JSON requests
// - limit: restricts payload size to prevent large request bodies (16kb here)
app.use(express.json({ limit: "16kb" }));

// Middleware to parse URL-encoded data (form submissions, etc.)
// - extended: true allows nested objects
// - limit: restricts payload size
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files (e.g., images, CSS, JS) from the "public" directory
app.use(express.static("public"));

// Parse cookies from incoming requests
// - Useful for handling authentication tokens (JWT in cookies, sessions, etc.)
app.use(cookieParser());

// Import and mount user-related routes
// All user APIs will be available under: /api/v1/users
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users", userRoutes);

// Export app instance so it can be used in server.js
export { app };
