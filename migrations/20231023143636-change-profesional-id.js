"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "users",
            "_id_profesional_id",
            "profesional_id"
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "users",
            "profesional_id",
            "_id_profesional_id"
        );
    },
};
