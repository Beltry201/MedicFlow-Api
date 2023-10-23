module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("users", "_id_diploma_organization", {
            type: Sequelize.STRING(255),
            allowNull: false,
            defaultValue: "NEEDS UPDATE", // Set a placeholder value
        });

        await queryInterface.addColumn("users", "_id_profesional_id", {
            type: Sequelize.STRING(255),
            allowNull: false,
            defaultValue: "NEEDS UPDATE", // Set a placeholder value
        });

        await queryInterface.addColumn("users", "_office_address", {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: "NEEDS UPDATE", // Set a placeholder value
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove the added columns in the reverse order
        await queryInterface.removeColumn("users", "_office_address");
        await queryInterface.removeColumn("users", "_id_profesional_id");
        await queryInterface.removeColumn("users", "_id_diploma_organization");
    },
};
