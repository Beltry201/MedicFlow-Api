"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("consults", "completion_tokens", {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.addColumn("consults", "prompt_tokens", {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("consults", "completion_tokens");
        await queryInterface.removeColumn("consults", "prompt_tokens");
    },
};
