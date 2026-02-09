-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentData" JSONB,
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "paymentStatus" TEXT;
