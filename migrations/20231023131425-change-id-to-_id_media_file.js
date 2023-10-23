"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Rename column from id to _id_media_file
        await queryInterface.renameColumn(
            "media_files",
            "id",
            "_id_media_file"
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Reverse the column name change
        await queryInterface.renameColumn(
            "media_files",
            "_id_media_file",
            "id"
        );
    },
};
