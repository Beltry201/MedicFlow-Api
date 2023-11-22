"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("membership_plans", [
            {
                _id_membership_plan: 1,
                plan_name: "Free",
                monthly_price: 0,
                billing_cycle: "monthly",
                consults_limit: 10,
                min_per_consult: 20,
                is_valid: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id_membership_plan: 2,
                plan_name: "Basic",
                monthly_price: 29,
                billing_cycle: "monthly",
                consults_limit: 50,
                min_per_consult: 20,
                is_valid: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id_membership_plan: 3,
                plan_name: "Premium",
                monthly_price: 199,
                billing_cycle: "monthly",
                consults_limit: -1,
                min_per_consult: 20,
                is_valid: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id_membership_plan: 4,
                plan_name: "Pro",
                monthly_price: 99,
                billing_cycle: "monthly",
                consults_limit: -1,
                min_per_consult: 20,
                is_valid: true,
                createdAt: new Date("2023-11-13T13:55:09Z"),
                updatedAt: new Date("2023-11-13T13:55:09Z"),
            },
            {
                _id_membership_plan: 5,
                plan_name: "Growth",
                monthly_price: 79,
                billing_cycle: "monthly",
                consults_limit: 100,
                min_per_consult: 20,
                is_valid: true,
                createdAt: new Date("2023-11-13T13:55:09Z"),
                updatedAt: new Date("2023-11-13T13:55:09Z"),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("membership_plans", null, {});
    },
};
