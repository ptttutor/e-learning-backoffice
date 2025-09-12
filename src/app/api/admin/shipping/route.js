import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการ shipping ทั้งหมดสำหรับ admin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 10;
    
    // Filters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const shippingMethod = searchParams.get('shippingMethod') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where = {};
    
    // Status filter
    if (status !== 'ALL') {
      where.status = status;
    }
    
    // Shipping method filter
    if (shippingMethod) {
      where.shippingMethod = shippingMethod;
    }
    
    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    // Search filter
    if (search) {
      where.OR = [
        {
          orderId: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          recipientName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          recipientPhone: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          trackingNumber: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const shipments = await prisma.shipping.findMany({
      where,
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            ebook: {
              select: {
                id: true,
                title: true,
                author: true,
                coverImageUrl: true,
                isPhysical: true,
                weight: true,
                dimensions: true
              }
            },
            course: {
              select: {
                id: true,
                title: true,
                isPhysical: true,
                weight: true,
                dimensions: true,
                instructor: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // Get total count for pagination
    const totalCount = await prisma.shipping.count({ where });

    return NextResponse.json({
      success: true,
      data: shipments,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageSize
    });

  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจัดส่ง' },
      { status: 500 }
    );
  }
}