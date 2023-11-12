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
        const latestPayment = await PaymentRecord.findOne({
            where: { _id_user },
            order: [["payment_date", "DESC"]],
        });
        if (latestPayment) {
            // Step 3: Get the associated membership plan and consult limit
            const membershipPlan = await MembershipPlan.findByPk(
                latestSubscription._id_membership_plan
            );

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
                        latestSubscription,
                    },
                    consult: formattedConsult,
                });
            }
        }
    }
};
