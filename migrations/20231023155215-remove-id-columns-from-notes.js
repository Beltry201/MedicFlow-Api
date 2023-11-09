"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("notes", "_id_parameter");
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("notes", "_id_parameter", {
            type: Sequelize.UUID, // Adjust the data type if necessary
            allowNull: true, // Adjust allowNull to true or false as needed
        });
    },
};
