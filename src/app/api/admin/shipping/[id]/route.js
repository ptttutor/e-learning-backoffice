import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูล shipping ตาม ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const shipment = await prisma.shipping.findUnique({
      where: { id },
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
                coverImageUrl: true
              }
            },
            course: {
              select: {
                id: true,
                title: true,
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
                paidAt: true
              }
            }
          }
        }
      }
    });

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบข้อมูลการจัดส่ง' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: shipment
    });

  } catch (error) {
    console.error('Error fetching shipment:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจัดส่ง' },
      { status: 500 }
    );
  }
}

// PATCH - อัพเดทข้อมูล shipping
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, notes, shippingCompany } = body;

    // Prepare update data
    const updateData = {};
    
    if (status) {
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === 'SHIPPED' && trackingNumber) {
        updateData.shippedAt = new Date();
      } else if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
        // Get current shipment to check if shippedAt exists
        const currentShipment = await prisma.shipping.findUnique({
          where: { id },
          select: { shippedAt: true }
        });
        if (!currentShipment?.shippedAt) {
          updateData.shippedAt = new Date();
        }
      }
    }
    
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Use shippingMethod instead of shippingCompany to match schema
    if (shippingCompany !== undefined) {
      updateData.shippingMethod = shippingCompany;
    }

    const updatedShipment = await prisma.shipping.update({
      where: { id },
      data: updateData,
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
                author: true
              }
            },
            course: {
              select: {
                id: true,
                title: true,
                instructor: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'อัพเดทข้อมูลการจัดส่งสำเร็จ',
      data: updatedShipment
    });

  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลการจัดส่ง' },
      { status: 500 }
    );
  }
}