"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Set allowNull to true for diploma_organization and profesional_id
        await queryInterface.changeColumn("users", "diploma_organization", {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.changeColumn("users", "profesional_id", {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
        });

        // Set allowNull to true for office_address
        await queryInterface.changeColumn("users", "office_address", {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Reverse the changes for diploma_organization and profesional_id
        await queryInterface.changeColumn("users", "diploma_organization", {
            type: Sequelize.STRING(255),
            allowNull: false,
        });

        await queryInterface.changeColumn("users", "profesional_id", {
            type: Sequelize.STRING(255),
            allowNull: false,
        });

        // Reverse the change for office_address
        await queryInterface.changeColumn("users", "office_address", {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
        });
    },
};
