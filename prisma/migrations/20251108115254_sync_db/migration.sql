-- CreateEnum
CREATE TYPE "TravelMode" AS ENUM ('WALK', 'BIKE', 'SCOOTER', 'CAR');

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "v" TEXT,
    "code" TEXT,
    "msg" TEXT,
    "invNum" TEXT NOT NULL,
    "invDate" TIMESTAMP(3),
    "sellerName" TEXT,
    "amount" DECIMAL(10,2),
    "invStatus" TEXT,
    "invPeriod" TEXT,
    "sellerBan" TEXT,
    "sellerAddress" TEXT,
    "invoiceTime" TEXT,
    "buyerBan" TEXT,
    "currency" TEXT,
    "userEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceDetail" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "rowNum" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarbonLabel" (
    "id" SERIAL NOT NULL,
    "productType" TEXT,
    "productName" TEXT NOT NULL,
    "productModel" TEXT,
    "status" TEXT,
    "companyName" TEXT,
    "uniformNumber" TEXT,
    "carbonFootprintValue" DECIMAL(10,4) NOT NULL,
    "carbonFootprintUnit" TEXT,
    "declarationUnit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarbonLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segments" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "startX" DOUBLE PRECISION NOT NULL,
    "startY" DOUBLE PRECISION NOT NULL,
    "endX" DOUBLE PRECISION NOT NULL,
    "endY" DOUBLE PRECISION NOT NULL,
    "fromTime" TIMESTAMP(3) NOT NULL,
    "toTime" TIMESTAMP(3) NOT NULL,
    "travelMode" "TravelMode" NOT NULL,
    "estimatedCO2" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Segments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");

-- CreateIndex
CREATE INDEX "Invoice_invNum_idx" ON "Invoice"("invNum");

-- CreateIndex
CREATE INDEX "Invoice_invDate_idx" ON "Invoice"("invDate");

-- CreateIndex
CREATE INDEX "Invoice_sellerBan_idx" ON "Invoice"("sellerBan");

-- CreateIndex
CREATE INDEX "Invoice_invPeriod_idx" ON "Invoice"("invPeriod");

-- CreateIndex
CREATE INDEX "Invoice_userEmail_idx" ON "Invoice"("userEmail");

-- CreateIndex
CREATE INDEX "InvoiceDetail_invoiceId_idx" ON "InvoiceDetail"("invoiceId");

-- CreateIndex
CREATE INDEX "CarbonLabel_productName_idx" ON "CarbonLabel"("productName");

-- CreateIndex
CREATE INDEX "CarbonLabel_status_idx" ON "CarbonLabel"("status");

-- AddForeignKey
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
