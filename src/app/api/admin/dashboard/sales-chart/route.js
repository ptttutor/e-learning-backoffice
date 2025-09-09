import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily, monthly, yearly
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let start, end;
    
    // ถ้าไม่ได้ระบุวันที่ ใช้ค่าเริ่มต้น
    if (!startDate || !endDate) {
      const now = new Date();
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      
      switch (period) {
        case 'daily':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
          break;
        case 'monthly':
          start = new Date(now.getFullYear(), now.getMonth() - 12, 1);
          break;
        case 'yearly':
          start = new Date(now.getFullYear() - 5, 0, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      }
    } else {
      start = new Date(startDate);
      end = new Date(endDate);
    }

    // ดึงข้อมูล payments สำหรับ course
    const coursePayments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        paidAt: {
          gte: start,
          lte: end,
        },
        order: {
          orderType: 'COURSE',
        },
      },
      include: {
        order: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidAt: 'asc',
      },
    });

    // ดึงข้อมูล payments สำหรับ ebook
    const ebookPayments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        paidAt: {
          gte: start,
          lte: end,
        },
        order: {
          orderType: 'EBOOK',
        },
      },
      include: {
        order: {
          include: {
            ebook: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidAt: 'asc',
      },
    });

    // รวม payments ทั้งหมด
    const payments = [...coursePayments, ...ebookPayments];

    // จัดกลุ่มข้อมูลตามประเภทช่วงเวลา
    let groupedData = [];

    if (period === 'daily') {
      // รายวัน
      const dailyData = new Map();
      
      // สร้าง array ของวันทั้งหมดในช่วงที่เลือก
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dailyData.set(dateKey, {
          date: dateKey,
          displayDate: currentDate.toLocaleDateString('th-TH'),
          revenue: 0,
          orders: 0,
          courses: new Set(),
          ebooks: new Set(),
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // เพิ่มข้อมูลจริง
      payments.forEach(payment => {
        const dateKey = payment.paidAt.toISOString().split('T')[0];
        if (dailyData.has(dateKey)) {
          const dayData = dailyData.get(dateKey);
          dayData.revenue += payment.amount;
          dayData.orders += 1;
          if (payment.order?.course) {
            dayData.courses.add(payment.order.course.id);
          }
          if (payment.order?.ebook) {
            dayData.ebooks.add(payment.order.ebook.id);
          }
        }
      });

      groupedData = Array.from(dailyData.values()).map(item => ({
        ...item,
        courseCount: item.courses.size,
        ebookCount: item.ebooks.size,
        totalItems: item.courses.size + item.ebooks.size,
        courses: undefined,
        ebooks: undefined,
      }));

    } else if (period === 'monthly') {
      // รายเดือน
      const monthlyData = new Map();
      
      // สร้าง array ของเดือนทั้งหมด
      const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
      
      while (currentDate <= endMonth) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(monthKey, {
          month: monthKey,
          displayMonth: currentDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' }),
          revenue: 0,
          orders: 0,
          courses: new Set(),
          ebooks: new Set(),
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // เพิ่มข้อมูลจริง
      payments.forEach(payment => {
        const date = new Date(payment.paidAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData.has(monthKey)) {
          const monthData = monthlyData.get(monthKey);
          monthData.revenue += payment.amount;
          monthData.orders += 1;
          if (payment.order?.course) {
            monthData.courses.add(payment.order.course.id);
          }
          if (payment.order?.ebook) {
            monthData.ebooks.add(payment.order.ebook.id);
          }
        }
      });

      groupedData = Array.from(monthlyData.values()).map(item => ({
        ...item,
        courseCount: item.courses.size,
        ebookCount: item.ebooks.size,
        totalItems: item.courses.size + item.ebooks.size,
        courses: undefined,
        ebooks: undefined,
      }));

    } else if (period === 'yearly') {
      // รายปี
      const yearlyData = new Map();
      
      // สร้าง array ของปีทั้งหมด
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();
      
      for (let year = startYear; year <= endYear; year++) {
        yearlyData.set(year.toString(), {
          year: year,
          displayYear: `ปี ${year}`,
          revenue: 0,
          orders: 0,
          courses: new Set(),
          ebooks: new Set(),
        });
      }

      // เพิ่มข้อมูลจริง
      payments.forEach(payment => {
        const year = new Date(payment.paidAt).getFullYear().toString();
        if (yearlyData.has(year)) {
          const yearData = yearlyData.get(year);
          yearData.revenue += payment.amount;
          yearData.orders += 1;
          if (payment.order?.course) {
            yearData.courses.add(payment.order.course.id);
          }
          if (payment.order?.ebook) {
            yearData.ebooks.add(payment.order.ebook.id);
          }
        }
      });

      groupedData = Array.from(yearlyData.values()).map(item => ({
        ...item,
        courseCount: item.courses.size,
        ebookCount: item.ebooks.size,
        totalItems: item.courses.size + item.ebooks.size,
        courses: undefined,
        ebooks: undefined,
      }));
    }

    // สรุปข้อมูลรวม
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOrders = payments.length;
    const uniqueCourses = new Set(payments.map(p => p.order?.course?.id).filter(Boolean));
    const uniqueEbooks = new Set(payments.map(p => p.order?.ebook?.id).filter(Boolean));
    
    // แยกรายได้ course และ ebook
    const courseRevenue = coursePayments.reduce((sum, payment) => sum + payment.amount, 0);
    const ebookRevenue = ebookPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        period,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        summary: {
          totalRevenue,
          totalOrders,
          courseRevenue,
          ebookRevenue,
          courseOrders: coursePayments.length,
          ebookOrders: ebookPayments.length,
          uniqueCourses: uniqueCourses.size,
          uniqueEbooks: uniqueEbooks.size,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        chartData: groupedData,
      },
    });
  } catch (error) {
    console.error('Sales chart API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales chart data' },
      { status: 500 }
    );
  }
}
