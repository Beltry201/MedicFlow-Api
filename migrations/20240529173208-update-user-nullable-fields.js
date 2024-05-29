"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("users", "name", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await queryInterface.changeColumn("users", "last_name", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("users", "name", {
            type: Sequelize.STRING(255),
            allowNull: false,
        });
        await queryInterface.changeColumn("users", "last_name", {
            type: Sequelize.STRING(255),
            allowNull: false,
        });
    },
};
