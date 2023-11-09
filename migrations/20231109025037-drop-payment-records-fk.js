"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint(
            "payment_records",
            "payment_records__id_subscription_record_fkey"
        );
    },

    down: async (queryInterface, Sequelize) => {
        // If you ever need to recreate the foreign key, you can generate a new migration
    },
};
