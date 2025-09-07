import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: /api/update-progress - อัพเดทความคืบหน้าการเรียน
export async function POST(req) {
  try {
    const { userId, courseId, contentId } = await req.json();
    
    if (!userId || !courseId || !contentId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามี enrollment หรือไม่
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" }, 
        { status: 404 }
      );
    }

    // ดึงข้อมูลคอร์สเพื่อคำนวณ progress
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            contents: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" }, 
        { status: 404 }
      );
    }

    // นับจำนวนเนื้อหาทั้งหมด
    const totalContents = course.chapters.reduce((total, chapter) => 
      total + chapter.contents.length, 0
    );

    if (totalContents === 0) {
      return NextResponse.json(
        { success: false, error: "No contents found in course" }, 
        { status: 400 }
      );
    }

    // หาตำแหน่งของ content ปัจจุบัน
    let currentContentIndex = 0;
    let found = false;
    
    for (const chapter of course.chapters) {
      for (const content of chapter.contents) {
        if (content.id === contentId) {
          found = true;
          break;
        }
        currentContentIndex++;
      }
      if (found) break;
    }

    if (!found) {
      return NextResponse.json(
        { success: false, error: "Content not found" }, 
        { status: 404 }
      );
    }

    // คำนวณ progress (เนื้อหาที่ดูแล้ว / เนื้อหาทั้งหมด * 100)
    const progress = Math.round(((currentContentIndex + 1) / totalContents) * 100);

    // อัพเดท enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      },
      data: {
        progress: progress,
        status: progress >= 100 ? 'COMPLETED' : 'ACTIVE'
      }
    });

    return NextResponse.json({ 
      success: true, 
      progress: updatedEnrollment.progress,
      status: updatedEnrollment.status,
      message: `Progress updated to ${progress}%`
    });
    
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}
