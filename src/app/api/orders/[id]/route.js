import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: /api/orders/[id] - get single order
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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
        ebook: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            discountPrice: true,
            author: true,
            isPhysical: true
          }
        },
        payment: true,
        shipping: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ' },
      { status: 500 }
    );
  }
}