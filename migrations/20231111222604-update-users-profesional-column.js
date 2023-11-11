"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Change the column name from profesional_id to professional_id
        await queryInterface.renameColumn(
            "users",
            "profesional_id",
            "professional_id"
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Change the column name back to profesional_id
        await queryInterface.renameColumn(
            "users",
            "professional_id",
            "profesional_id"
        );
    },
};
