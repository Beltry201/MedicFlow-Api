import { MembershipPlan } from "../../models/subscriptions/membership_plans.js";
import { PaymentRecord } from "../../models/subscriptions/payment_records.js";
import { PaymentMethod } from "../../models/subscriptions/payment_methods.js";
import { Subscription } from "../../models/subscriptions/subscriptions.js";
import { Consult } from "../../models/consults/consults.js";
import { User } from "../../models/users/users.js";
import { Op } from "sequelize";

export const getUserSubscription = async (req, res) => {
    const { _id_user } = req.user;

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
    const latestPayment = await PaymentRecord.findOne({
        where: { _id_user },
        order: [["payment_date", "DESC"]],
    });
    const membershipPlan = await MembershipPlan.findByPk(
        latestSubscription._id_membership_plan
    );

    if (latestSubscription.state === "free tier") {
        // Step 5: Check if the subscription is in the "Free" plan
        const freePlan = await MembershipPlan.findOne({
            where: { plan_name: "Free" },
        });

        if (freePlan) {
            const consultCount = await Consult.count({
                where: {
                    _id_doctor: _id_user,
                    createdAt: {
                        [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                    },
                },
            });

            res.status(201).json({
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
                    id_plan: freePlan._id_membership_plan,
                    plan_name: freePlan.plan_name,
                    consults_limit: freePlan.consults_limit,
                    min_per_consult: freePlan.min_per_consult,
                    is_valid: freePlan.is_valid,
                },
            });
        }
    } else if (latestSubscription.state) {
        if (latestPayment) {
            if (membershipPlan) {
                const consultLimit = membershipPlan.monthly_consult_limit;

                // Step 4: Count how many consults the user has made in the current month
                const consultCount = await Consult.count({
                    where: {
                        _id_doctor: user._id_user,
                        createdAt: {
                            [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                        },
                    },
                });

                res.status(201).json({
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
                        id_plan: freePlan._id_membership_plan,
                        plan_name: freePlan.plan_name,
                        consults_limit: freePlan.consults_limit,
                        min_per_consult: freePlan.min_per_consult,
                        is_valid: freePlan.is_valid,
                    },
                });
            }
        }
    }
};

export async function canGenerateMoreConsults(_id_user) {
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

    let latestSubscription, membershipPlan, consultCount, user;

    try {
        latestSubscription = await Subscription.findOne({
            where: { _id_user: _id_user },
            order: [["createdAt", "DESC"]],
        });

        if (!latestSubscription) {
            throw new Error("No subscription found for the user");
        }

        membershipPlan = await MembershipPlan.findByPk(
            latestSubscription._id_membership_plan
        );

        if (!membershipPlan) {
            throw new Error("No membership plan found");
        }

        consultCount = await Consult.count({
            where: {
                _id_doctor: _id_user,
                createdAt: {
                    [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                },
            },
        });

        user = await User.findByPk(_id_user);

        if (!user) {
            throw new Error("No user found");
        }
    } catch (error) {
        return {
            success: false,
            message: error.message,
            membership: membershipPlan,
            consultCount,
            subscription: latestSubscription,
        };
    }
    try {
        if (user.role === "admin") {
            console.log("Es admin");
            return {
                success: true,
                membership: membershipPlan,
                consultCount,
                subscription: latestSubscription,
            };
        }

        if (!latestSubscription) {
            return {
                success: false,
                message: "No subscription found for the user",
                membership: membershipPlan,
                consultCount,
                subscription: latestSubscription,
            };
        }

        if (
            latestSubscription.state === "active" ||
            latestSubscription.state === "free tier"
        ) {
            if (latestSubscription.state === "active") {
                // Step 2: Get the latest payment record for active subscriptions
                const latestPayment = await PaymentRecord.findOne({
                    where: { _id_user: user._id_user },
                    order: [["payment_date", "DESC"]],
                });

                if (
                    !latestPayment ||
                    latestPayment.payment_status !== "approved"
                ) {
                    return {
                        success: false,
                        message:
                            "Payment not approved or no payment record found",
                        membership: membershipPlan,
                        consultCount,
                        subscription: latestSubscription,
                    };
                }

                console.log("\n-- LATEST PAYMENT: ", latestPayment.state);
            }

            if (!membershipPlan) {
                return {
                    success: false,
                    message: "No membership plan found",
                    membership: membershipPlan,
                    consultCount,
                    subscription: latestSubscription,
                };
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
            message: "Internal server error",
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
