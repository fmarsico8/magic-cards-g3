import path from "path";
import { IStorageProvider } from "./IStorageProvider";
import fs from "fs";

export class LocalStorageProvider implements IStorageProvider {
    async uploadFile(file: Express.Multer.File, key: string = file.originalname): Promise<string> {
      const destFolder = '/app/uploads';
      if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
  
      // Sanitize filename: remove spaces and special characters
      const sanitizedKey = key.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}-${sanitizedKey}`;
      const destPath = path.join(destFolder, filename);
  
      try {
        // Write the buffer to file
        await fs.promises.writeFile(destPath, file.buffer);
        // Clear the buffer
        file.buffer = Buffer.alloc(0);
        return `http://localhost:3001/uploads/${filename}`;
      } catch (error) {
        // If there's an error, try to clean up
        try {
          await fs.promises.unlink(destPath);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
        throw error;
      }
    }
}