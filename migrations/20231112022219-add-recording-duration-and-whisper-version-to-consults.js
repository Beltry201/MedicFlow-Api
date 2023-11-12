"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add recording_duration and whisper_version columns
        await queryInterface.addColumn("consults", "recording_duration", {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.addColumn("consults", "whisper_version", {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Rollback logic
        await queryInterface.removeColumn("consults", "recording_duration");
        await queryInterface.removeColumn("consults", "whisper_version");
    },
};
