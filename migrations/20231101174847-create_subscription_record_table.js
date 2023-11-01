"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("subscription_records", {
            _id_subscription_record: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            subscription_start_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            subscription_end_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            state: {
                type: Sequelize.ENUM(
                    "Active",
                    "Pending",
                    "Trial",
                    "Cancelled",
                    "Suspended",
                    "Expired",
                    "Grace Period",
                    "Pending Cancellation",
                    "Free Tier"
                ),
                allowNull: false,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            _id_user: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users", // Assuming your User model is named 'User' and its table name is 'users'
                    key: "_id_user",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            _id_membership_plan: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "membership_plans", // Assuming your MembershipPlan model is named 'MembershipPlan' and its table name is 'membership_plans'
                    key: "_id_membership_plan",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });

        await queryInterface.addIndex("subscription_records", ["_id_user"]);
        await queryInterface.addIndex("subscription_records", [
            "_id_membership_plan",
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("subscription_records");
    },
};
