import { PutObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, s3 } from "../helpers/s3.js";
import { upload } from "../helpers/multer.js";

export const uploadFile = async (req, res, fileName, fileType) => {
    try {
        upload.single("fileN")(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(404).send({ message: "Internal Error" });
            } else {
                //Get file and check its type.
                const contentType = req.file.mimetype;
                console.log("Uploaded file type:", contentType);

                // Prepare file for bucket and send file.
                const file = req.file.buffer;
                const params = {
                    Bucket: bucketName,
                    Key: `${fileType}/${fileName}`,
                    Body: file,
                    ContentType: contentType,
                };
                const command = new PutObjectCommand(params);

                await s3.send(command);

                console.log(`File uploaded for ${fileType}: ${fileName}`);

                return;
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
    }
};
