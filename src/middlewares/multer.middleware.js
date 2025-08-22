import multer from "multer";

// Configure storage for uploaded files
const storage = multer.diskStorage({
  // Destination folder where files will be saved
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Save in /public/temp
  },

  // Define how the uploaded file should be named
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original filename
  }
});

// Export multer instance with the custom storage configuration
export const upload = multer({ storage: storage });
