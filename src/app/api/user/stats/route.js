import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุอีเมล' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบผู้ใช้งาน' },
        { status: 404 }
      );
    }

    // Get order statistics
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        ebook: true,
        course: true
      }
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'COMPLETED').length;
    const totalSpent = orders
      .filter(order => order.status === 'COMPLETED')
      .reduce((sum, order) => sum + order.total, 0);

    const totalCourses = orders.filter(order => 
      order.orderType === 'COURSE' && order.status === 'COMPLETED'
    ).length;

    const totalEbooks = orders.filter(order => 
      order.orderType === 'EBOOK' && order.status === 'COMPLETED'
    ).length;

    const stats = {
      totalOrders,
      completedOrders,
      totalSpent,
      totalCourses,
      totalEbooks
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' },
      { status: 500 }
    );
  }
}