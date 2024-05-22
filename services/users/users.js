import Joi from "joi";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../models/users/users.js";
import { Doctor } from "../../models/clinic/doctors.js";
import { sequelize } from "../../config/db.js";
import { SubscriptionService } from "../users/subscriptions.js";
dotenv.config();

export class UserService {
    async createUser(userData) {
        const subscriptionService = new SubscriptionService();

        let transaction;

        try {
            const {
                name,
                last_name,
                phone,
                email,
                profile_picture,
                password,
                role,
                professional_id,
                department,
                specialty,
                _id_clinic,
            } = userData;
            console.log(professional_id);
            // Validate role
            if (role === "doctor") {
                if (!professional_id || !department || !specialty) {
                    throw new Error("Doctor information is required");
                }
            }

            // Validations
            const schema = Joi.object({
                name: Joi.string().required(),
                last_name: Joi.string().required(),
                phone: Joi.string().required(),
                email: Joi.string().email().required(),
                profile_picture: Joi.string().required(),
                password: Joi.string().required(),
                role: Joi.string().required(),
                professional_id: Joi.string(),
                department: Joi.string(),
                specialty: Joi.string(),
                _id_clinic: Joi.string().uuid().required(),
            });

            const { error } = schema.validate(userData);

            if (error) {
                throw new Error(error.details[0].message);
            }

            // Check if phone number already exists
            const existingPhoneUser = await User.findOne({ where: { phone } });
            if (existingPhoneUser) {
                throw new Error("Phone number already exists.");
            }

            // Check if email already exists
            const existingEmailUser = await User.findOne({ where: { email } });
            if (existingEmailUser) {
                throw new Error("Email already exists.");
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            transaction = await sequelize.transaction();
            // Create the user
            const newUser = await User.create(
                {
                    name,
                    last_name,
                    phone,
                    email,
                    profile_picture,
                    pass_token: hashedPassword,
                    role,
                    _id_clinic,
                },
                { transaction }
            );

            let doctor;
            if (role === "doctor") {
                // Create the doctor record
                doctor = await Doctor.create(
                    {
                        professional_id,
                        department,
                        specialty,
                        _id_user: newUser._id_user,
                    },
                    { transaction }
                );
                newUser.doctor = doctor;
            }

            await transaction.commit();

            const token = this.generateToken(newUser);

            return { newUser, token };
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(error);
            throw new Error(error.message || "Failed to create user");
        }
    }

    async loginUser(email, password) {
        try {
            // Check if the email exists in the database
            const user = await User.findOne({
                where: { email },
                include: {
                    model: Doctor,
                    required: false,
                },
            });
            if (!user) {
                return { success: false, message: "Email not found" };
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return { success: false, message: "Invalid password" };
            }

            // Generate JWT token
            const token = this.generateToken(user);
            console.log(token);
            return { success: true, message: "Login successful", token };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: "Internal server error",
                error: error.message,
            };
        }
    }

    generateToken(user, doctor) {
        // Generate JWT token with payload
        const payload = {
            _id_user: user._id_user,
            email: user.email,
            phone: user.phone,
        };

        if (doctor && doctor._id_doctor) {
            payload._id_doctor = doctor._id_doctor;
        }

        const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
            expiresIn: "1w",
        });

        return token;
    }
}
