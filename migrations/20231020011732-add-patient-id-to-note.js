"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("notes", "_id_patient", {
            type: Sequelize.UUID,
            allowNull: true, // Allow null values
            references: {
                model: "patients",
                key: "_id_patient",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        });

        await queryInterface.removeColumn("notes", "_id_media");
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("notes", "_id_patient");

        await queryInterface.addColumn("notes", "_id_media", {
            type: Sequelize.UUID,
            allowNull: true,
        });
    },
};
