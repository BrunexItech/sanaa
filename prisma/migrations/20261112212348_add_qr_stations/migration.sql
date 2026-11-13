-- CreateEnum
CREATE TYPE "QrJourney" AS ENUM ('UNDERSTANDING_USHANGA', 'BEAD_TRADITIONS', 'PRODUCTION', 'PRODUCTS', 'VIRTUAL_EXPERIENCE');

-- CreateTable
CREATE TABLE "QrStation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "journey" "QrJourney" NOT NULL,
    "targetUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrStation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QrStation_code_key" ON "QrStation"("code");
