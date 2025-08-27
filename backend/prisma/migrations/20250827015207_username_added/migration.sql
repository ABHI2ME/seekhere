/*
  Warnings:

  - Added the required column `usenrName` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "usenrName" TEXT NOT NULL;
