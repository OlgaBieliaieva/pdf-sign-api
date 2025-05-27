import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const signPdfWithImage = async ({
  pdfPath,
  imageBase64,
  page,
  x,
  y,
  label,
  labelX,
  labelY,
  outputPath,
}) => {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const pngImage = await pdfDoc.embedPng(imageBase64);
  const pages = pdfDoc.getPages();
  const targetPage = pages[page];

  targetPage.drawImage(pngImage, {
    x,
    y,
    width: 150,
    height: 50,
  });

  if (label) {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    targetPage.drawText(label, {
      x: labelX,
      y: labelY,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  }

  const signedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, signedPdfBytes);

  // Optional: remove uploaded original
  fs.unlinkSync(pdfPath);
};
