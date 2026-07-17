-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_address" TEXT,
ADD COLUMN     "delivery_fee" DECIMAL(8,2) NOT NULL DEFAULT 0,
ADD COLUMN     "delivery_method" TEXT NOT NULL DEFAULT 'pickup',
ADD COLUMN     "delivery_status" TEXT,
ADD COLUMN     "uber_delivery_id" TEXT,
ADD COLUMN     "uber_tracking_url" TEXT,
ALTER COLUMN "pickup_time" SET DEFAULT '12:00:00'::time;
