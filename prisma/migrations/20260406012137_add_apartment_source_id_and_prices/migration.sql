-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN "sourceId" INTEGER;
ALTER TABLE "Apartment" ADD COLUMN "minPrice" INTEGER;
ALTER TABLE "Apartment" ADD COLUMN "maxPrice" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Apartment_sourceId_key" ON "Apartment"("sourceId");
