import { S3 } from "aws-sdk";
import { IStorageProvider } from "./IStorageProvider";

export class S3Provider implements IStorageProvider {
  private s3 = new S3({ region: process.env.AWS_S3_REGION! });

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const sanitizedKey = key.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedKey}`;

    try {
      const result = await this.s3.upload({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
      }).promise();

      // Clear the buffer
      file.buffer = Buffer.alloc(0);
      return result.Location; // URL de S3
    } catch (error) {
      // If there's an error, try to clean up from S3
      try {
        await this.s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: filename,
        }).promise();
      } catch (cleanupError) {
        console.error('Error cleaning up file from S3:', cleanupError);
      }
      throw error;
    }
  }
}