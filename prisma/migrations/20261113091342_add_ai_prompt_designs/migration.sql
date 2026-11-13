/*
  Warnings:

  - Added the required column `priceCents` to the `CustomDesign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DesignSource" AS ENUM ('PRESET', 'AI_PROMPT');

-- AlterTable
ALTER TABLE "CustomDesign" ADD COLUMN     "aiImageUrl" TEXT,
ADD COLUMN     "priceCents" INTEGER NOT NULL,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "source" "DesignSource" NOT NULL DEFAULT 'PRESET',
ALTER COLUMN "colorway" DROP NOT NULL,
ALTER COLUMN "patternStyle" DROP NOT NULL,
ALTER COLUMN "previewSeed" DROP NOT NULL;
