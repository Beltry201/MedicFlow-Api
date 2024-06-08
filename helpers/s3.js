import { S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";
import dotenv from "dotenv";
dotenv.config();

export const bucketName = process.env.BUCKET_NAME;
export const bucketRegion = process.env.BUCKET_REGION || "us-east-1";
const profileName = process.env.AWS_PROFILE || "default";

export const s3 = new S3Client({
    credentials: fromIni({ profile: profileName }),
    region: bucketRegion,
});
