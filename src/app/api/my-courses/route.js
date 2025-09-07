import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: /api/my-courses?userId=xxx - หาคอร์สที่จ่ายเงินแล้ว
export async function GET(req) {
  try {
    // ดึง userId จาก query parameter
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" }, 
        { status: 400 }
      );
    }

    console.log('Searching for enrolled courses for userId:', userId);
    
    // หาคอร์สที่ user ลงทะเบียนแล้ว (จากการซื้อคอร์สที่จ่ายเงินแล้ว)
    const enrolledCourses = await prisma.enrollment.findMany({
      where: { 
        userId: userId,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            },
            category: {
              select: { id: true, name: true }
            },
            chapters: {
              include: {
                contents: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });
    
    console.log('Total enrolled courses:', enrolledCourses.length);
    
    if (enrolledCourses.length === 0) {
      return NextResponse.json({ 
        success: true, 
        courses: [],
        count: 0,
        message: 'No enrolled courses found'
      });
    }
    
    // แปลงข้อมูลให้เหมาะสม
    const courses = enrolledCourses.map(enrollment => ({
      ...enrollment.course,
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress,
      enrollmentId: enrollment.id,
      enrollmentStatus: enrollment.status
    }));

    return NextResponse.json({ 
      success: true, 
      courses: courses,
      count: courses.length 
    });
    
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}