import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - ตรวจสอบความถูกต้องของคูปอง
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, userId, itemType, itemId, subtotal } = body;

    if (!code || !userId || !subtotal) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code, isActive: true },
      include: {
        usages: {
          where: { userId }
        },
        categories: true,
        items: true,
      }
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "ไม่พบรหัสส่วนลดนี้" },
        { status: 404 }
      );
    }

    // Check if coupon is valid
    const now = new Date();
    
    if (now < coupon.validFrom) {
      return NextResponse.json(
        { success: false, error: "รหัสส่วนลดยังไม่เริ่มใช้งาน" },
        { status: 400 }
      );
    }

    if (now > coupon.validUntil) {
      return NextResponse.json(
        { success: false, error: "รหัสส่วนลดหมดอายุแล้ว" },
        { status: 400 }
      );
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: "รหัสส่วนลดถูกใช้หมดแล้ว" },
        { status: 400 }
      );
    }

    if (coupon.userUsageLimit && coupon.usages.length >= coupon.userUsageLimit) {
      return NextResponse.json(
        { success: false, error: "คุณใช้รหัสส่วนลดนี้ครบจำนวนแล้ว" },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { 
          success: false, 
          error: `ยอดขั้นต่ำสำหรับใช้รหัสนี้คือ ${coupon.minOrderAmount.toLocaleString()} บาท` 
        },
        { status: 400 }
      );
    }

    // Check applicable type
    if (coupon.applicableType === 'COURSE_ONLY' && itemType !== 'course') {
      return NextResponse.json(
        { success: false, error: "รหัสส่วนลดนี้ใช้ได้เฉพาะคอร์สเรียน" },
        { status: 400 }
      );
    }

    if (coupon.applicableType === 'EBOOK_ONLY' && itemType !== 'ebook') {
      return NextResponse.json(
        { success: false, error: "รหัสส่วนลดนี้ใช้ได้เฉพาะหนังสือ" },
        { status: 400 }
      );
    }

    // Check specific items (if applicable)
    if (coupon.applicableType === 'SPECIFIC_ITEM') {
      const applicableItem = coupon.items.find(
        item => item.itemId === itemId && item.itemType.toLowerCase() === itemType.toUpperCase()
      );
      
      if (!applicableItem) {
        return NextResponse.json(
          { success: false, error: "รหัสส่วนลดนี้ใช้ไม่ได้กับสินค้าที่เลือก" },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discount = 0;
    let discountType = '';

    if (coupon.type === 'PERCENTAGE') {
      discount = Math.min(
        (subtotal * coupon.value) / 100,
        coupon.maxDiscount || Infinity
      );
      discountType = `ลด ${coupon.value}%`;
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discount = Math.min(coupon.value, subtotal);
      discountType = `ลด ${coupon.value.toLocaleString()} บาท`;
    } else if (coupon.type === 'FREE_SHIPPING') {
      discount = 50; // ค่าจัดส่งมาตรฐาน
      discountType = 'ฟรีค่าจัดส่ง';
    }

    const finalTotal = Math.max(0, subtotal - discount);

    return NextResponse.json({
      success: true,
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
          discountType,
        },
        discount: Math.round(discount * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100,
      }
    });

  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบรหัสส่วนลด" },
      { status: 500 }
    );
  }
}