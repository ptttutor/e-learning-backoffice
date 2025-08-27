-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'INSTRUCTOR', 'STUDENT');

-- CreateEnum
CREATE TYPE "public"."CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('VIDEO', 'PDF', 'LINK', 'QUIZ', 'ASSIGNMENT');

-- CreateEnum
CREATE TYPE "public"."EnrollStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "instructorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chapter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "chapterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Drop existing table if needed (ระวัง: จะลบข้อมูลทั้งหมด)
-- DROP TABLE IF EXISTS "public"."Enrollment";

-- Create improved Enrollment table
CREATE TABLE "public"."Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "public"."EnrollStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- เพิ่มฟิลด์ใหม่สำหรับ progress tracking
    "viewedContentIds" TEXT[] DEFAULT '{}',
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Primary key
    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id"),
    
    -- Unique constraint ป้องกันการลงทะเบียนซ้ำ
    CONSTRAINT "Enrollment_userId_courseId_key" UNIQUE ("userId", "courseId"),
    
    -- Foreign key constraints
    CONSTRAINT "Enrollment_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "public"."User"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_courseId_fkey" 
        FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "Enrollment_userId_idx" ON "public"."Enrollment" ("userId");
CREATE INDEX "Enrollment_courseId_idx" ON "public"."Enrollment" ("courseId");
CREATE INDEX "Enrollment_status_idx" ON "public"."Enrollment" ("status");
CREATE INDEX "Enrollment_enrolledAt_idx" ON "public"."Enrollment" ("enrolledAt");

-- Add comments for documentation
COMMENT ON TABLE "public"."Enrollment" IS 'การลงทะเบียนเรียนของผู้ใช้';
COMMENT ON COLUMN "public"."Enrollment"."progress" IS 'ความคืบหน้าการเรียน (0-100)';
COMMENT ON COLUMN "public"."Enrollment"."viewedContentIds" IS 'รายการ content IDs ที่ดูแล้ว';
COMMENT ON COLUMN "public"."Enrollment"."completedAt" IS 'วันที่เรียนจบคอร์ส';
COMMENT ON COLUMN "public"."Enrollment"."lastAccessedAt" IS 'เข้าเรียนครั้งล่าสุดเมื่อไหร่';

-- Create a function to automatically update lastAccessedAt when enrollment is updated
CREATE OR REPLACE FUNCTION update_enrollment_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
    NEW."lastAccessedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update lastAccessedAt
CREATE TRIGGER update_enrollment_last_accessed_trigger
    BEFORE UPDATE ON "public"."Enrollment"
    FOR EACH ROW
    EXECUTE FUNCTION update_enrollment_last_accessed();

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "ref" TEXT,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
CREATE UNIQUE INDEX "Payment_orderId_key" ON "public"."Payment"("orderId");

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Content" ADD CONSTRAINT "Content_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
