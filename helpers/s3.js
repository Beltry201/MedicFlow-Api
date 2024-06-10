import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

export const bucketName = process.env.BUCKET_NAME;
export const bucketRegion = process.env.BUCKET_REGION || "us-east-1";
const profileName = process.env.AWS_PROFILE || "default";

export const s3 = new S3Client({
    credentials: fromIni({ profile: profileName }),
    region: bucketRegion,
});

export const generatePresignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    try {
        const url = await getSignedUrl(s3, command, { expiresIn: 300 });
        return url;
    } catch (error) {
        console.error("Error generating pre-signed URL", error);
        throw new Error("Failed to generate pre-signed URL");
    }
};
