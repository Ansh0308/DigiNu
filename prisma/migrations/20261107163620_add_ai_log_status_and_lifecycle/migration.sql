-- AlterTable
ALTER TABLE "ai_generation_logs" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'RESERVED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "idx_ai_logs_status" ON "ai_generation_logs"("status");
