import { Doctor } from "../../models/clinic/doctors.js";
import { User } from "../../models/users/users.js";
import { UserService } from "../../services/users/users.js";
import { SubscriptionService } from "../../services/users/subscriptions.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userService = new UserService();
const subscriptionService = new SubscriptionService();

export const createUser = async (req, res) => {
    try {
        const userData = req.body;
        const { newUser, token } = await userService.createUser(userData);

        if (userData.role === "doctor" && newUser.doctor) {
            console.log(newUser.doctor);
            const doctor = newUser.doctor;

            // Subscribe the doctor to the free plan
            const subscriptionService = new SubscriptionService();
            await subscriptionService.createFreeSubscription(
                newUser.doctor._id_doctor
            );
            newUser.doctor = doctor.toJSON();
        }

        const userResponse = { ...newUser.toJSON() };
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
    const { _id_user } = req.user;

    try {
        const user = await User.findOne({
            where: { _id_user },
            include: {
                model: Doctor,
                required: false,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let subscriptionDetails = null;
        console.log(user.role);
        console.log(user.Doctor._id_doctor);
        if (user.role === "doctor" && user.Doctor) {
            subscriptionDetails =
                await subscriptionService.getActiveSubscriptionDetails(
                    user.Doctor._id_doctor
                );
        }

        // Return the user details along with subscription information
        return res
            .status(200)
            .json({ user, subscription_details: subscriptionDetails });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Failed to fetch user", error: error.message });
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

dotenv.config();

export const verifyToken = (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "No token provided",
        });
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
        if (err) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid token" });
        }

        return res.status(200).json({
            success: true,
            message: "Token is valid",
            user: decodedToken,
        });
    });
};
