"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("payment_records", {
            _id_payment_record: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            payment_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            payment_amount: {
                type: Sequelize.DECIMAL(10, 2), // Adjust precision and scale as needed
                allowNull: false,
            },
            payment_status: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            _id_user: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users", // Assuming your User model is named 'User' and its table name is 'users'
                    key: "_id_user",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            _id_payment_method: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "payment_methods", // Assuming your PaymentMethod model is named 'PaymentMethod' and its table name is 'payment_methods'
                    key: "_id_payment_method",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            _id_subscription_record: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "subscription_records", // Assuming your SubscriptionRecord model is named 'SubscriptionRecord' and its table name is 'subscription_records'
                    key: "_id_subscription_record",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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

        await queryInterface.addIndex("payment_records", ["_id_user"]);
        await queryInterface.addIndex("payment_records", [
            "_id_payment_method",
        ]);
        await queryInterface.addIndex("payment_records", [
            "_id_subscription_record",
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("payment_records");
    },
};
