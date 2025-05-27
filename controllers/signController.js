import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { signPdfWithImage } from "../utils/pdfUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const signPdf = async (req, res) => {
  try {
    const { x, y, page, imageBase64, label, labelX, labelY } = req.body;

    if (!x || !y || !imageBase64 || page === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "PDF file not uploaded" });
    }

    // base64 перевірка
    if (!imageBase64.startsWith("data:image/png;base64,")) {
      return res
        .status(400)
        .json({ error: "Invalid image format (must be PNG base64)" });
    }

    const outputFilename = `signed_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, "..", "signed", outputFilename);

    await signPdfWithImage({
      pdfPath: req.file.path,
      imageBase64,
      page: parseInt(page),
      x: parseFloat(x),
      y: parseFloat(y),
      label: label || "",
      labelX: parseFloat(labelX || x), // fallback to signature coords
      labelY: parseFloat(labelY || y + 60),
      outputPath,
    });

    res.download(outputPath, outputFilename);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Signing failed" });
  }
};

export const deleteFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "..", "signed", filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return res
        .status(404)
        .json({ error: "File not found or already deleted" });
    }
    res.json({ message: "File deleted successfully" });
  });
};
