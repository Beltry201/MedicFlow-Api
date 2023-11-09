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
                    model: "users", // Make sure to use the actual table name for the User model
                    key: "_id_user",
                },
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("subscription_records");
    },
};