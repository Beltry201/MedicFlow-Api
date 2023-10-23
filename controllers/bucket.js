import { PutObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, bucketRegion, s3 } from "../helpers/s3.js";
import { upload } from "../helpers/multer.js";

export const uploadFile = async (req, res, fileName, contentType) => {
    return new Promise((resolve, reject) => {
        upload.single("fileN")(req, res, async (err) => {
            if (err) {
                console.error(err);
                return reject({ message: "Internal Error" });
            } else {
                try {
                    // Get file and check its type.
                    const fileType = req.file.mimetype;

                    // Check if the file extension is valid
                    const allowedExtensions = ["png", "jpg", "jpeg", "pdf"];
                    const fileExtension = fileType.split("/")[1].toLowerCase();

                    if (!allowedExtensions.includes(fileExtension)) {
                        return reject({ message: "Invalid file extension" });
                    }

                    console.log("File type: ", fileType);

                    // Concatenate the extension to the fileName
                    const fullFileName = `${contentType}/${fileName}.${fileExtension}`;
                    console.log("\n-- FULL NAME: ", fullFileName);

                    // Prepare file for bucket and send file.
                    const fileData = req.file.buffer;
                    const params = {
                        Bucket: bucketName,
                        Key: fullFileName,
                        Body: fileData,
                        ContentType: contentType,
                    };
                    const command = new PutObjectCommand(params);

                    await s3.send(command);

                    console.log(
                        `File uploaded for ${contentType}: ${fullFileName}`
                    );

                    const fileUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${fullFileName}`;
                    resolve(fileUrl);
                } catch (error) {
                    console.error(error);
                    reject({ message: error.message });
                }
            }
        });
    });
};
