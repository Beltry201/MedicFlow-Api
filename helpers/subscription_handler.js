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
        order: [["createdAt", "DESC"]],
    });

    if (latestSubscription) {
        console.log("\n-- SUBSCRIPTION FOUND: ", latestSubscription.state);

        if (latestSubscription.state === "Active") {
            // Step 2: Get the latest payment record
            const latestPayment = await PaymentRecord.findOne({
                where: { _id_user: user._id_user },
                order: [["payment_date", "DESC"]], // Assuming payment_date indicates the order of payments
            });

            if (latestPayment) {
                console.log(
                    "Latest Payment:",
                    latestPayment._id_membership_plan
                );

                // Step 3: Get the associated membership plan and consult limit
                const membershipPlan = await MembershipPlan.findByPk(
                    latestPayment._id_membership_plan
                );

                if (membershipPlan) {
                    const consultLimit = membershipPlan.monthly_consult_limit;

                    console.log("Membership Plan:", membershipPlan.plan_name);
                    console.log("Monthly Consult Limit:", consultLimit);

                    // Step 4: Count how many consults the user has made in the current month
                    const consultCount = await Consult.count({
                        where: {
                            _id_doctor: user._id_user,
                            createdAt: {
                                [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                            },
                        },
                    });

                    console.log("Consult Count:", consultCount);

                    return consultCount < consultLimit;
                }
            }
        } else if (latestSubscription.state === "Free Tier") {
            // Step 5: Check if the subscription is in the "Free" plan
            const freePlan = await MembershipPlan.findOne({
                where: { plan_name: "Free" }, // Assuming "Free" is the plan name for the Free Tier
            });

            if (freePlan) {
                const consultLimit = freePlan.monthly_consult_limit;

                console.log("Membership Plan:", freePlan.plan_name);
                console.log("Monthly Consult Limit:", consultLimit);

                // Step 6: Count how many consults the user has made in the current month
                const consultCount = await Consult.count({
                    where: {
                        _id_doctor: user._id_user,
                        createdAt: {
                            [Op.between]: [firstDayOfMonth, lastDayOfMonth],
                        },
                    },
                });

                console.log("Consult Count:", consultCount);

                return consultCount < consultLimit;
            }
        }
    }

    return false;
}
