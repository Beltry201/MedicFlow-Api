import { MembershipPlan } from "../../models/subscriptions/membership_plans.js";
import { PaymentRecord } from "../../models/subscriptions/payment_records.js";
import { Subscription } from "../../models/subscriptions/subscriptions.js";
import { Consult } from "../../models/consults/consults.js";
import { User } from "../../models/users/users.js";
import { sequelize } from "../../config/db.js";
import { Op } from "sequelize";

export const getUserSubscription = async (req, res) => {
    const { _id_user } = req.user;

    try {
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

        // Step 1: Get the user's latest subscription record
        const latestSubscription = await Subscription.findOne({
            where: { _id_user: _id_user },
            order: [["createdAt", "DESC"]],
        });

        if (!latestSubscription) {
            return res.status(404).json({
                success: false,
                message: "User has no subscription record",
            });
        }

        // Step 2: Get the latest payment record
        const latestPayment = await PaymentRecord.findOne({
            where: { _id_user: _id_user },
            order: [["payment_date", "DESC"]],
        });

        // Step 3: Get the membership plan
        const membershipPlan = await MembershipPlan.findByPk(
            latestSubscription._id_membership_plan
        );

        // Step 4: Count how many consults the user has made in the current month
        const consultCount = await Consult.count({
            where: {
                _id_doctor: _id_user,
                createdAt: {
                    [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                },
            },
        });

        // Step 5: Check if the subscription is in the "Free" plan
        if (latestSubscription.state === "free tier" && membershipPlan) {
            res.status(200).json({
                success: true,
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
                    id_plan: membershipPlan._id_membership_plan,
                    plan_name: membershipPlan.plan_name,
                    consults_limit: membershipPlan.consults_limit,
                    min_per_consult: membershipPlan.min_per_consult,
                    is_valid: membershipPlan.is_valid,
                },
            });
        } else if (
            latestSubscription.state &&
            latestPayment &&
            membershipPlan
        ) {
            const consultLimit = membershipPlan.monthly_consult_limit;

            res.status(200).json({
                success: true,
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
                    id_plan: membershipPlan._id_membership_plan,
                    plan_name: membershipPlan.plan_name,
                    consults_limit: membershipPlan.consults_limit,
                    min_per_consult: membershipPlan.min_per_consult,
                    is_valid: membershipPlan.is_valid,
                },
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Unable to retrieve subscription details",
            });
        }
    } catch (error) {
        console.error("Error in getUserSubscription:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export async function canGenerateMoreConsults(_id_user) {
    try {
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

        // Fetch necessary data
        const latestSubscription = await Subscription.findOne({
            where: { _id_user: _id_user },
            order: [["createdAt", "DESC"]],
        });

        if (!latestSubscription) {
            throw new Error("No subscription found for the user");
        }

        const membershipPlan = await MembershipPlan.findByPk(
            latestSubscription._id_membership_plan
        );

        if (!membershipPlan) {
            throw new Error("No membership plan found");
        }

        const consultCount = await Consult.count({
            where: {
                _id_doctor: _id_user,
                createdAt: {
                    [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                },
            },
        });

        const user = await User.findByPk(_id_user);

        if (!user) {
            throw new Error("No user found");
        }

        // Check eligibility for generating more consults
        if (user.role === "admin") {
            return {
                success: true,
                membership: membershipPlan,
                consultCount,
                subscription: latestSubscription,
            };
        }

        if (!latestSubscription) {
            throw new Error("No subscription found for the user");
        }

        if (
            latestSubscription.state === "active" ||
            latestSubscription.state === "free tier"
        ) {
            if (latestSubscription.state === "active") {
                // Get the latest payment record for active subscriptions
                const latestPayment = await PaymentRecord.findOne({
                    where: { _id_user: user._id_user },
                    order: [["payment_date", "DESC"]],
                });

                if (
                    !latestPayment ||
                    latestPayment.payment_status !== "approved"
                ) {
                    throw new Error(
                        "Payment not approved or no payment record found"
                    );
                }

                console.log("\n-- LATEST PAYMENT: ", latestPayment.state);
            }

            if (!membershipPlan) {
                throw new Error("No membership plan found");
            }

            const consultLimit = membershipPlan.consults_limit;

            if (consultCount < consultLimit) {
                return {
                    success: true,
                    membership: membershipPlan,
                    consultCount,
                    subscription: latestSubscription,
                };
            }
        }
    } catch (error) {
        console.error("Error in canGenerateMoreConsults:", error);
        return {
            success: false,
            message: error.message,
            membership: membershipPlan,
            consultCount,
            subscription: latestSubscription,
        };
    }

    return {
        success: false,
        message: "User is not eligible to generate more consults",
        membership: membershipPlan,
        consultCount,
        subscription: latestSubscription,
    };
}

export const createSubscription = async (req, res) => {
    const { _id_user } = req.user;
    const { _id_membership_plan } = req.query;

    try {
        // Start a Sequelize transaction
        await sequelize.transaction(async (transaction) => {
            // Find the user's latest subscription
            const latestSubscription = await Subscription.findOne({
                where: { _id_user },
                order: [["createdAt", "DESC"]],
                transaction,
            });

            // Expire the latest subscription if it exists
            if (latestSubscription) {
                await latestSubscription.update(
                    { state: "expired", is_active: false },
                    { transaction }
                );
            }

            // Create a new subscription
            const selectedMembershipPlan = await MembershipPlan.findByPk(
                _id_membership_plan,
                { transaction }
            );

            const oneMonthLater = new Date();
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

            const newSubscriptionRecord = await Subscription.create(
                {
                    _id_user,
                    subscription_start_date: new Date(),
                    subscription_end_date: oneMonthLater,
                    state: "active",
                    _id_membership_plan,
                    is_active: true,
                },
                { transaction }
            );

            // Get consult count for the current month
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
                    _id_doctor: _id_user,
                    createdAt: {
                        [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                    },
                },
                transaction,
            });

            // Respond with success
            res.status(201).json({
                success: true,
                message: "Subscription created successfully",
                subscription: {
                    _id_subscription: newSubscriptionRecord._id_subscription,
                    subscription_start_date:
                        newSubscriptionRecord.subscription_start_date,
                    subscription_end_date:
                        newSubscriptionRecord.subscription_end_date,
                    state: newSubscriptionRecord.state,
                    used_consults: consultCount,
                },
                membership_plan: {
                    _id_membership_plan,
                    plan_name: selectedMembershipPlan.plan_name,
                    consults_limit: selectedMembershipPlan.consults_limit,
                    min_per_consult: selectedMembershipPlan.min_per_consult,
                    is_valid: selectedMembershipPlan.is_valid,
                },
            });
        });
    } catch (error) {
        console.error("Error in createSubscription:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updateSubscription = async (req, res) => {
    const { _id_user } = req.user;
    const { _id_membership_plan } = req.query;

    try {
        // Check if the specified membership plan ID exists
        const selectedMembershipPlan = await MembershipPlan.findByPk(
            _id_membership_plan
        );

        if (!selectedMembershipPlan) {
            // Respond with an error if the membership plan does not exist
            return res.status(400).json({
                success: false,
                message: "Invalid membership plan ID",
            });
        }

        // Find the user's latest subscription
        const latestSubscription = await Subscription.findOne({
            where: { _id_user },
            order: [["createdAt", "DESC"]],
        });

        // Expire the latest subscription if it exists
        if (latestSubscription) {
            await latestSubscription.update({
                _id_membership_plan,
            });
        } else {
            // Create a new subscription if no previous subscription exists
            const oneMonthLater = new Date();
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

            const newSubscriptionRecord = await Subscription.create({
                _id_user,
                subscription_start_date: new Date(),
                subscription_end_date: oneMonthLater,
                state: "active",
                _id_membership_plan,
                is_active: true,
            });

            // Get consult count for the current month
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
                    _id_doctor: _id_user,
                    createdAt: {
                        [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                    },
                },
            });

            // Respond with success
            res.status(201).json({
                success: true,
                message: "Subscription created successfully",
                subscription: {
                    _id_subscription: newSubscriptionRecord._id_subscription,
                    subscription_start_date:
                        newSubscriptionRecord.subscription_start_date,
                    subscription_end_date:
                        newSubscriptionRecord.subscription_end_date,
                    state: newSubscriptionRecord.state,
                    used_consults: consultCount,
                },
                membership_plan: {
                    _id_membership_plan,
                    plan_name: selectedMembershipPlan.plan_name,
                    consults_limit: selectedMembershipPlan.consults_limit,
                    min_per_consult: selectedMembershipPlan.min_per_consult,
                    is_valid: selectedMembershipPlan.is_valid,
                },
            });
        }
    } catch (error) {
        console.error("Error in updateSubscription:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
