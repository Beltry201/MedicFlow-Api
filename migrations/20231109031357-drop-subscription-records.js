"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("subscription_records");
    },

    down: async (queryInterface, Sequelize) => {
        // If you ever need to recreate the table, you can generate a new migration
    },
};
