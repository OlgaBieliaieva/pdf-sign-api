import fs from "fs";
import path from "path";
import { PDFDocument, rgb, degrees } from "pdf-lib";
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
  canvasWidth,
  canvasHeight,
}) => {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const pngImage = await pdfDoc.embedPng(imageBase64);
  const pages = pdfDoc.getPages();
  const targetPage = pages[page];

  const originalWidth = pngImage.width;
  const originalHeight = pngImage.height;

  const maxWidth = 120;
  const scale = maxWidth / originalWidth;
  const scaledWidth = maxWidth;
  const scaledHeight = originalHeight * scale;

  const rotationAngle = targetPage.getRotation().angle;
  const pageWidth = targetPage.getWidth();
  const pageHeight = targetPage.getHeight();

  const scaledX = x;
  const scaledY = y;
  const scaledLabelX = labelX;
  const scaledLabelY = labelY;

  const fontPath = path.resolve("assets/fonts/Open_Sans/OpenSans-SemiBold.ttf");
  const fontBytes = fs.readFileSync(fontPath);
  const customFont = await pdfDoc.embedFont(fontBytes);
  const fontSize = 12;

  if (rotationAngle === 90) {
    // Підпис (зображення)
    const drawX = scaledY * (pageWidth / canvasHeight) + scaledHeight;
    const drawY = scaledX * (pageHeight / canvasWidth);

    targetPage.drawImage(pngImage, {
      x: drawX,
      y: drawY,
      width: scaledWidth,
      height: scaledHeight,
      rotate: degrees(90),
    });

    // Текст
    if (label && scaledLabelX !== undefined && scaledLabelY !== undefined) {
      const textWidth = customFont.widthOfTextAtSize(label, fontSize);
      const textHeight = fontSize;

      const drawLabelX = scaledLabelY * (pageWidth / canvasHeight) + textHeight;
      const drawLabelY = scaledLabelX * (pageHeight / canvasWidth);

      targetPage.drawText(label, {
        x: drawLabelX,
        y: drawLabelY,
        size: fontSize,
        font: customFont,
        color: rgb(0, 0, 0),
        rotate: degrees(90),
      });
    }
  } else {
    // Книжкова орієнтація

    // Підпис
    const adjustedY = pageHeight - scaledY - scaledHeight;
    targetPage.drawImage(pngImage, {
      x: scaledX,
      y: adjustedY,
      width: scaledWidth,
      height: scaledHeight,
    });

    // Текст
    if (label && scaledLabelX !== undefined && scaledLabelY !== undefined) {
      const adjustedLabelY = pageHeight - scaledLabelY - fontSize;
      targetPage.drawText(label, {
        x: scaledLabelX,
        y: adjustedLabelY,
        size: fontSize,
        font: customFont,
        color: rgb(0, 0, 0),
      });
    }
  }

  // console.log({
  //   originalWidth,
  //   originalHeight,
  //   scale,
  //   scaledWidth,
  //   scaledHeight,
  //   rotationAngle,
  //   pageWidth,
  //   pageHeight,
  //   scaledX,
  //   scaledY,
  //   scaledLabelX,
  //   scaledLabelY,
  //   canvasWidth,
  //   canvasHeight,
  // });

  const signedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, signedPdfBytes);
  fs.unlinkSync(pdfPath);
};
