-- CreateEnum
CREATE TYPE "CidType" AS ENUM ('PASSWORDS', 'NOTES', 'SETTINGS', 'OTHER');

-- CreateEnum
CREATE TYPE "CidStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "avatar" TEXT,
    "nickname" TEXT,
    "preferences" JSONB,
    "verificationString" TEXT NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataCid" (
    "id" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "type" "CidType" NOT NULL,
    "status" "CidStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataCid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "DataCid_userId_idx" ON "DataCid"("userId");

-- CreateIndex
CREATE INDEX "DataCid_cid_idx" ON "DataCid"("cid");

-- AddForeignKey
ALTER TABLE "DataCid" ADD CONSTRAINT "DataCid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
