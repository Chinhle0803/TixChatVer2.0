import multer from 'multer'
import { config } from '../config/index.js'

// Configure multer for in-memory storage (we'll upload to S3, not disk)
const storage = multer.memoryStorage()

// File filter for avatars
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'), false)
  }
}

// Configure multer
export const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize, // Max 50MB
  },
  fileFilter: fileFilter,
})
