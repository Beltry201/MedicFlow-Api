"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Remove the _id_folder column
        await queryInterface.removeColumn("users", "_id_folder");

        // Set allowNull to false for diploma_organization and profesional_id
        await queryInterface.changeColumn("users", "diploma_organization", {
            type: Sequelize.STRING(255),
            allowNull: false,
        });

        await queryInterface.changeColumn("users", "profesional_id", {
            type: Sequelize.STRING(255),
            allowNull: false,
        });

        // Set allowNull to true for office_address
        await queryInterface.changeColumn("users", "office_address", {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // This is the rollback logic if needed
        await queryInterface.addColumn("users", "_id_folder", {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
        });

        // Reverse the changes for diploma_organization and profesional_id
        await queryInterface.changeColumn("users", "diploma_organization", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.changeColumn("users", "profesional_id", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        // Reverse the change for office_address
        await queryInterface.changeColumn("users", "office_address", {
            type: Sequelize.STRING(255),
            allowNull: false,
            defaultValue: null,
        });
    },
};
