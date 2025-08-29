import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - สร้าง order ใหม่
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, itemType, itemId, couponCode, shippingAddress } = body;

    // Validate required fields
    if (!userId || !itemType || !itemId) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "ไม่พบผู้ใช้งาน" },
        { status: 404 }
      );
    }

    // Get item data
    let item;
    if (itemType === "course") {
      item = await prisma.course.findUnique({
        where: { id: itemId, status: "PUBLISHED" },
      });
    } else if (itemType === "ebook") {
      item = await prisma.ebook.findUnique({
        where: { id: itemId, isActive: true },
      });
    }

    if (!item) {
      return NextResponse.json(
        { success: false, error: "ไม่พบสินค้า" },
        { status: 404 }
      );
    }

    // Check if user already purchased this item
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: userId,
        ...(itemType === "course" ? { courseId: itemId } : { ebookId: itemId }),
        status: "COMPLETED",
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        { success: false, error: "คุณได้ซื้อสินค้านี้แล้ว" },
        { status: 400 }
      );
    }

    // Calculate prices
    let itemPrice = 0;
    if (itemType === "course") {
      itemPrice = item.price || 0;
    } else {
      itemPrice = item.discountPrice || item.price || 0;
    }

    const shippingFee = itemType === "ebook" && item.isPhysical ? 50 : 0;
    let couponDiscount = 0;
    let couponId = null;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode, isActive: true },
        include: {
          usages: {
            where: { userId },
          },
        },
      });

      if (coupon) {
        // Validate coupon
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
            if (
              !coupon.userUsageLimit ||
              coupon.usages.length < coupon.userUsageLimit
            ) {
              if (
                !coupon.minOrderAmount ||
                itemPrice >= coupon.minOrderAmount
              ) {
                // Calculate discount
                if (coupon.type === "PERCENTAGE") {
                  couponDiscount = Math.min(
                    (itemPrice * coupon.value) / 100,
                    coupon.maxDiscount || Infinity
                  );
                } else if (coupon.type === "FIXED_AMOUNT") {
                  couponDiscount = Math.min(coupon.value, itemPrice);
                } else if (coupon.type === "FREE_SHIPPING") {
                  couponDiscount = shippingFee;
                }
                couponId = coupon.id;
              }
            }
          }
        }
      }
    }

    const subtotal = itemPrice;
    const total = subtotal + shippingFee - couponDiscount;

    // Handle free items
    if (total === 0) {
      // Create completed order for free items
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          ...(itemType === "course"
            ? { courseId: itemId }
            : { ebookId: itemId }),
          orderType: itemType === "course" ? "COURSE" : "EBOOK",
          status: "COMPLETED",
          subtotal,
          shippingFee,
          couponDiscount,
          total,
          couponId,
          couponCode,
        },
      });

      // Create payment record for free items
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: "FREE",
          status: "COMPLETED",
          amount: 0,
          paidAt: new Date(),
          ref: `FREE${Date.now()}`,
        },
      });

      // Create enrollment for free course
      if (itemType === "course") {
        await prisma.enrollment.create({
          data: {
            userId: user.id,
            courseId: itemId,
            status: "ACTIVE",
          },
        });
      }

      // Update coupon usage
      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });

        await prisma.couponUsage.create({
          data: {
            couponId,
            userId: user.id,
            orderId: order.id,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "ลงทะเบียนฟรีสำเร็จ",
        data: {
          orderId: order.id,
          isFree: true,
        },
      });
    }

    // Create pending order for paid items
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        ...(itemType === "course" ? { courseId: itemId } : { ebookId: itemId }),
        orderType: itemType === "course" ? "COURSE" : "EBOOK",
        status: "PENDING",
        subtotal,
        shippingFee,
        couponDiscount,
        total,
        couponId,
        couponCode,
      },
    });

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method: "BANK_TRANSFER",
        status: "PENDING",
        amount: total,
        ref: `ORD${Date.now()}${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`,
      },
    });

    // Create shipping record if needed
    if (itemType === "ebook" && item.isPhysical && shippingAddress) {
      await prisma.shipping.create({
        data: {
          orderId: order.id,
          recipientName: shippingAddress.name || user.name || user.email,
          recipientPhone: shippingAddress.phone || "",
          address: shippingAddress.address || "",
          district: shippingAddress.district || "",
          province: shippingAddress.province || "",
          postalCode: shippingAddress.postalCode || "",
          shippingMethod: "STANDARD",
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "สร้างคำสั่งซื้อสำเร็จ",
      data: {
        orderId: order.id,
        paymentId: payment.id,
        paymentRef: payment.ref,
        total: order.total,
        isFree: false,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ",
      },
      { status: 500 }
    );
  }
}

// GET - ดึงรายการ orders ของ user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ userId" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        ebook: {
          select: {
            title: true,
            coverImageUrl: true,
            author: true,
          },
        },
        course: {
          select: {
            title: true,
            description: true,
            instructor: {
              select: { name: true },
            },
          },
        },
        payment: true,
        shipping: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ" },
      { status: 500 }
    );
  }
}
