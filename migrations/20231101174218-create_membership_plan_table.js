"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("membership_plans", {
            _id_membership_plan: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            plan_name: {
                type: Sequelize.ENUM("Free", "Growth", "Premium"),
                allowNull: false,
            },
            billing_cycle: {
                type: Sequelize.ENUM("monthly", "yearly"),
                allowNull: false,
            },
            consults_limit: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("membership_plans");
    },
};
