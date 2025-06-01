import { LocalStorageProvider } from './LocalStorage.provider';
import { S3Provider } from './S3.provider';

export interface IStorageProvider {
    uploadFile(file: Express.Multer.File, key: string): Promise<string>;
}

export const storage = process.env.NODE_ENV === 'development'
? new LocalStorageProvider()
: new S3Provider();