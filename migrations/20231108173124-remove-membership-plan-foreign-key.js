"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn(
            "subscription_records",
            "_id_membership_plan"
        );
        await queryInterface.removeConstraint(
            "subscription_records",
            "FK_subscription_records_membership_plan"
        ); // Remove foreign key constraint
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn(
            "subscription_records",
            "_id_membership_plan",
            {
                type: Sequelize.UUID,
                references: {
                    model: "membership_plans",
                    key: "_id_membership_plan",
                },
                allowNull: true,
            }
        );
    },
};
