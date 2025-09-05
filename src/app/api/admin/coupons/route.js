import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - ดึงรายการคูปอง
export async function GET(request) {
  try {
    // สำหรับการทดสอบ - ข้าม authentication check ชั่วคราว
    // const session = await getServerSession(authOptions);
    // if (!session?.user || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const applicable = searchParams.get("applicable") || "";

    const skip = (page - 1) * limit;

    // สร้าง where clause
    const where = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    if (applicable) {
      where.applicableType = applicable;
    }

    // ดึงข้อมูลคูปอง
    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          usages: {
            select: { id: true }
          },
          _count: {
            select: {
              usages: true,
              orders: true
            }
          }
        }
      }),
      prisma.coupon.count({ where })
    ]);

    // คำนวณข้อมูลเพิ่มเติม
    const couponsWithStats = coupons.map(coupon => ({
      ...coupon,
      usageCount: coupon._count.usages,
      orderCount: coupon._count.orders,
      usagePercentage: coupon.usageLimit 
        ? Math.round((coupon._count.usages / coupon.usageLimit) * 100)
        : 0,
      isExpired: new Date() > new Date(coupon.validUntil),
      daysLeft: Math.max(0, Math.ceil((new Date(coupon.validUntil) - new Date()) / (1000 * 60 * 60 * 24)))
    }));

    return NextResponse.json({
      success: true,
      data: {
        coupons: couponsWithStats,
        pagination: {
          current: page,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error("GET coupons error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลคูปอง" },
      { status: 500 }
    );
  }
}

// POST - สร้างคูปองใหม่
export async function POST(request) {
  try {
    // สำหรับการทดสอบ - ข้าม authentication check ชั่วคราว
    // const session = await getServerSession(authOptions);
    // if (!session?.user || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const {
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      userUsageLimit,
      isActive,
      validFrom,
      validUntil,
      applicableType
    } = body;

    // Validation
    if (!code || !name || !type || value === undefined) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูលที่จำเป็น" },
        { status: 400 }
      );
    }

    // ตรวจสอบรหัสคูปองซ้ำ
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: "รหัสคูปองนี้มีอยู่แล้ว" },
        { status: 400 }
      );
    }

    // สร้างคูปอง
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        type,
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        userUsageLimit: userUsageLimit ? parseInt(userUsageLimit) : null,
        isActive: Boolean(isActive),
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        applicableType: applicableType || "ALL"
      }
    });

    return NextResponse.json({
      success: true,
      data: coupon,
      message: "สร้างคูปองสำเร็จ"
    });

  } catch (error) {
    console.error("POST coupon error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการสร้างคูปอง" },
      { status: 500 }
    );
  }
}
