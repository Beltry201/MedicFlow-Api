import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Dynamically set the environment based on NODE_ENV
const environment = process.env.NODE_ENV || "development";

// Use different configurations based on the environment
const dbConfig = {
    development: {
        database: process.env.DB_DEV,
        username: process.env.DB_USER_DEV,
        password: process.env.DB_PASSWORD_DEV,
        host: process.env.DB_HOST_DEV,
        port: process.env.DB_PORT_DEV,
    },
    testing: {
        database: process.env.DB_TEST,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD_TEST,
        host: process.env.DB_HOST_TEST,
        port: process.env.DB_PORT_TEST,
    },
    production: {
        database: process.env.DB_PROD,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD_PROD,
        host: process.env.DB_HOST_PROD,
        port: process.env.DB_PORT_PROD,
    },
};

// Use the appropriate configuration based on the environment
const selectedConfig = dbConfig[environment];

export const sequelize = new Sequelize({
    database: selectedConfig.database,
    username: selectedConfig.username,
    password: selectedConfig.password,
    host: selectedConfig.host,
    port: selectedConfig.port,
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});
