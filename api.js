// api.js
import express from "express";
import morgan from "morgan";
import router from "./routes/routes.js";
import { sequelize } from "./config/db.js";
import "./models/associations.js";

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(router);

async function main() {
    // Dynamically set the environment based on NODE_ENV
    const environment = process.env.NODE_ENV || "development";

    // Use different configurations based on the environment
    const dbConfig = {
        development: {
            forceSync: false,
            port: 4001,
        },
        testing: {
            forceSync: true,
            port: 4091,
        },
        production: {
            forceSync: false,
            port: 1523,
        },
    };

    // Use the appropriate configuration based on the environment
    const selectedConfig = dbConfig[environment];

    await sequelize.sync({ force: selectedConfig.forceSync });
    app.listen(selectedConfig.port, () => {
        console.log(
            `Server running in ${environment} mode on port ${selectedConfig.port}`
        );
    });
}

main();

export default app;
