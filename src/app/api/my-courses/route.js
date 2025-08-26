import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    console.log('Searching for orders for userId:', userId);
    
    // ขั้นตอนที่ 1: หา orders ทั้งหมดของ user นี้
    const allOrders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        payment: true,
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true }
            },
            category: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
    
    console.log('Total orders for user:', allOrders.length);
    
    if (allOrders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        courses: [],
        count: 0,
        message: 'User has no orders yet',
        debug: { totalOrders: 0 }
      });
    }
    
    // ขั้นตอนที่ 2: กรอง orders ที่จ่ายเงินแล้ว
    const paidOrders = allOrders.filter(order => 
      order.status === 'paid' && 
      order.payment && 
      order.payment.status === 'paid' &&
      order.course
    );
    
    console.log('Paid orders:', paidOrders.length);
    
    if (paidOrders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        courses: [],
        count: 0,
        message: 'No paid courses found',
        debug: {
          totalOrders: allOrders.length,
          paidOrders: 0,
          orderStatuses: allOrders.map(o => ({ 
            id: o.id, 
            status: o.status, 
            hasPayment: !!o.payment,
            paymentStatus: o.payment?.status 
          }))
        }
      });
    }
    
    // แปลงเป็น courses
    const courses = paidOrders.map(order => ({
      ...order.course,
      purchaseDate: order.payment.paidAt,
      paymentMethod: order.payment.method,
      orderId: order.id
    }));
    
    // ลบ course ซ้ำ
    const uniqueCourses = courses.filter((course, index, self) =>
      index === self.findIndex(c => c.id === course.id)
    );

    return NextResponse.json({ 
      success: true, 
      courses: uniqueCourses,
      count: uniqueCourses.length 
    });
    
  } catch (error) {
    console.error('Error fetching paid courses:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// หรือถ้าต้องการใช้ route parameter แทน ให้สร้างไฟล์:
// /api/user/[userId]/my-courses/route.js
export async function getUserPaidCourses(req, { params }) {
  try {
    const { userId } = params; // ใช้ route parameter
    
    const paidCourses = await prisma.course.findMany({
      where: {
        orders: {
          some: {
            userId: userId,
            status: 'paid',
            payment: {
              status: 'paid'
            }
          }
        }
      },
      include: {
        instructor: true,
        category: true,
        chapters: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: paidCourses 
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// Alternative: หาเฉพาะข้อมูล Order และ Payment
export async function getPaidOrdersByUser(userId) {
  try {
    const paidOrders = await prisma.order.findMany({
      where: {
        userId: userId,
        status: 'paid',
        payment: {
          status: 'paid'
        }
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true
              }
            },
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            method: true,
            status: true,
            paidAt: true,
            ref: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      data: paidOrders,
      courses: paidOrders.map(order => order.course)
    };
    
  } catch (error) {
    console.error('Error fetching paid orders:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function สำหรับเช็คว่า user จ่ายเงินคอร์สนี้แล้วหรือยัง
export async function hasUserPaidForCourse(userId, courseId) {
  try {
    const paidOrder = await prisma.order.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
        status: 'paid',
        payment: {
          status: 'paid'
        }
      },
      include: {
        payment: true
      }
    });

    return {
      hasPaid: !!paidOrder,
      order: paidOrder,
      paidAt: paidOrder?.payment?.paidAt || null
    };
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      hasPaid: false,
      error: error.message
    };
  }
}

// Usage example ในหน้าอื่น:
/*
// ใน component หรือ API route
const userId = "user-uuid-here";

// วิธีที่ 1: หา courses ที่จ่ายเงินแล้ว
const response = await fetch(`/api/user/${userId}/paid-courses`);
const { data: paidCourses } = await response.json();

// วิธีที่ 2: เช็คคอร์สเฉพาะ
const courseId = "course-uuid-here";
const paymentStatus = await hasUserPaidForCourse(userId, courseId);
console.log('Has paid:', paymentStatus.hasPaid);
*/