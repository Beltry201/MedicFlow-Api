"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("users", "diploma_organization", {
            type: Sequelize.STRING(255),
            allowNull: false,
            defaultValue: "NEEDS UPDATE", // Set a default value
        });

        // Update existing rows with a default value
        await queryInterface.sequelize.query(
            'UPDATE "users" SET "diploma_organization" = :defaultValue WHERE "diploma_organization" IS NULL',
            {
                replacements: { defaultValue: "NEEDS UPDATE" },
                type: queryInterface.sequelize.QueryTypes.UPDATE,
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("users", "diploma_organization");
    },
};
