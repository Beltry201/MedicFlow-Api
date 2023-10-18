"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("treatments_catalog", "is_valid", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("treatments_catalog", "is_valid");
    },
};
