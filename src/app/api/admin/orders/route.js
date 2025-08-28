import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการ orders ทั้งหมดสำหรับ admin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Build where clause
    const where = {};
    if (status) {
      where.status = status;
    }
    if (paymentStatus) {
      where.payment = {
        status: paymentStatus
      };
    }

    const orders = await prisma.order.findMany({
      where,
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
            price: true,
            discountPrice: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            instructor: {
              select: {
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
            ref: true,
            slipUrl: true,
            uploadedAt: true,
            verifiedAt: true
          }
        },
        shipping: {
          select: {
            id: true,
            recipientName: true,
            recipientPhone: true,
            address: true,
            district: true,
            province: true,
            postalCode: true,
            status: true,
            trackingNumber: true,
            shippedAt: true,
            deliveredAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.order.count({ where });

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ' },
      { status: 500 }
    );
  }
}