import { MembershipPlan } from "../../models/subscriptions/membership_plans.js";
import { isAdmin } from "../../helpers/admin_access.js";

// 1. Create Membership Plan
export const createMembershipPlan = async (req, res) => {
    try {
        // Admin validation
        isAdmin(req, res, async () => {
            const newMembershipPlan = await MembershipPlan.create(req.body);
            res.status(201).json({
                success: true,
                message: "Membership plan created successfully",
                membershipPlan: newMembershipPlan,
            });
        });
    } catch (error) {
        console.error("Error in createMembershipPlan:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// 2. Get All Membership Plans
export const getAllMembershipPlans = async (req, res) => {
    try {
        // Admin validation
        isAdmin(req, res, async () => {
            const membershipPlans = await MembershipPlan.findAll();
            res.status(200).json({
                success: true,
                membershipPlans,
            });
        });
    } catch (error) {
        console.error("Error in getAllMembershipPlans:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// 4. Update Membership Plan
export const updateMembershipPlan = async (req, res) => {
    const { _id_membership_plan } = req.params;

    try {
        // Admin validation
        isAdmin(req, res, async () => {
            const membershipPlan = await MembershipPlan.findByPk(
                _id_membership_plan
            );

            if (!membershipPlan) {
                return res.status(404).json({
                    success: false,
                    message: "Membership plan not found",
                });
            }

            await membershipPlan.update(req.body);

            res.status(200).json({
                success: true,
                message: "Membership plan updated successfully",
                membershipPlan,
            });
        });
    } catch (error) {
        console.error("Error in updateMembershipPlan:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// 5. Delete Membership Plan
export const deleteMembershipPlan = async (req, res) => {
    const { _id_membership_plan } = req.params;

    try {
        // Admin validation
        isAdmin(req, res, async () => {
            const membershipPlan = await MembershipPlan.findByPk(
                _id_membership_plan
            );

            if (!membershipPlan) {
                return res.status(404).json({
                    success: false,
                    message: "Membership plan not found",
                });
            }

            await membershipPlan.destroy();

            res.status(200).json({
                success: true,
                message: "Membership plan deleted successfully",
            });
        });
    } catch (error) {
        console.error("Error in deleteMembershipPlan:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
