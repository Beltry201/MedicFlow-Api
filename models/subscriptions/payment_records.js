import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const PaymentRecord = sequelize.define(
    "PaymentRecord",
    {
        _id_payment_record: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        payment_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        payment_amount: {
            type: DataTypes.DECIMAL(10, 2), // Adjust precision and scale as needed
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    {
        tableName: "payment_records",
        timestamps: true,
    }
);

// Define associations
PaymentRecord.belongsTo(User, { foreignKey: "_id_user" });
PaymentRecord.belongsTo(PaymentMethod, { foreignKey: "_id_payment_method" });
PaymentRecord.belongsTo(SubscriptionRecord, {
    foreignKey: "_id_subscription_record",
});
