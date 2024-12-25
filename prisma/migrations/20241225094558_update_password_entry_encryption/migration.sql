/*
  Warnings:

  - You are about to drop the column `authTag` on the `PasswordEntry` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `PasswordEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PasswordEntry" DROP COLUMN "authTag",
DROP COLUMN "iv";
