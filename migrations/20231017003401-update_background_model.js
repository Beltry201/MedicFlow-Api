"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("backgrounds", "_id_parameter", {
            type: Sequelize.UUID,
            allowNull: false,
            field: "_id_parameter_type", // Rename the column
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("backgrounds", "_id_parameter_type", {
            type: Sequelize.UUID,
            allowNull: false,
            field: "_id_parameter", // Rename it back to _id_parameter if you ever need to rollback
        });
    },
};
