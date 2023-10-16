import { User } from "../models/users/users.js";
import { generateAccessCode } from "../helpers/access_code_generator.js";
import { createDefaultParameters } from "../helpers/default_parameters.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt, { decode } from "jsonwebtoken";
import GoogleSheetsManager from "../helpers/sheets.js";

dotenv.config();

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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 1: Create User
        const newUser = await User.create({
            name,
            last_name,
            phone,
            email,
            profile_picture,
            password: hashedPassword,
            specialty,
            role,
        });

        const accessCode = generateAccessCode();
        newUser.access_code = accessCode;
        await newUser.save();

        await createDefaultParameters(newUser);

        // const sheetsManager = new GoogleSheetsManager();

        // Step 2: Authorize Google Sheets Manager
        // try {
        //     await sheetsManager.authorize();
        // } catch (error) {
        //     console.error(
        //         `Error authorizing Google Sheets Manager: ${error.message}`
        //     );
        //     return res.status(500).json({
        //         success: false,
        //         message: "Failed to authorize Google Sheets Manager",
        //         error: error.message,
        //     });
        // }

        // // Step 3: Create Folder
        // let folderId;
        // try {
        //     const folderName = `Dr. ${name} ${last_name}`;
        //     folderId = await sheetsManager.createFolder(folderName);
        // } catch (error) {
        //     console.error(`Error creating folder: ${error.message}`);
        //     return res.status(500).json({
        //         success: false,
        //         message: "Failed to create folder",
        //         error: error.message,
        //     });
        // }

        // try {
        //     const permission = await sheetsManager.sharePermission(
        //         folderId,
        //         "user",
        //         "reader",
        //         email
        //     );

        //     console.log("\n-- PERMISSION: ", permission);
        // } catch (error) {
        //     console.error(`Error granting permission: ${error.message}`);
        //     return res.status(500).json({
        //         success: false,
        //         message: "Failed to grant permission",
        //         error: error.message,
        //     });
        // }

        // // Step 4: Update User Database
        // try {
        //     newUser._id_folder = folderId;
        //     await newUser.save();
        // } catch (error) {
        //     console.error(`Error updating user: ${error.message}`);
        //     return res.status(500).json({
        //         success: false,
        //         message: "Failed to update user",
        //         error: error.message,
        //     });
        // }

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.TOKEN_SECRET,
            { expiresIn: "1w" }
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: newUser,
            token: token,
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
        const user = await User.findOne({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email not found",
            });
        }

        // Check if the provided password matches the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id_user, email: user.email },
            process.env.TOKEN_SECRET,
            { expiresIn: "1w" }
        );

        // Return successful response with user ID
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const access_code = async (req, res) => {
    const code = req.query.code;
    try {
        // Check if the code exists in the database
        const user = await User.findOne({
            where: { access_code: code },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Code not found",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id_user },
            process.env.TOKEN_SECRET,
            { expiresIn: "1w" }
        );

        // Return successful response with user ID and token
        res.status(200).json({
            success: true,
            message: "Login successful",
            userId: user._id_user,
            token: token,
        });
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
        const userId = req.query._id_user;

        // Find the user by ID
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Return the user data
        res.status(200).json({ success: true, user });
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
        if (decodedToken) {
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
            message: "Invalid gei",
        });
    }
};
