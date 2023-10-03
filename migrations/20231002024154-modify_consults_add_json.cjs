"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("consults", "consult_json", {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: {},
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("consults", "consult_json");
    },
};
