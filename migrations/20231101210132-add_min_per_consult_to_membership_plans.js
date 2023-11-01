"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("membership_plans", "min_per_consult", {
            type: Sequelize.FLOAT,
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn(
            "membership_plans",
            "min_per_consult"
        );
    },
};
