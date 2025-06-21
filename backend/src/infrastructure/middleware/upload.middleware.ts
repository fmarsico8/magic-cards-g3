import multer from 'multer';

// File filter
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error('Only JPG, JPEG, and PNG file types are allowed!'));
  }
  cb(null, true);
};

// Create multer instance with memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
}); 