import { File } from "multer";
import { S3 } from "aws-sdk";
import fs from "fs";
import { IStorageProvider } from "./IStorageProvider";

export class S3Provider implements IStorageProvider {
  private s3 = new S3({ region: process.env.AWS_S3_REGION! });

  async uploadFile(file: File, key: string = file.originalname): Promise<string> {
    const fileContent = fs.readFileSync(file.path);

    const result = await this.s3.upload({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: fileContent,
      ContentType: file.mimetype,
    }).promise();

    return result.Location; // URL de S3
  }
}