import PDFDocument from "pdfkit";
import { generateQRPng, QRGeneratorOptions } from "./qr-generator";

export interface TableTentPdfOptions {
  restaurantName: string;
  tagline?: string | null;
  calloutText?: string;
  qrUrl: string;
  qrOptions?: QRGeneratorOptions;
  primaryColor?: string;
}

/**
 * Generate a print-ready A6 table-tent PDF (105mm × 148mm) with 3mm bleed/trim marks.
 * Uses dynamic text height calculation to prevent any overlapping regardless of text length.
 */
export async function generateTableTentPdf(
  options: TableTentPdfOptions
): Promise<Buffer> {
  const {
    restaurantName,
    tagline = "Digital Dining Experience",
    calloutText = "Scan to View Digital Menu",
    qrUrl,
    qrOptions = {},
    primaryColor = "#1A1A1A",
  } = options;

  // Generate high-resolution 300 DPI PNG buffer for crisp print rendering
  const qrPngBuffer = await generateQRPng(qrUrl, qrOptions);

  return new Promise((resolve, reject) => {
    try {
      // 105mm x 148mm at 72 points/inch (1 inch = 25.4mm)
      // Standard A6: 297.64 x 419.53 points
      const pageWidth = 297.64;
      const pageHeight = 419.53;
      const bleedPt = 8.5; // 3mm bleed

      const doc = new PDFDocument({
        size: [pageWidth, pageHeight],
        margins: {
          top: 18,
          bottom: 18,
          left: 18,
          right: 18,
        },
        info: {
          Title: `${restaurantName} — Digital Menu Table Tent`,
          Author: restaurantName,
          Subject: "Table Tent Digital Menu QR Code",
          Keywords: "restaurant, qr code, menu, table tent, diginu",
          Creator: "DigiNu Platform",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      // --- Draw 3mm Bleed & Trim Crop Marks (Professional Print Shop Marks) ---
      const markLength = 10;
      doc.save();
      doc.lineWidth(0.5);
      doc.strokeColor("#A0A0A0");

      // Top-Left crop marks
      doc.moveTo(bleedPt, 0).lineTo(bleedPt, markLength).stroke();
      doc.moveTo(0, bleedPt).lineTo(markLength, bleedPt).stroke();

      // Top-Right crop marks
      doc.moveTo(pageWidth - bleedPt, 0).lineTo(pageWidth - bleedPt, markLength).stroke();
      doc.moveTo(pageWidth, bleedPt).lineTo(pageWidth - markLength, bleedPt).stroke();

      // Bottom-Left crop marks
      doc.moveTo(bleedPt, pageHeight).lineTo(bleedPt, pageHeight - markLength).stroke();
      doc.moveTo(0, pageHeight - bleedPt).lineTo(markLength, pageHeight - bleedPt).stroke();

      // Bottom-Right crop marks
      doc.moveTo(pageWidth - bleedPt, pageHeight).lineTo(pageWidth - bleedPt, pageHeight - markLength).stroke();
      doc.moveTo(pageWidth, pageHeight - bleedPt).lineTo(pageWidth - markLength, pageHeight - bleedPt).stroke();

      doc.restore();

      // --- Outer Decorative Card Border ---
      const cardMargin = 16;
      const contentWidth = pageWidth - cardMargin * 2;
      const innerPadding = 12;
      const textAreaWidth = contentWidth - innerPadding * 2;
      const textStartX = cardMargin + innerPadding;

      doc.save();
      doc.lineWidth(1);
      doc.strokeColor("#E6E4DF");
      doc.rect(
        cardMargin,
        cardMargin,
        contentWidth,
        pageHeight - cardMargin * 2
      ).stroke();
      doc.restore();

      // --- Header: Restaurant Branding ---
      let currentY = cardMargin + 14;

      // Dynamic Title Font Size based on text length
      const titleText = restaurantName.toUpperCase();
      let titleFontSize = 18;
      if (titleText.length > 28) {
        titleFontSize = 14;
      } else if (titleText.length > 20) {
        titleFontSize = 16;
      }

      doc.font("Times-Bold")
        .fontSize(titleFontSize)
        .fillColor(primaryColor);

      const titleHeight = doc.heightOfString(titleText, {
        width: textAreaWidth,
        align: "center",
        lineGap: 2,
      });

      doc.text(titleText, textStartX, currentY, {
        width: textAreaWidth,
        align: "center",
        lineGap: 2,
      });

      currentY += titleHeight + 4;

      // Tagline with dynamic measurement
      if (tagline && tagline.trim().length > 0) {
        const taglineFontSize = 8;
        doc.font("Helvetica-Oblique")
          .fontSize(taglineFontSize)
          .fillColor("#666666");

        const tagHeight = doc.heightOfString(tagline, {
          width: textAreaWidth,
          align: "center",
          lineGap: 1.5,
        });

        doc.text(tagline, textStartX, currentY, {
          width: textAreaWidth,
          align: "center",
          lineGap: 1.5,
        });

        currentY += tagHeight + 6;
      } else {
        currentY += 4;
      }

      // Elegant divider hairline
      doc.save();
      doc.lineWidth(0.75);
      doc.strokeColor("#D5D1C8");
      const dividerWidth = 50;
      doc.moveTo((pageWidth - dividerWidth) / 2, currentY)
        .lineTo((pageWidth + dividerWidth) / 2, currentY)
        .stroke();
      doc.restore();

      currentY += 8;

      // --- Centered QR Code ---
      // Optimal scan size: 140x140 pt (~50x50 mm)
      const qrDisplaySize = 140;
      const qrX = (pageWidth - qrDisplaySize) / 2;
      const qrY = currentY;

      doc.image(qrPngBuffer, qrX, qrY, {
        width: qrDisplaySize,
        height: qrDisplaySize,
      });

      currentY += qrDisplaySize + 10;

      // --- Callout Section with dynamic height ---
      const calloutFontSize = 11;
      doc.font("Helvetica-Bold")
        .fontSize(calloutFontSize)
        .fillColor("#1A1A1A");

      const calloutHeight = doc.heightOfString(calloutText, {
        width: textAreaWidth,
        align: "center",
        lineGap: 2,
      });

      doc.text(calloutText, textStartX, currentY, {
        width: textAreaWidth,
        align: "center",
        lineGap: 2,
      });

      currentY += calloutHeight + 4;

      // Instruction subtext
      const instructionText =
        "Point your smartphone camera at the QR code\nto explore our live digital menu & daily specials.";
      doc.font("Helvetica")
        .fontSize(7.5)
        .fillColor("#777777");

      const instructionHeight = doc.heightOfString(instructionText, {
        width: textAreaWidth,
        align: "center",
        lineGap: 1.5,
      });

      doc.text(instructionText, textStartX, currentY, {
        width: textAreaWidth,
        align: "center",
        lineGap: 1.5,
      });

      // --- Footer at bottom edge of card ---
      const footerY = pageHeight - cardMargin - 16;
      doc.font("Helvetica")
        .fontSize(6.5)
        .fillColor("#AAAAAA")
        .text("POWERED BY DIGINU — NO APP DOWNLOAD REQUIRED", textStartX, footerY, {
          width: textAreaWidth,
          align: "center",
          characterSpacing: 0.6,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
