"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("payment_methods", {
            _id_payment_method: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            card_number: {
                type: Sequelize.STRING(16),
                allowNull: false,
            },
            card_holder: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            expiration_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            cvv: {
                type: Sequelize.STRING(4),
                allowNull: false,
            },
            _id_doctor: {
                type: Sequelize.UUID,
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
        await queryInterface.dropTable("payment_methods");
    },
};
