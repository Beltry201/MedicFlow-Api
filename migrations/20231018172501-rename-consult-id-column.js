"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("media_files", "consult_id", {
            type: Sequelize.UUID,
            allowNull: true,
            defaultValue: null,
            field: "_id_consult",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("media_files", "_id_consult", {
            type: Sequelize.UUID,
            allowNull: false,
            defaultValue: Sequelize.literal("false"),
            field: "consult_id",
        });
    },
};
