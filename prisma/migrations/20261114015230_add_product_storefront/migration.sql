-- CreateEnum
CREATE TYPE "Storefront" AS ENUM ('USHANGA', 'SANAA');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "storefront" "Storefront" NOT NULL DEFAULT 'USHANGA';
