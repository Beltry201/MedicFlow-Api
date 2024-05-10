const { DataTypes } = require("sequelize");

const Doctor = sequelize.define(
    "Doctor",
    {
        _id_doctor: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        professional_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        department: {
            type: DataTypes.ENUM(
                "Cardiology",
                "Dermatology",
                "Orthopedics",
                "Oncology",
                "Other"
            ),
            allowNull: false,
        },
        specialty: {
            type: DataTypes.ENUM(
                "Pediatrics",
                "Neurology",
                "Internal Medicine",
                "Surgery",
                "Other"
            ),
            allowNull: false,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        tableName: "doctors",
        timestamps: true,
        paranoid: true,
    }
);

// Define association with the User model
Doctor.belongsTo(User, {
    foreignKey: "id_user",
    onDelete: "CASCADE",
});

module.exports = Doctor;
