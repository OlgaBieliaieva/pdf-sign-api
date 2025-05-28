import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import * as fontkit from "fontkit";

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
  pdfDoc.registerFontkit(fontkit); // 👈 обов’язково для кастомного шрифту

  const pngImage = await pdfDoc.embedPng(imageBase64);
  const pages = pdfDoc.getPages();
  const targetPage = pages[page];

  const originalWidth = pngImage.width;
  const originalHeight = pngImage.height;

  const maxWidth = 120;
  const scale = maxWidth / originalWidth;
  const scaledHeight = originalHeight * scale;

  const pageHeight = targetPage.getHeight();
  const adjustedY = pageHeight - y - scaledHeight;

  targetPage.drawImage(pngImage, {
    x,
    y: adjustedY,
    width: maxWidth,
    height: scaledHeight,
  });

  if (label && labelX !== undefined && labelY !== undefined) {
    const fontPath = path.resolve(
      "assets/fonts/Open_Sans/OpenSans-SemiBold.ttf"
    );
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const fontSize = 12;
    const adjustedLabelY = pageHeight - labelY - fontSize;

    targetPage.drawText(label, {
      x: labelX,
      y: adjustedLabelY,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    });
  }

  const signedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, signedPdfBytes);
  fs.unlinkSync(pdfPath);
};
