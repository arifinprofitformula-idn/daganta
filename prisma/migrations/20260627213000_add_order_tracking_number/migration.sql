-- Add first-class shipment tracking number storage for customer order tracking.
ALTER TABLE "Order" ADD COLUMN "trackingNumber" TEXT;
