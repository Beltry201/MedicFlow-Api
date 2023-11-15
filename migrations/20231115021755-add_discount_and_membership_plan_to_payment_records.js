"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn(
            "payment_records",
            "_id_membership_plan",
            {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "membership_plans",
                    key: "_id_membership_plan",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            }
        );

        await queryInterface.addColumn("payment_records", "discount_amount", {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.0,
        });

        await queryInterface.addColumn("payment_records", "discount_type", {
            type: Sequelize.ENUM("percentage", "fixed"),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn(
            "payment_records",
            "_id_membership_plan"
        );
        await queryInterface.removeColumn("payment_records", "discount_amount");
        await queryInterface.removeColumn("payment_records", "discount_type");
    },
};
