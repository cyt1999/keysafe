/*
  Warnings:

  - Added the required column `iv` to the `PasswordEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PasswordEntry" ADD COLUMN     "iv" TEXT NOT NULL;
