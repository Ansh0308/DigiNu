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
 * Conforms to standard commercial print shop specifications.
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
          top: 24,
          bottom: 24,
          left: 24,
          right: 24,
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
      const markLength = 12;
      doc.save();
      doc.lineWidth(0.5);
      doc.strokeColor("#999999");

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
      doc.save();
      doc.lineWidth(1);
      doc.strokeColor("#E6E4DF");
      doc.rect(
        cardMargin,
        cardMargin,
        pageWidth - cardMargin * 2,
        pageHeight - cardMargin * 2
      ).stroke();
      doc.restore();

      // --- Header: Restaurant Branding ---
      let currentY = 40;

      // Restaurant Title
      doc.font("Times-Bold")
        .fontSize(20)
        .fillColor(primaryColor)
        .text(restaurantName.toUpperCase(), cardMargin, currentY, {
          width: pageWidth - cardMargin * 2,
          align: "center",
          characterSpacing: 1.5,
        });

      currentY += 28;

      // Tagline
      if (tagline) {
        doc.font("Helvetica-Oblique")
          .fontSize(9)
          .fillColor("#666666")
          .text(tagline, cardMargin, currentY, {
            width: pageWidth - cardMargin * 2,
            align: "center",
          });
        currentY += 16;
      }

      // Elegant divider hairline
      doc.save();
      doc.lineWidth(0.75);
      doc.strokeColor("#D5D1C8");
      const dividerWidth = 60;
      doc.moveTo((pageWidth - dividerWidth) / 2, currentY)
        .lineTo((pageWidth + dividerWidth) / 2, currentY)
        .stroke();
      doc.restore();

      currentY += 18;

      // --- Centered QR Code ---
      const qrDisplaySize = 160;
      const qrX = (pageWidth - qrDisplaySize) / 2;
      const qrY = currentY;

      doc.image(qrPngBuffer, qrX, qrY, {
        width: qrDisplaySize,
        height: qrDisplaySize,
      });

      currentY += qrDisplaySize + 18;

      // --- Callout Section ---
      doc.font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#1A1A1A")
        .text(calloutText, cardMargin, currentY, {
          width: pageWidth - cardMargin * 2,
          align: "center",
        });

      currentY += 18;

      doc.font("Helvetica")
        .fontSize(8.5)
        .fillColor("#777777")
        .text("Point your smartphone camera at the QR code\nto explore our live digital menu & daily specials.", cardMargin, currentY, {
          width: pageWidth - cardMargin * 2,
          align: "center",
          lineGap: 2,
        });

      // --- Footer ---
      const footerY = pageHeight - 34;
      doc.font("Helvetica")
        .fontSize(7)
        .fillColor("#AAAAAA")
        .text("POWERED BY DIGINU — NO APP DOWNLOAD REQUIRED", cardMargin, footerY, {
          width: pageWidth - cardMargin * 2,
          align: "center",
          characterSpacing: 0.8,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

