import multer from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { slugify } from "../../utils/slugify";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export const createStorage = (folder?: string) => {
  const uploadFolder = folder ? path.join(uploadDir, folder) : uploadDir;

  if (!fs.existsSync(uploadFolder))
    fs.mkdirSync(uploadFolder, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadFolder),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${uuidv4()}-${Date.now()}`;
      const ext = path.extname(file.originalname);
      const slug = slugify(path.basename(file.originalname, ext));
      cb(null, `${slug}-${uniqueSuffix}${ext}`);
    },
  });
};

export const upload = multer({
  storage: createStorage(),
});
