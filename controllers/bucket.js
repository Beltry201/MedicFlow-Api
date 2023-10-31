import {
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { bucketName, bucketRegion, s3 } from "../helpers/s3.js";
import { upload } from "../helpers/multer.js";
import { MediaFile } from "../models/patients/media_files.js";

export const getPatientFiles = async (req, res) => {
    try {
        const { _id_patient } = req.query;
        const mediaFiles = await MediaFile.findAll({
            where: {
                _id_patient,
            },
            attributes: ["_id_media_file", "url", "createdAt", "updatedAt"],
            order: [["createdAt", "DESC"]],
        });

        const validMediaFiles = mediaFiles.filter((file) => file.url);

        if (validMediaFiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No valid media files found for the patient",
            });
        }

        // Get file information for each valid media file
        // const mediaFilesWithInfo = await Promise.all(
        //     validMediaFiles.map(async (file) => {
        //         const fileInfo = await getFileInfo(
        //             file._id_media_file,
        //             "patients"
        //         );
        //         return { ...file, fileInfo };
        //     })
        // );

        res.status(200).json({
            success: true,
            mediaFiles,
            // mediaFiles: mediaFilesWithInfo,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve media files",
            error: error.message,
        });
    }
};

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
                    console.log("\n--FILE TYPE: ", fileType);
                    // Check if the file extension is valid
                    const allowedExtensions = [
                        "png",
                        "jpg",
                        "jpeg",
                        "pdf",
                        "heif",
                        "heic",
                    ];
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

// export const getFileInfo = async (_id_media_file, contentType) => {
//     try {
//         const params = {
//             Bucket: bucketName,
//             Key: `${contentType}/${_id_media_file}`,
//         };
//         const command = new HeadObjectCommand(params);
//         const response = await s3.send(command);

//         const fileInfo = {
//             ContentLength: response.ContentLength,
//             ContentType: response.ContentType,
//             LastModified: response.LastModified,
//             // Add any other metadata you need here
//         };

//         return fileInfo;
//     } catch (error) {
//         console.error(error);
//         throw new Error("Failed to get file information");
//     }
// };

export const getFileInfo = async (_id_media_file, contentType) => {
    try {
        let file = null;

        if (contentType === "patients") {
            file = await MediaFile.findOne({
                where: { _id_media_file },
            });

            if (!file) {
                throw new Error("File not found");
            }
        }

        const getObjectParams = {
            Bucket: bucketName,
            Key: `patients/${_id_media_file}.png`,
        };

        const headObjectCommand = new HeadObjectCommand(getObjectParams);
        console.log("\n-- HEAD OBJECT COMMAND: ", headObjectCommand);
        const headObjectResponse = await s3.send(headObjectCommand);
        console.log("\n-- HEAD OBJECT RESPONSE", headObjectResponse);

        const fileInfo = {
            ETag: headObjectResponse.ETag,
            AWSRegion: bucketRegion,
            LastModified: headObjectResponse.LastModified,
            Size: headObjectResponse.ContentLength,
            Type: headObjectResponse.ContentType,
            S3URI: `s3://${bucketName}/${ContentType}/${_id_media_file}.png`,
            AmazonResourceName: `arn:aws:s3:::${bucketName}/${ContentType}/${_id_media_file}.png`,
            EntityTag: headObjectResponse.ETag,
            ObjectURL: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${ContentType}/${_id_media_file}.png`,
        };

        return fileInfo;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get file information");
    }
};
