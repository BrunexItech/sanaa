-- CreateEnum
CREATE TYPE "OrderChannel" AS ENUM ('ONLINE', 'WALK_IN');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('CATALOG', 'CUSTOM_DESIGN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Artisan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "craft" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "cooperative" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "years" INTEGER NOT NULL,
    "members" INTEGER NOT NULL,
    "photo" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artisan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "compareAtCents" INTEGER,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 10,
    "image" TEXT NOT NULL,
    "gallery" TEXT[],
    "description" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "materials" TEXT[],
    "dimensions" TEXT NOT NULL,
    "madeToOrderDays" INTEGER NOT NULL DEFAULT 7,
    "artisanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDesign" (
    "id" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "colorway" TEXT NOT NULL,
    "patternStyle" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "notes" TEXT,
    "previewSeed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "channel" "OrderChannel" NOT NULL DEFAULT 'ONLINE',
    "source" "OrderSource" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "productId" TEXT,
    "customDesignId" TEXT,
    "artisanId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalCents" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customDesignId_fkey" FOREIGN KEY ("customDesignId") REFERENCES "CustomDesign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
