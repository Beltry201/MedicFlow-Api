"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("notes", "_id_consult");
        await queryInterface.removeColumn("notes", "title");
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("notes", "_id_consult", {
            type: Sequelize.UUID,
            allowNull: false,
        });
        await queryInterface.addColumn("notes", "title", {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },
};
