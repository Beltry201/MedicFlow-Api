"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("payment_records", "plan_name");
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("payment_records", "plan_name", {
            type: Sequelize.STRING(),
            allowNull: false,
        });
    },
};
