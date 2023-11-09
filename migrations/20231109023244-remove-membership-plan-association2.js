"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn(
            "subscription_records",
            "_id_membership_plan"
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn(
            "subscription_records",
            "_id_membership_plan",
            {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "membership_plans",
                    key: "_id_membership_plan",
                },
            }
        );
    },
};
