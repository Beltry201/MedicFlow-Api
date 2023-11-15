"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add entity column to payment_methods table
        await queryInterface.addColumn("payment_methods", "entity", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        // Add description and payment_type columns to payment_methods table
        await queryInterface.addColumn("payment_methods", "description", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.addColumn("payment_methods", "payment_type", {
            type: Sequelize.ENUM("credit", "debit", "cash", "other"),
            allowNull: true,
        });
    },

    down: async (queryInterface) => {
        // Remove columns in reverse order to their creation
        await queryInterface.removeColumn("payment_methods", "payment_type");
        await queryInterface.removeColumn("payment_methods", "description");
        await queryInterface.removeColumn("payment_methods", "entity");
    },
};
