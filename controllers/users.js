import { User } from "../models/users.js";

export async function getUser(req, res) {
    res.send("getting Users");
}

export const createUser = async (req, res) => {
    try {
        const {
            name,
            last_name,
            phone,
            email,
            profile_picture,
            password,
            specialty,
            role,
        } = req.body;

        // Create a new user in the database
        const newUser = await User.create({
            name,
            last_name,
            phone,
            email,
            profile_picture,
            password,
            specialty,
            role,
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: newUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message,
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the email exists in the database
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Email not found" });
        }

        // Check if the password matches
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid password" });
        }

        // Return successful response with user ID
        res.status(200).json({ success: true, userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to login",
            error: error.message,
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Check if the email exists in the database
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Email not found" });
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to reset password",
            error: error.message,
        });
    }
};
