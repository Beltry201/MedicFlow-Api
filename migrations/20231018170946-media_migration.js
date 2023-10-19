"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "media_files",
            "consult_id",
            "_id_consult"
        );

        await queryInterface.addColumn("media_files", "_id_patient", {
            type: Sequelize.UUID,
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "media_files",
            "_id_consult",
            "consult_id"
        );

        await queryInterface.removeColumn("media_files", "_id_patient");
    },
};
