import { PaymentMethod } from "../../models/subscriptions/payment_methods.js";
import cardValidator from "card-validator";
import { User } from "../../models/users/users.js";
import { Op } from "sequelize";

// Function to retrieve entity based on card number
const getEntityFromCard = (cardNumber) => {
    const cardValidation = cardValidator.number(cardNumber);

    if (cardValidation.card) {
        return cardValidation.card.type;
    }
    return "Unknown";
};

function validateAndConvertDate(userDate) {
    const [month, year] = userDate.split("/");

    // Note: The day is set to 1 by default
    const timestamp = new Date(`20${year}`, month - 1);
    const isoTimestamp = timestamp.toISOString();

    return isoTimestamp;
}

export const createPaymentMethod = async (req, res) => {
    try {
        const {
            card_number,
            card_holder,
            expiration_date,
            cvv,
            name,
            description,
            payment_type,
        } = req.body;
        const _id_doctor = req.user._id_user;

        // Validate required fields
        const requiredFields = [
            "card_number",
            "card_holder",
            "expiration_date",
            "cvv",
        ];
        const missingFields = requiredFields.filter(
            (field) => !req.body[field]
        );

        if (missingFields.length > 0) {
            const errorMessage = `Missing required fields: ${missingFields.join(
                ", "
            )}`;
            return res
                .status(400)
                .json({ success: false, message: errorMessage });
        }

        // Validate card number
        const cardValidation = cardValidator.number(card_number);
        if (!cardValidation.isValid) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid card number" });
        }

        // Validate and convert expiration date
        let expirationDate;
        try {
            expirationDate = validateAndConvertDate(expiration_date);
        } catch (error) {
            return res
                .status(400)
                .json({ success: false, message: error.message });
        }

        // Retrieve entity based on card number
        const entity = getEntityFromCard(card_number);

        // Create a payment method
        const paymentMethod = await PaymentMethod.create({
            card_number,
            card_holder,
            expiration_date: expirationDate,
            cvv,
            _id_doctor,
            entity,
            name,
            description,
            payment_type,
        });

        res.status(201).json({ success: true, paymentMethod });
    } catch (error) {
        console.error("Error in createPaymentMethod:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getPaymentMethods = async (req, res) => {
    try {
        const _id_doctor = req.user._id_user;

        // Retrieve all payment methods for the user
        const paymentMethods = await PaymentMethod.findAll({
            where: { _id_doctor, is_valid: true },
        });

        if (!paymentMethods || paymentMethods.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No payment methods found for the user",
            });
        }

        res.status(200).json({ success: true, paymentMethods });
    } catch (error) {
        console.error("Error in getPaymentMethods:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updatePaymentMethod = async (req, res) => {
    try {
        const { _id_payment_method } = req.query;
        console.log(_id_payment_method);
        const {
            card_number,
            card_holder,
            expiration_date,
            cvv,
            name,
            description,
            payment_type,
        } = req.body;

        // Validate card number if provided
        if (card_number) {
            const cardValidation = cardValidator.number(card_number);
            if (!cardValidation.isValid) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid card number" });
            }
        }

        // Retrieve entity based on card number if provided
        const entity = card_number ? getEntityFromCard(card_number) : undefined;

        // Find the payment method by ID
        const paymentMethod = await PaymentMethod.findByPk(_id_payment_method);

        // Check if the payment method exists
        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found",
            });
        }

        // Update the payment method fields
        await paymentMethod.update({
            card_number,
            card_holder,
            expiration_date,
            cvv,
            entity,
            name,
            description,
            payment_type,
        });

        res.status(200).json({
            success: true,
            message: "Payment method updated successfully",
            paymentMethod,
        });
    } catch (error) {
        console.error("Error in updatePaymentMethod:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const deletePaymentMethod = async (req, res) => {
    try {
        const { _id_payment_method } = req.query;

        // Check if the payment method exists
        const paymentMethod = await PaymentMethod.findByPk(_id_payment_method);
        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found",
            });
        }

        // Perform soft delete by updating is_valid to false
        await PaymentMethod.update(
            { is_valid: false },
            { where: { _id_payment_method } }
        );

        res.status(200).json({
            success: true,
            message: "Payment method deleted successfully",
        });
    } catch (error) {
        console.error("Error in deletePaymentMethod:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
