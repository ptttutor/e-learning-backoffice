import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // ดึงข้อมูลรายได้แต่ละเดือน
    const revenueData = await prisma.payment.groupBy({
      by: ['paidAt'],
      where: {
        status: 'COMPLETED',
        paidAt: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // สร้างข้อมูลรายเดือน
    const monthlyRevenue = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthData = revenueData.filter(item => {
        const paidMonth = new Date(item.paidAt).getMonth() + 1;
        return paidMonth === month;
      });

      const totalRevenue = monthData.reduce((sum, item) => {
        return sum + (item._sum.amount || 0);
      }, 0);

      return {
        month: month,
        monthName: new Date(2023, index, 1).toLocaleDateString('th-TH', { month: 'long' }),
        revenue: totalRevenue,
        orderCount: monthData.length,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        year: parseInt(year),
        monthlyRevenue,
        totalYearRevenue: monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0),
      },
    });
  } catch (error) {
    console.error('Revenue by month API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
