import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/enrollments?userId=...&courseId=...
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    
    if (!userId || !courseId) {
      return NextResponse.json({ error: 'ต้องระบุ userId และ courseId' }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { 
        userId: userId, 
        courseId: courseId 
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// PATCH: /api/enrollments (update progress/status)
export async function PATCH(req) {
  try {
    const { userId, courseId, progress, status, viewedContentIds } = await req.json();
    
    if (!userId || !courseId) {
      return NextResponse.json({ error: 'ต้องระบุ userId และ courseId' }, { status: 400 });
    }

    // หาจำนวน content ทั้งหมดในคอร์ส
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            contents: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'ไม่พบคอร์ส' }, { status: 404 });
    }

    // คำนวณจำนวน content ทั้งหมด
    const totalContents = course.chapters.reduce((total, chapter) => {
      return total + chapter.contents.length;
    }, 0);

    // หา enrollment ที่มีอยู่
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { 
        userId: userId, 
        courseId: courseId 
      }
    });

    let enrollment;

    if (existingEnrollment) {
      // คำนวณ progress จาก viewedContentIds
      const currentViewedIds = existingEnrollment.viewedContentIds || [];
      const newViewedIds = viewedContentIds || currentViewedIds;
      const actualProgress = totalContents > 0 ? Math.round((newViewedIds.length / totalContents) * 100) : 0;

      const updateData = {
        progress: actualProgress, // ใช้ค่าที่คำนวณได้
        viewedContentIds: newViewedIds
      };
      
      if (status !== undefined) updateData.status = status;
      
      // ถ้า progress = 100 ให้ set status เป็น COMPLETED
      if (actualProgress === 100) {
        updateData.status = 'COMPLETED';
      }

      enrollment = await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } }
        }
      });
    } else {
      // สร้าง enrollment ใหม่
      const initialProgress = viewedContentIds && totalContents > 0 ? 
        Math.round((viewedContentIds.length / totalContents) * 100) : 0;

      enrollment = await prisma.enrollment.create({
        data: { 
          userId: userId, 
          courseId: courseId, 
          progress: initialProgress,
          status: status || 'ACTIVE',
          viewedContentIds: viewedContentIds || []
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } }
        }
      });
    }

    return NextResponse.json({ 
      enrollment,
      debug: {
        totalContents,
        viewedCount: enrollment.viewedContentIds?.length || 0,
        calculatedProgress: enrollment.progress
      }
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
  }
}

// POST: /api/enrollments (create new enrollment) 
export async function POST(req) {
  try {
    const { userId, courseId } = await req.json();
    
    if (!userId || !courseId) {
      return NextResponse.json({ error: 'ต้องระบุ userId และ courseId' }, { status: 400 });
    }

    // ตรวจสอบว่าเคยลงทะเบียนแล้วหรือยัง โดยใช้ unique constraint
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ 
        enrollment: existingEnrollment,
        message: 'คุณได้ลงทะเบียนคอร์สนี้แล้ว'
      });
    }

    // สร้าง enrollment ใหม่
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId, progress: 0, status: 'ACTIVE' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    
    // จัดการ unique constraint error
    if (error.code === 'P2002') {
      // ถ้าเกิด unique constraint error ให้ดึงข้อมูล enrollment ที่มีอยู่แล้ว
      try {
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: userId,
              courseId: courseId
            }
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            course: { select: { id: true, title: true } }
          }
        });
        
        if (existingEnrollment) {
          return NextResponse.json({ 
            enrollment: existingEnrollment,
            message: 'คุณได้ลงทะเบียนคอร์สนี้แล้ว'
          });
        }
      } catch (fetchError) {
        console.error('Error fetching existing enrollment:', fetchError);
      }
    }
    
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
  }
}