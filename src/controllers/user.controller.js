import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req, res,next) => {
    // return res.status(200).json({
    //     message: "User registration endpoint is under construction"
    // })
    const { username, email, fullName, password } = req.body;
    const avatar = req.file?.path || null;
    const coverImage = req.body.coverImage || null;

    if (!username || !email || !fullName || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Additional user registration logic goes here

    res.status(201).json({ message: "User registered successfully" });
});

export {registerUser}