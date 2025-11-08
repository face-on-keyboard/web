/*
  Warnings:

  - The values [WALKING,BIKING,DRIVING,PUBLIC_TRANSIT] on the enum `TravelMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TravelMode_new" AS ENUM ('WALK', 'BIKE', 'SCOOTER', 'CAR');
ALTER TABLE "Segments" ALTER COLUMN "travelMode" TYPE "TravelMode_new" USING ("travelMode"::text::"TravelMode_new");
ALTER TYPE "TravelMode" RENAME TO "TravelMode_old";
ALTER TYPE "TravelMode_new" RENAME TO "TravelMode";
DROP TYPE "public"."TravelMode_old";
COMMIT;
