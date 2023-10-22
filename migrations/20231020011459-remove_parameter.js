"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("notes", "_id_parameter", {
            type: Sequelize.UUID,
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("notes", "_id_parameter", {
            type: Sequelize.UUID,
            allowNull: true,
        });
    },
};
