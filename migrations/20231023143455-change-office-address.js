"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "users",
            "_office_address",
            "office_address"
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "users",
            "office_address",
            "_office_address"
        );
    },
};
