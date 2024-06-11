import { s3, bucketName, bucketRegion } from "../../helpers/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export class MediaService {
    async uploadAudioFile(req, res, _id_doctor, fileName) {
        return new Promise((resolve, reject) => {
            upload.single("file")(req, res, async (err) => {
                if (err) {
                    console.error(err);
                    return reject({ message: "Internal Error" });
                } else {
                    try {
                        // Get file and check its type.
                        const fileType = req.file.mimetype;
                        console.info("\n--FILE TYPE: ", fileType);

                        // Define a mapping of MIME types to file extensions
                        const mimeToExt = {
                            "audio/wav": "wav",
                            "audio/mpeg": "mp3",
                            "audio/mp4": "m4a",
                            "audio/x-wav": "wav",
                            "audio/x-mpeg": "mp3",
                        };

                        // Get the file extension from MIME type
                        const fileExtension = mimeToExt[fileType];

                        if (!fileExtension) {
                            return reject({
                                message: "Invalid file extension",
                            });
                        }

                        // Generate a unique file name
                        const fullFileName = `${_id_doctor}/${fileName}.${fileExtension}`;
                        console.log("\n-- FULL NAME: ", fullFileName);

                        // Prepare file for bucket and send file.
                        const fileData = req.file.buffer;
                        const params = {
                            Bucket: bucketName,
                            Key: fullFileName,
                            Body: fileData,
                            ContentType: fileType,
                        };
                        const command = new PutObjectCommand(params);

                        await s3.send(command);

                        console.log(
                            `File uploaded for ${_id_doctor}: ${fullFileName}`
                        );

                        const fileUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${fullFileName}`;
                        resolve({ fileUrl, key: fullFileName });
                    } catch (error) {
                        console.error(error);
                        reject({ message: error.message });
                    }
                }
            });
        });
    }
}

export const mediaService = new MediaService();
