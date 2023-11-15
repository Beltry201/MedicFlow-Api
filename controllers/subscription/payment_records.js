import { PaymentRecord } from "../../models/subscriptions/payment_records.js";
import { Subscription } from "../../models/subscriptions/subscriptions.js";
import { MembershipPlan } from "../../models/subscriptions/membership_plans.js";
import { User } from "../../models/users/users.js";
import { Op } from "sequelize";

export const createPaymentRecord = async (req, res) => {
    try {
        const { _id_user } = req.user;

        const {
            payment_date,
            payment_amount,
            payment_status,
            discount_amount,
            discount_type,
            _id_membership_plan,
            _id_payment_method,
        } = req.body;

        const oneMonthLater = new Date();
        oneMonthLater.setMonth(currentDate.getMonth() + 1);

        const selectedMebershipPlan = await MembershipPlan.findByPk(
            _id_membership_plan
        );

        const latestSubscription = await Subscription.findOne({
            where: { _id_user: _id_user },
            order: [["createdAt", "DESC"]],
        });

        // Create the payment record
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

        // Update the subscription status
        await latestSubscription.update(
            { state: "expired", is_valid: false },
            { where: { _id_user, state: "active" } }
        );

        const newSubscriptionRecord = await Subscription.create({
            _id_user,
            subscription_start_date: new Date(),
            subscription_end_date: oneMonthLater,
            state: "active",
            _id_membership_plan,
            is_active: true,
        });

        res.status(201).json({
            success: true,
            message: "Bill placed correctly",
            paymentRecord: {
                _id_payment_record: paymentRecord._id_payment_record,
                total_amount: payment_amount,
                membership_plan: {
                    _id_membership_plan,
                    plan_name: selectedMebershipPlan.plan_name,
                    consults_limit: selectedMebershipPlan.consults_limit,
                    min_per_consult: selectedMebershipPlan.min_per_consult,
                    is_valid: selectedMebershipPlan.is_valid,
                },
                subscription: {
                    _id_subscription: newSubscriptionRecord._id_subscription,
                    subscription_start_date:
                        newSubscriptionRecord.subscription_start_date,
                    subscription_end_date:
                        newSubscriptionRecord.subscription_end_date,
                    state: newSubscriptionRecord.state,
                    used_consults: consultCount,
                },
            },
        });
    } catch (error) {
        console.error("Error in createPaymentRecord:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Helper function to calculate discounts
const calculateDiscount = (originalAmount, discountAmount, discountType) => {
    let discountedAmount = originalAmount;
    if (discountType === "percentage") {
        discountedAmount =
            originalAmount - (originalAmount * discountAmount) / 100;
    } else if (discountType === "fixed") {
        discountedAmount = originalAmount - discountAmount;
    }

    return { discountedAmount };
};
