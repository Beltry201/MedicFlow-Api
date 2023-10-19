"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("consults", "treatment_name", {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.addColumn("consults", "treatment_price", {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("consults", "treatment_name");
        await queryInterface.removeColumn("consults", "treatment_price");
    },
};
