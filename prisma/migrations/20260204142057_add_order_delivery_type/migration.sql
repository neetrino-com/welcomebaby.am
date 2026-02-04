-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deliveryTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_deliveryTypeId_fkey" FOREIGN KEY ("deliveryTypeId") REFERENCES "delivery_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
