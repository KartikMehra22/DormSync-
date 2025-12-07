/*
  Warnings:

  - The values [PENDING] on the enum `AllocationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [UNDER_MAINTENANCE] on the enum `RoomStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `attachments` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `postedBy` on the `Announcement` table. All the data in the column will be lost.
  - The `category` column on the `Announcement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `authorId` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AllocationStatus_new" AS ENUM ('ACTIVE', 'VACATED', 'TRANSFERRED');
ALTER TABLE "public"."RoomAllocation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "RoomAllocation" ALTER COLUMN "status" TYPE "AllocationStatus_new" USING ("status"::text::"AllocationStatus_new");
ALTER TYPE "AllocationStatus" RENAME TO "AllocationStatus_old";
ALTER TYPE "AllocationStatus_new" RENAME TO "AllocationStatus";
DROP TYPE "public"."AllocationStatus_old";
ALTER TABLE "RoomAllocation" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RoomStatus_new" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED');
ALTER TABLE "public"."Room" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Room" ALTER COLUMN "status" TYPE "RoomStatus_new" USING ("status"::text::"RoomStatus_new");
ALTER TYPE "RoomStatus" RENAME TO "RoomStatus_old";
ALTER TYPE "RoomStatus_new" RENAME TO "RoomStatus";
DROP TYPE "public"."RoomStatus_old";
ALTER TABLE "Room" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Announcement" DROP CONSTRAINT "Announcement_postedBy_fkey";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "attachments",
DROP COLUMN "postedBy",
ADD COLUMN     "attachment" TEXT,
ADD COLUMN     "authorId" INTEGER NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT;

-- CreateTable
CREATE TABLE "MessSuggestion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "foodItem" TEXT NOT NULL,
    "mealType" "MealShift" NOT NULL,
    "description" TEXT,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessSuggestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MessSuggestion" ADD CONSTRAINT "MessSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
