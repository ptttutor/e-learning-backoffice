import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - สร้าง order ใหม่
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, items, couponCode, shippingAddress } = body;
    if (!userId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }
    // Get user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "ไม่พบผู้ใช้งาน" }, { status: 404 });
    }
    // Validate & collect item data
    let subtotal = 0;
    let orderItems = [];
    let hasPhysical = false;
    for (const cartItem of items) {
      const { itemType, itemId, title, quantity = 1, unitPrice } = cartItem;
      let itemData;
      if (itemType === "COURSE") {
        itemData = await prisma.course.findUnique({ where: { id: itemId, status: "PUBLISHED" } });
      } else if (itemType === "EBOOK") {
        itemData = await prisma.ebook.findUnique({ where: { id: itemId, isActive: true } });
      }
      if (!itemData) {
        return NextResponse.json({ success: false, error: `ไม่พบสินค้า ${itemId}` }, { status: 404 });
      }
      // Check duplicate purchase
      const existingOrder = await prisma.orderItem.findFirst({
        where: {
          itemType,
          itemId,
          order: { userId: userId, status: "COMPLETED" }
        }
      });
      if (existingOrder) {
        return NextResponse.json({ success: false, error: `คุณได้ซื้อสินค้านี้แล้ว (${itemId})` }, { status: 400 });
      }
      const price = itemData.discountPrice || itemData.price || 0;
      subtotal += price * quantity;
      orderItems.push({
        itemType,
        itemId,
        title: title || itemData.title,
        quantity,
        unitPrice: price,
        totalPrice: price * quantity
      });
      if (itemData.isPhysical) hasPhysical = true;
    }
    // Shipping fee always 0 (ตามที่ user ต้องการ)
    const shippingFee = 0;
    // Coupon logic (apply to subtotal)
    let couponDiscount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode, isActive: true },
        include: { usages: { where: { userId } } },
      });
      if (coupon) {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
            if (!coupon.userUsageLimit || coupon.usages.length < coupon.userUsageLimit) {
              if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
                if (coupon.type === "PERCENTAGE") {
                  couponDiscount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity);
                } else if (coupon.type === "FIXED_AMOUNT") {
                  couponDiscount = Math.min(coupon.value, subtotal);
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
    const total = subtotal + shippingFee - couponDiscount;
    // สร้าง order หลัก
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: total === 0 ? "COMPLETED" : "PENDING",
        subtotal,
        shippingFee,
        couponDiscount,
        total,
        couponId,
        couponCode,
        items: { create: orderItems }
      }
    });
    // Payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: total === 0 ? "FREE" : "BANK_TRANSFER",
        status: total === 0 ? "COMPLETED" : "PENDING",
        amount: total,
        paidAt: total === 0 ? new Date() : undefined,
        ref: total === 0 ? `FREE${Date.now()}` : `ORD${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      }
    });

    // Clear only cartItems that were ordered
    try {
      const cart = await prisma.cart.findFirst({ where: { userId: user.id } });
      if (cart && orderItems.length > 0) {
        const deleteConditions = orderItems.map(item => ({
          cartId: cart.id,
          itemType: item.itemType,
          itemId: item.itemId
        }));
        // Prisma does not support deleteMany with OR array directly, so use transaction
        await prisma.$transaction(
          deleteConditions.map(cond =>
            prisma.cartItem.deleteMany({ where: cond })
          )
        );
      }
    } catch (cartError) {
      console.error("Error clearing cart after order:", cartError);
    }
    // Enrollment for free course(s)
    if (total === 0) {
      for (const item of orderItems) {
        if (item.itemType === "COURSE") {
          await prisma.enrollment.create({
            data: { userId: user.id, courseId: item.itemId, status: "ACTIVE" }
          });
        }
      }
    }
    // Coupon usage
    if (couponId) {
      await prisma.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } });
      await prisma.couponUsage.create({ data: { couponId, userId: user.id, orderId: order.id } });
    }
    // Shipping (ถ้ามี physical item และมี shippingAddress)
    if (hasPhysical && shippingAddress) {
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
          status: "PENDING"
        }
      });
    }
    return NextResponse.json({
      success: true,
      message: total === 0 ? "ลงทะเบียนฟรีสำเร็จ" : "สร้างคำสั่งซื้อสำเร็จ",
      data: {
        orderId: order.id,
        isFree: total === 0,
        total
      }
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

// GET -  orders  user
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
        items: true,
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
