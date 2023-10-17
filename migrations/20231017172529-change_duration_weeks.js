"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn(
            "treatments_catalog",
            "duration_weeks",
            {
                type: Sequelize.INTEGER,
                allowNull: true, // Allow null
                defaultValue: null, // Set default value to null
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn(
            "treatments_catalog",
            "duration_weeks",
            {
                type: Sequelize.INTEGER,
                allowNull: false, // Restore original allowNull value if necessary
            }
        );
    },
};
