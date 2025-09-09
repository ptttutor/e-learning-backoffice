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
            email: true,
            image: true,
            lineId: true,
            role: true,
            createdAt: true
          }
        },
        ebook: {
          select: {
            id: true,
            title: true,
            description: true,
            author: true,
            isbn: true,
            price: true,
            discountPrice: true,
            coverImageUrl: true,
            previewUrl: true,
            fileSize: true,
            pageCount: true,
            language: true,
            format: true,
            isPhysical: true,
            weight: true,
            dimensions: true,
            downloadLimit: true,
            accessDuration: true,
            isActive: true,
            isFeatured: true,
            publishedAt: true,
            categoryId: true,
            createdAt: true,
            updatedAt: true,
            category: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            duration: true,
            isFree: true,
            status: true,
            instructorId: true,
            categoryId: true,
            coverImageUrl: true,
            coverPublicId: true,
            createdAt: true,
            updatedAt: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            },
            category: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            chapters: {
              select: {
                id: true,
                title: true,
                order: true,
                createdAt: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        payment: true, // Get all payment fields including slip analysis data
        shipping: true, // Get all shipping fields
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            type: true,
            value: true,
            minOrderAmount: true,
            maxDiscount: true,
            validFrom: true,
            validUntil: true,
            applicableType: true
          }
        },
        items: {
          select: {
            id: true,
            itemType: true,
            itemId: true,
            title: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            createdAt: true
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