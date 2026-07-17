-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_latitude" DECIMAL(10,7),
ADD COLUMN     "delivery_longitude" DECIMAL(10,7),
ALTER COLUMN "pickup_time" SET DEFAULT '12:00:00'::time;
