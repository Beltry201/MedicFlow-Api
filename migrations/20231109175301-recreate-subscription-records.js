"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add your migration code here
        await queryInterface.createTable("subscription_records", {
            _id_subscription_record: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            subscription_start_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            subscription_end_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            state: {
                type: DataTypes.ENUM(
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
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Add your migration code for reverting here
        await queryInterface.dropTable("subscription_records");
    },
};
