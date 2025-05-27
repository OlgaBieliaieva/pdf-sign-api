import express from "express";
import multer from "multer";
import { signPdf, deleteFile } from "../controllers/signController.js";

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"), false);
    }
    cb(null, true);
  },
});

router.post("/", upload.single("pdf"), signPdf);
router.delete("/:filename", deleteFile);

export default router;
