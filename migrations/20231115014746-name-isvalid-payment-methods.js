"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("payment_methods", "name", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.addColumn("payment_methods", "is_valid", {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("payment_methods", "name");
        await queryInterface.removeColumn("payment_methods", "is_valid");
    },
};
