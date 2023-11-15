import { User } from "../models/users/users.js";

export const isAdmin = async (req, res, next) => {
    const { _id_user } = req.user;

    const user = await User.findByPk(_id_user);
    if (user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Permission denied. Only admins can perform this action.",
        });
    }

    next();
};
