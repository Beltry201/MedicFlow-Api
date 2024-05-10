// Assuming you have already imported Sequelize and established a connection

const { DataTypes } = require("sequelize");

const Clinic = sequelize.define(
    "Clinic",
    {
        _id_clinic: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        logo_url: {
            type: DataTypes.STRING,
            allowNull: true, // Assuming logo URL is optional
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        tableName: "clinics", // Assuming your table is named 'clinics'
        timestamps: true, // Sequelize will automatically manage timestamps
    }
);

module.exports = Clinic;
