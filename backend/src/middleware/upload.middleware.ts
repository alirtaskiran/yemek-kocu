import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Dosya tipi kontrolü
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Sadece resim dosyalarına izin ver
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'));
  }
};

// Profil fotoğrafı storage konfigürasyonu
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    // Unique filename oluştur: userId_timestamp.extension
    const userId = (req as any).user?.userId || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${userId}_${timestamp}${extension}`);
  }
});

// Tarif fotoğrafı storage konfigürasyonu
const recipeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/recipes/');
  },
  filename: (req, file, cb) => {
    // Unique filename oluştur: recipeId_timestamp.extension
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `recipe_${timestamp}${extension}`);
  }
});

// Profil fotoğrafı upload middleware
export const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('profileImage');

// Tarif fotoğrafı upload middleware (çoklu dosya)
export const uploadRecipeImages = multer({
  storage: recipeStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  }
}).array('recipeImages', 5); // Maximum 5 files

// Tek tarif fotoğrafı upload middleware
export const uploadRecipeImage = multer({
  storage: recipeStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).single('recipeImage'); 