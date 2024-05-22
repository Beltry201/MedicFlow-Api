"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("consults", "_id_patient");
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("consults", "_id_patient", {
            type: Sequelize.UUID,
            allowNull: false,
        });
    },
};
