-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "isPhysical" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weight" DOUBLE PRECISION;
