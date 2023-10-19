"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("consults", "treatment_name", {
            type: Sequelize.STRING, // Adjust the data type as needed
            allowNull: true, // Adjust this based on your requirements
        });

        await queryInterface.addColumn("consults", "treatment_price", {
            type: Sequelize.FLOAT, // Adjust the data type as needed
            allowNull: true, // Adjust this based on your requirements
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("consults", "treatment_name");
        await queryInterface.removeColumn("consults", "treatment_price");
    },
};
