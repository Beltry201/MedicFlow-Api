import { MembershipPlan } from "../../models/subscriptions/membership_plans.js";
import { generateAccessCode } from "../../helpers/access_code_generator.js";
import { Subscription } from "../../models/subscriptions/subscriptions.js";
import { Consult } from "../../models/consults/consults.js";
import { User } from "../../models/users/users.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Joi from "joi";

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

        // Validations
        const schema = Joi.object({
            name: Joi.string().required(),
            last_name: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().email().required(),
            profile_picture: Joi.string().required(),
            password: Joi.string().required(),
            specialty: Joi.string().required(),
            role: Joi.string().required(),
        });

        const { error } = schema.validate(req.body);

        const existingPhoneUser = await User.findOne({ where: { phone } });

        if (existingPhoneUser) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: "Phone number already exists.",
            });
        }

        const existingEmailUser = await User.findOne({ where: { email } });

        if (existingEmailUser) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: "Email already exists.",
            });
        }

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: error.details[0].message,
            });
        }

        // Password Handling
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creat User
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

        // Free Tier Subsbription
        const oneYearLater = new Date();
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

        if (role !== "admin") {
            const newSubscriptionRecord = await Subscription.create({
                _id_user: newUser._id_user,
                subscription_start_date: new Date(),
                subscription_end_date: oneYearLater,
                state: "free tier",
                _id_membership_plan: 1,
                is_active: true,
            });
        }

        // MVP Access Code
        const accessCode = generateAccessCode();
        newUser.access_code = accessCode;
        await newUser.save();

        // Sign Token
        const token = jwt.sign(
            {
                _id_user: newUser._id_user,
                email: newUser.email,
                phone: newUser.phone,
            },
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
            {
                _id_user: user._id_user,
                email: user.email,
                phone: user.phone,
            },
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
        const { _id_user } = req.user;

        const user = await User.findByPk(_id_user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const latestSubscription = await Subscription.findOne({
            where: { _id_user: _id_user },
            order: [["createdAt", "DESC"]],
        });

        if (!latestSubscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        const membershipPlan = await MembershipPlan.findByPk(
            latestSubscription._id_membership_plan
        );

        const currentDate = new Date();

        const firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );
        const lastDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        );

        const consultCount = await Consult.count({
            where: {
                _id_doctor: user._id_user,
                createdAt: {
                    [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                },
            },
        });

        // Return the user data along with the subscription and membership plan information
        res.status(200).json({
            success: true,
            user: {
                _id_user: user._id_user,
                name: user.name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                profile_picture: user.profile_picture,
                specialty: user.specialty,
                role: user.role,
                professional_id: user.professional_id,
                diploma_organization: user.diploma_organization,
                office_address: user.office_address,
                user_since: user.createdAt,
                subscription: {
                    _id_subscription: latestSubscription._id_subscription,
                    subscription_start_date:
                        latestSubscription.subscription_start_date,
                    subscription_end_date:
                        latestSubscription.subscription_end_date,
                    state: latestSubscription.state,
                    used_consults: consultCount,
                },
                membership_plan: {
                    _id_membership_plan: membershipPlan._id_membership_plan,
                    plan_name: membershipPlan.plan_name,
                    consults_limit: membershipPlan.consults_limit,
                    min_per_consult: membershipPlan.min_per_consult,
                    is_valid: membershipPlan.is_valid,
                },
            },
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
