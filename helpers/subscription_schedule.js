import cron from "node-cron";
import { SubscriptionService } from "../services/users/subscriptions.js";

// Schedule a task to run daily at 06:00 UTC
cron.schedule("0 6 * * *", async () => {
    try {
        await SubscriptionService.handleExpiredSubscriptions();
    } catch (error) {
        console.error("Error handling expired subscriptions:", error);
    }
});
