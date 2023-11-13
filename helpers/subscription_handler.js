import { Consult } from "../models/consults/consults.js";
import { MembershipPlan } from "../models/subscriptions/membership_plans.js";
import { PaymentRecord } from "../models/subscriptions/payment_records.js";
import { Subscription } from "../models/subscriptions/subscriptions.js";
import { Op } from "sequelize";

export async function canGenerateMoreConsults(user) {
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
            where: { _id_user: user._id_user },
            order: [["createdAt", "DESC"]],
        });

        if (!latestSubscription) {
            return {
                success: false,
                message: "No subscription found for the user",
            };
        }

        console.log("\n-- LATEST SUB: ", latestSubscription.state);

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
                    };
                }

                console.log("\n-- LATEST PAYMENT: ", latestPayment.state);
            }

            // Step 3: Get the associated membership plan and consult limit
            const membershipPlan = await MembershipPlan.findByPk(
                latestSubscription._id_membership_plan
            );

            if (!membershipPlan) {
                return { success: false, message: "No membership plan found" };
            }

            const consultLimit = membershipPlan.consults_limit;

            console.log("\n-- MEMBERSHIP PLAN: ", membershipPlan.plan_name);
            console.log("\n-- MONTHLY LIMIT: ", consultLimit);

            // Step 4: Count how many consults the user has made in the current month
            const consultCount = await Consult.count({
                where: {
                    _id_doctor: user._id_user,
                    createdAt: {
                        [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                    },
                },
            });

            console.log("\n-- CONSULT COUNT:", consultCount);

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
        return { success: false, message: "Internal server error" };
    }

    return {
        success: false,
        message: "User is not eligible to generate more consults",
    };
}
