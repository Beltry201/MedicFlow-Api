import { MembershipPlan } from "../../models/subscriptions/membership_plans.js";
import { PaymentRecord } from "../../models/subscriptions/payment_records.js";
import { PaymentMethod } from "../../models/subscriptions/payment_methods.js";
import { Subscription } from "../../models/subscriptions/subscriptions.js";
import { Consult } from "../../models/consults/consults.js";
import { User } from "../../models/users/users.js";
import { sequelize } from "../../config/db.js";
import { Op } from "sequelize";

// Function for user validation
const validateUser = async (_id_user) => {
    try {
        const user = await User.findByPk(_id_user);
        if (!user || user.role !== "admin" || !user.is_valid) {
            return false; // Return false for invalid user
        }
        return true; // Return true for valid user
    } catch (error) {
        console.error("Error in validateUser function:", error);
        throw new Error("Internal server error");
    }
};

// Function for payment method validation
const validatePaymentMethod = async (_id_payment_method) => {
    try {
        const paymentMethod = await PaymentMethod.findByPk(_id_payment_method);
        if (!paymentMethod || !paymentMethod.is_valid) {
            return false; // Return false for invalid payment method
        }
        return true; // Return true for valid payment method
    } catch (error) {
        console.error("Error in validatePaymentMethod function:", error);
        throw new Error("Internal server error");
    }
};

export const createPaymentRecord = async (req, res) => {
    try {
        const { _id_user } = req.user;

        const isValidUser = await validateUser(_id_user);
        if (!isValidUser) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized or invalid user",
            });
        }

        const {
            payment_date,
            payment_amount,
            discount_amount,
            discount_type,
            _id_membership_plan,
            _id_payment_method,
        } = req.body;

        const isValidPaymentMethod = await validatePaymentMethod(
            _id_payment_method
        );
        if (!isValidPaymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired payment method",
            });
        }

        // Simulate payment provider's response (replace with actual logic)
        const paymentProviderResponse = simulatePaymentProviderResponse();

        // Determine payment_status based on payment provider's response
        let payment_status;
        switch (paymentProviderResponse) {
            case "approved":
                payment_status = "approved";
                break;
            case "declined":
                payment_status = "declined";
                break;
            default:
                payment_status = "pending";
                break;
        }

        const selectedMembershipPlan = await MembershipPlan.findByPk(
            _id_membership_plan
        );

        const latestSubscription = await Subscription.findOne({
            where: { _id_user: _id_user },
            order: [["createdAt", "DESC"]],
        });

        const currentDate = new Date();
        const oneMonthLater = new Date(currentDate);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

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
                _id_doctor: _id_user,
                createdAt: {
                    [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                },
            },
        });

        const paymentRecord = await PaymentRecord.create({
            payment_date,
            payment_amount,
            payment_status,
            discount_amount,
            discount_type,
            _id_membership_plan,
            _id_payment_method,
            _id_user,
        });

        // Update the subscription status within a transaction
        await sequelize.transaction(async (t) => {
            await latestSubscription.update(
                { state: "expired", is_active: false },
                { where: { _id_user, state: "active" }, transaction: t }
            );

            const newSubscriptionRecord = await Subscription.create(
                {
                    _id_user,
                    subscription_start_date: new Date(),
                    subscription_end_date: oneMonthLater,
                    state: "active",
                    _id_membership_plan,
                    is_active: true,
                },
                { transaction: t }
            );

            await paymentRecord.update(
                {
                    _id_subscription_record:
                        newSubscriptionRecord._id_subscription_record,
                },
                {
                    where: {
                        _id_payment_record: paymentRecord._id_payment_record,
                    },
                    transaction: t,
                }
            );

            res.status(201).json({
                success: true,
                message: "Bill placed correctly",
                paymentRecord: {
                    _id_payment_record: paymentRecord._id_payment_record,
                    total_amount: payment_amount,
                    membership_plan: {
                        _id_membership_plan,
                        plan_name: selectedMembershipPlan.plan_name,
                        consults_limit: selectedMembershipPlan.consults_limit,
                        min_per_consult: selectedMembershipPlan.min_per_consult,
                        is_valid: selectedMembershipPlan.is_valid,
                    },
                    subscription: {
                        _id_subscription:
                            newSubscriptionRecord._id_subscription,
                        subscription_start_date:
                            newSubscriptionRecord.subscription_start_date,
                        subscription_end_date:
                            newSubscriptionRecord.subscription_end_date,
                        state: newSubscriptionRecord.state,
                        used_consults: consultCount,
                    },
                },
            });
        });
    } catch (error) {
        console.error("Error in createPaymentRecord:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Simulate payment provider's response (replace with actual logic)
const simulatePaymentProviderResponse = () => {
    const randomValue = Math.random();
    if (randomValue < 0.7) {
        return "approved";
    } else if (randomValue < 0.9) {
        return "declined";
    } else {
        return "pending";
    }
};
