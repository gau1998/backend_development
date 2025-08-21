import dotenv from "dotenv"; // Load environment variables from .env file
import connectDB from "./db/index.js"; // Import the database connection module
import { app } from "./app.js"; // Import the Express application
// Initialize dotenv to load environment variables
dotenv.config({
  path: "./env", // Specify the path to the .env file
}); // Load environment variables from .env file
connectDB() // Establish the database connection
  .then(() => {
    const PORT = process.env.PORT || 3000; // Set the port from environment variables or default to 3000
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`); // Log the server start message
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error); // Log any errors during connection
    process.exit(1); // Exit the process if the connection fails
  }); // End of the code snippet
