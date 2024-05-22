import { SubscriptionRecord } from "../../models/subscriptions/subscriptions.js";
import { MembershipPlan } from "../../models/subscriptions/membership_plans.js";
import { sequelize } from "../../config/db.js";
import { Consult } from "../../models/consults/consults.js";
import { Op } from "sequelize";

export class SubscriptionService {
    async createFreeSubscription(_id_doctor) {
        let transaction;

        try {
            transaction = await sequelize.transaction();
            const freeMembershipPlan = await MembershipPlan.findByPk(1);

            if (!freeMembershipPlan) {
                throw new Error("Free membership plan not found");
            }

            // Calculate subscription dates (from today to one month later)
            const today = new Date();
            const oneMonthLater = new Date(today);
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

            const newSubscription = await SubscriptionRecord.create(
                {
                    _id_doctor,
                    _id_membership_plan: freeMembershipPlan._id_membership_plan,
                    subscription_start_date: today,
                    subscription_end_date: oneMonthLater,
                    state: "free tier",
                    is_active: true,
                },
                { transaction }
            );

            await transaction.commit();
            return newSubscription;
        } catch (error) {
            // Rollback transaction on error
            if (transaction) await transaction.rollback();
            console.error(error);
            throw new Error(
                error.message || "Failed to create free subscription"
            );
        }
    }

    async getActiveSubscriptionDetails(doctorId) {
        try {
            const activeSubscription = await SubscriptionRecord.findOne({
                where: {
                    _id_doctor: doctorId,
                    is_active: true,
                },
                include: {
                    model: MembershipPlan,
                    required: true,
                },
            });

            if (!activeSubscription) {
                return null; // No active subscription found
            }

            const currentDate = new Date();
            const {
                subscription_start_date,
                subscription_end_date,
                MembershipPlan: { consults_cycle, consults_limit },
            } = activeSubscription;

            // 1. Calculate consults left according to consults cycle
            const consultsLeft = await this.calculateConsultsLeft(
                doctorId,
                subscription_start_date,
                subscription_end_date,
                consults_cycle,
                consults_limit
            );

            console.log("\n-- CONSULTS LEFT: ", consultsLeft);
            // 2. Calculate days left for next consults cycle
            const daysLeftToConsultCycle = this.calculateDaysLeftToConsultCycle(
                currentDate,
                subscription_start_date,
                consults_cycle
            );

            const daysLeftToSubscriptionEnd = Math.ceil(
                (new Date(subscription_end_date) - currentDate) /
                    (24 * 60 * 60 * 1000)
            );

            const subscriptionDetails = {
                plan_name: activeSubscription.MembershipPlan.plan_name,
                subscription_start_date,
                subscription_end_date,
                consults_limit,
                consults_left: consultsLeft,
                days_left_to_cycle: daysLeftToConsultCycle,
                days_left_to_subscription_end: daysLeftToSubscriptionEnd,
            };

            return subscriptionDetails;
        } catch (error) {
            console.error(error);
            throw new Error("Failed to fetch active subscription details");
        }
    }

    async calculateConsultsLeft(
        doctorId,
        startDate,
        endDate,
        consultsCycle,
        consultsLimit
    ) {
        try {
            let consults = [];

            // Query consults based on consults cycle
            if (consultsCycle === "weekly") {
                // Calculate start and end dates for the current week
                const currentDate = new Date();
                const weekStart = new Date(currentDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6); // End of current week

                // Query consults made within the current week before cycling
                consults = await Consult.findAll({
                    where: {
                        _id_doctor: doctorId,
                        createdAt: {
                            [Op.between]: [weekStart, weekEnd],
                        },
                    },
                });
            } else if (consultsCycle === "monthly") {
                // Query consults made within the subscription period
                consults = await Consult.findAll({
                    where: {
                        _id_doctor: doctorId,
                        createdAt: {
                            [Op.between]: [startDate, endDate],
                        },
                    },
                });
            }

            // Calculate consults left based on consults made and consults limit
            const consultsMade = consults.length;
            const consultsLeft = Math.max(0, consultsLimit - consultsMade);

            return consultsLeft;
        } catch (error) {
            console.error("Error calculating consults left:", error);
            throw error;
        }
    }

    calculateDaysLeftToConsultCycle(currentDate, startDate, consultsCycle) {
        if (consultsCycle === "weekly") {
            const weeksElapsed = Math.floor(
                (currentDate - startDate) / (7 * 24 * 60 * 60 * 1000)
            );
            const daysLeftInCurrentWeek =
                7 - (currentDate.getDay() - startDate.getDay());
            return {
                weeks_elapsed: weeksElapsed,
                days_left_in_current_cycle: daysLeftInCurrentWeek,
            };
        } else if (consultsCycle === "monthly") {
            const monthsElapsed =
                (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
                currentDate.getMonth() -
                startDate.getMonth();
            const nextMonthStartDate = new Date(startDate);
            nextMonthStartDate.setMonth(
                nextMonthStartDate.getMonth() + monthsElapsed + 1
            );
            const daysLeftInCurrentMonth = Math.ceil(
                (nextMonthStartDate - currentDate) / (24 * 60 * 60 * 1000)
            );
            return {
                months_elapsed: monthsElapsed,
                days_left_in_current_cycle: daysLeftInCurrentMonth,
            };
        } else {
            // Handle other consult cycles like yearly if necessary
            return {
                message:
                    "Consult cycle other than weekly or monthly is not yet handled",
            };
        }
    }
}
