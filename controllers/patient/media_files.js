import Media from "../models/Media"; // Import the model

export const createMedia = async (req, res) => {
    try {
        const { consult_id, type, url } = req.body;

        // Create a new media in the database
        const newMedia = await Media.create({
            consult_id,
            type,
            url,
        });

        res.status(201).json({
            success: true,
            media: newMedia,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create media",
            error: error.message,
        });
    }
};

export const getMediaDetails = async (req, res) => {
    try {
        const mediaId = req.params.id;
        const media = await Media.findByPk(mediaId);

        if (!media) {
            return res
                .status(404)
                .json({ success: false, message: "Media not found" });
        }

        res.status(200).json({ success: true, media });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve media details",
            error: error.message,
        });
    }
};

export const listMedia = async (req, res) => {
    try {
        const mediaList = await Media.findAll();
        res.status(200).json({
            success: true,
            mediaList,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve media list",
            error: error.message,
        });
    }
};

export const updateMedia = async (req, res) => {
    try {
        const mediaId = req.params.id;
        const media = await Media.findByPk(mediaId);

        if (!media) {
            return res
                .status(404)
                .json({ success: false, message: "Media not found" });
        }

        const { consult_id, type, url } = req.body;

        // Update media attributes
        await media.update({
            consult_id,
            type,
            url,
        });

        res.status(200).json({ success: true, media });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update media",
            error: error.message,
        });
    }
};

export const deleteMedia = async (req, res) => {
    try {
        const mediaId = req.params.id;
        const media = await Media.findByPk(mediaId);

        if (!media) {
            return res
                .status(404)
                .json({ success: false, message: "Media not found" });
        }

        // Delete the media
        await media.destroy();

        res.status(200).json({
            success: true,
            message: "Media deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete media",
            error: error.message,
        });
    }
};
