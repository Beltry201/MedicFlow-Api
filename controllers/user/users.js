import { Doctor } from "../../models/clinic/doctors.js";
import { User } from "../../models/users/users.js";
import { UserService } from "../../services/users/users.js";

const userService = new UserService();

export const createUser = async (req, res) => {
    try {
        const userData = req.body;
        const { newUser, token } = await userService.createUser(userData);
        const userResponse = { ...newUser.toJSON() };
        if (userData.role === "doctor" && newUser.doctor) {
            userResponse.doctor = newUser.doctor.toJSON();
        }

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: userResponse,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Failed to create user",
            error: error.message,
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { phone, email, specialty, office_address } = req.body;

        const { _id_user } = req.user;

        const user = await User.findByPk(_id_user);

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        if (phone) user.phone = phone;
        if (email) user.email = email;
        if (specialty) user.specialty = specialty;
        if (office_address) user.office_address = office_address;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message,
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { success, message, token } = await userService.loginUser(
            email,
            password
        );

        if (success) {
            // Return successful response with token
            res.status(200).json({ success, message, token });
        } else {
            // Return error response
            res.status(401).json({ success, message });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Check if the email exists in the database
        const user = await User.findOne({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
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

export const getUser = async (req, res) => {
    try {
        const { _id_user } = req.user;

        const user = await User.findByPk(_id_user, {
            attributes: { exclude: ["pass_token"] },
            include: {
                model: Doctor,
                required: false,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get user",
            error: error.message,
        });
    }
};

export const deactivateUser = async (req, res) => {
    try {
        const userId = req.query._id_user;

        // Find the user by ID
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update the user's "is_valid" flag to false
        user.is_valid = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: "User deactivated successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to deactivate user",
            error: error.message,
        });
    }
};

export const verifyToken = async (req, res) => {
    console.log("Entre a validate");
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token not provided gei",
            });
        }

        // Verify and decode the token
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

        // Token is valid, user can access
        if (decodedToken._id_user) {
            res.status(200).json({
                success: true,
                message: "Token is valid",
            });
        }
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired",
            });
        }
        return res.status(401).json({
            success: false,
            message: "Token is invalid",
        });
    }
};
