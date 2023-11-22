"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Remove the 'parameter_types' table
        await queryInterface.dropTable("parameters_types");

        // Remove the 'backgrounds' table
        await queryInterface.dropTable("backgrounds");
    },

    down: async (queryInterface, Sequelize) => {
        // Create 'parameter_types' table with the same structure
        await queryInterface.createTable("parameters_types", {
            // Define the columns here based on the original model
            _id_parameter_type: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            parameter_type_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            parameter_belongs_to: {
                type: Sequelize.ENUM("soap", "background"),
                allowNull: false,
            },
            category: {
                type: Sequelize.ENUM("AHF", "APNP", "APP", "AGO", "SOAP"),
                allowNull: false,
            },
            _id_doctor: {
                type: Sequelize.UUID,
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

        // Create 'backgrounds' table with the same structure
        await queryInterface.createTable("backgrounds", {
            // Define the columns here based on the original model
            _id_background: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            _id_consult: {
                type: Sequelize.UUID,
                allowNull: false,
            },
            _id_parameter: {
                type: Sequelize.UUID,
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
};
