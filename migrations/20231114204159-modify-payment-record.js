"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("payment_records", {
            _id_payment_record: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            plan_name: {
                type: Sequelize.STRING(),
                allowNull: false,
            },
            payment_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            payment_amount: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            payment_status: {
                type: Sequelize.ENUM("approved", "declined", "pending"),
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("payment_records", "discount_type");
        await queryInterface.changeColumn("payment_records", "payment_amount", {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
        });
    },
};
