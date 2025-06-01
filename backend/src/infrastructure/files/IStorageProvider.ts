import { File } from 'multer';

export interface IStorageProvider {
    uploadFile(file: File, key?: string): Promise<string>;
}