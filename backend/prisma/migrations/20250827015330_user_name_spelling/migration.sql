/*
  Warnings:

  - You are about to drop the column `usenrName` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `userName` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Comment" DROP COLUMN "usenrName",
ADD COLUMN     "userName" TEXT NOT NULL;
