import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // ดึงข้อมูล ebook orders ที่เสร็จสมบูรณ์
    const ebookOrders = await prisma.order.findMany({
      where: {
        orderType: 'EBOOK',
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        ebook: {
          select: {
            id: true,
            title: true,
            price: true,
            category: {
              select: {
                name: true,
              },
            },
            author: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        payment: {
          select: {
            amount: true,
            paidAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // คำนวณสถิติ ebook
    const totalRevenue = ebookOrders.reduce((sum, order) => {
      return sum + (order.payment?.amount || 0);
    }, 0);

    const totalOrders = ebookOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // นับ ebook แต่ละเล่มที่ขายได้
    const ebookSalesMap = new Map();
    ebookOrders.forEach(order => {
      if (order.ebook) {
        const key = order.ebook.id;
        if (ebookSalesMap.has(key)) {
          const existing = ebookSalesMap.get(key);
          ebookSalesMap.set(key, {
            ...existing,
            totalSales: existing.totalSales + (order.payment?.amount || 0),
            orderCount: existing.orderCount + 1,
          });
        } else {
          ebookSalesMap.set(key, {
            ebookId: order.ebook.id,
            ebookTitle: order.ebook.title,
            author: order.ebook.author,
            category: order.ebook.category?.name || 'ไม่ระบุหมวดหมู่',
            price: order.ebook.price,
            totalSales: order.payment?.amount || 0,
            orderCount: 1,
          });
        }
      }
    });

    // แปลงเป็น array และเรียงตามยอดขาย
    const ebookSales = Array.from(ebookSalesMap.values())
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10); // แสดงแค่ 10 อันดับแรก

    // ดึงข้อมูล downloads
    const downloads = await prisma.ebookDownload.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        ebook: {
          select: {
            title: true,
          },
        },
      },
    });

    const totalDownloads = downloads.length;
    const uniqueDownloaders = new Set(downloads.map(d => d.userId)).size;

    return NextResponse.json({
      success: true,
      data: {
        period: parseInt(period),
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          totalEbooks: ebookSalesMap.size,
          totalDownloads,
          uniqueDownloaders,
        },
        ebookSales,
        recentOrders: ebookOrders.slice(0, 5).map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          ebookTitle: order.ebook?.title || 'ไม่ระบุ',
          author: order.ebook?.author || 'ไม่ระบุ',
          customerName: order.user?.name || order.user?.email || 'ไม่ระบุ',
          amount: order.payment?.amount || 0,
          paidAt: order.payment?.paidAt || order.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Ebook sales API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ebook sales data' },
      { status: 500 }
    );
  }
}
