"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "consults",
            "recording_duration",
            "recording_duration_s"
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.renameColumn(
            "consults",
            "recording_duration_s",
            "recording_duration"
        );
    },
};
