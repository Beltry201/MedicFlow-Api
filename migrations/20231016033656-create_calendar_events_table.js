"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("calendar_events", {
            _id_calendar_event: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                defaultValue: null,
            },
            _id_doctor: {
                type: Sequelize.UUID,
                references: {
                    model: "users", // Assuming your doctors are stored in a table named 'users'
                    key: "_id_user", // Assuming the ID field in the 'users' table is '_id_user'
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            _id_patient: {
                type: Sequelize.UUID,
                references: {
                    model: "patients", // Replace 'patients' with the actual table name for patients
                    key: "_id_patient", // Assuming the ID field in the 'patients' table is '_id_patient'
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("calendar_events");
    },
};
