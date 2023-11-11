import { Consult } from "../models/consults/consults.js";
import { MembershipPlan } from "../models/subscriptions/membership_plans.js";
import { PaymentRecord } from "../models/subscriptions/payment_records.js";
import { Subscription } from "../models/subscriptions/subscriptions.js";
import { Op } from "sequelize";

export async function canGenerateMoreConsults(user) {
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
        order: [["createdAt", "DESC"]], // Assuming createdAt indicates the order of subscriptions
    });

    if (latestSubscription) {
        console.log("\n-- LATEST SUB: ", latestSubscription.state);

        if (latestSubscription.state === "active") {
            // Step 2: Get the latest payment record
            const latestPayment = await PaymentRecord.findOne({
                where: { _id_user: user._id_user },
                order: [["payment_date", "DESC"]], // Assuming payment_date indicates the order of payments
            });

            if (latestPayment.payment_status === "approved") {
                console.log("\n-- LATEST PAYMENT: ", latestPayment.state);

                // Step 3: Get the associated membership plan and consult limit
                const membershipPlan = await MembershipPlan.findByPk(
                    latestSubscription._id_membership_plan
                );

                if (membershipPlan) {
                    const consultLimit = membershipPlan.monthly_consult_limit;

                    console.log("\n-- MEMBERSHIP PLAN: ", freePlan.plan_name);
                    console.log("\n-- MONTHLY LIMIMT: ", consultLimit);

                    // Step 4: Count how many consults the user has made in the current month
                    const consultCount = await Consult.count({
                        where: {
                            _id_doctor: user._id_user,
                            createdAt: {
                                [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                            },
                        },
                    });

                    console.log("\n-- COSNULT COUNT:", consultCount);

                    return consultCount < consultLimit;
                }
            }
        } else if (latestSubscription.state === "free tier") {
            // Step 5: Check if the subscription is in the "Free" plan
            console.log("\n-- FREE TIER");
            const freePlan = await MembershipPlan.findOne({
                where: { plan_name: "Free" }, // Assuming "Free" is the plan name for the Free Tier
            });

            if (freePlan) {
                const consultLimit = freePlan.consults_limit;

                console.log("\n-- MEMBERSHIP PLAN: ", freePlan.plan_name);
                console.log("\n-- MONTHLY LIMIMT: ", consultLimit);

                // Step 6: Count how many consults the user has made in the current month
                const consultCount = await Consult.count({
                    where: {
                        _id_doctor: user._id_user,
                        createdAt: {
                            [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                        },
                    },
                });

                console.log("\n-- CONSULT COUNT:", consultCount);

                return consultCount < consultLimit;
            }
        }
    }

    return false;
}
