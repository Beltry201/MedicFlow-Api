"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("patients", "is_valid", {
            type: Sequelize.BOOLEAN,
            defaultValue: true, // Change the default value to true
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("patients", "is_valid", {
            type: Sequelize.BOOLEAN,
            defaultValue: false, // Set the default value back to false if rolling back
            allowNull: false,
        });
    },
};
