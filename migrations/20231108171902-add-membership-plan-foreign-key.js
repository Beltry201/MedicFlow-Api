// Example migration file name: 20231108120000-add-membership-plan-foreign-key.js

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn(
            "payment_records",
            "_id_membership_plan",
            {
                type: Sequelize.UUID,
                references: {
                    model: "membership_plans",
                    key: "_id_membership_plan",
                },
                allowNull: true, // Adjust as needed
                onUpdate: "CASCADE",
                onDelete: "SET NULL", // Adjust as needed
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn(
            "payment_records",
            "_id_membership_plan"
        );
    },
};
