-- AlterTable
ALTER TABLE "qr_code_config" ADD COLUMN     "backgroundColor" VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "calloutText" VARCHAR(100) NOT NULL DEFAULT 'Scan to View Digital Menu',
ADD COLUMN     "errorCorrectionLevel" VARCHAR(1) NOT NULL DEFAULT 'H';
