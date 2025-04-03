/*
  Warnings:

  - You are about to drop the column `reportedById` on the `SpamReport` table. All the data in the column will be lost.
  - Added the required column `reporterId` to the `SpamReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SpamReport" DROP CONSTRAINT "SpamReport_reportedById_fkey";

-- AlterTable
ALTER TABLE "SpamReport" DROP COLUMN "reportedById",
ADD COLUMN     "reporterId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SpamReport" ADD CONSTRAINT "SpamReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
