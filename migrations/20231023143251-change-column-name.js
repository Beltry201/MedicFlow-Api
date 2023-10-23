"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "users",
            "_id_diploma_organization",
            "diploma_organization"
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "users",
            "diploma_organization",
            "_id_diploma_organization"
        );
    },
};
