import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - สร้าง order ใหม่
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerInfo,
      billingAddress,
      shippingAddress,
      items,
      paymentMethod,
      total,
    } = body;

    // Validate required fields
    if (!customerInfo?.email || !items?.length || !total) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    // Create or find user
    let user = await prisma.user.findUnique({
      where: { email: customerInfo.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: customerInfo.email,
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          role: "STUDENT",
        },
      });
    }

    // Process each item in the order
    const orderPromises = items.map(async (item) => {
      // Verify item exists and get current price
      let itemData;
      if (item.type === "ebook") {
        itemData = await prisma.ebook.findUnique({
          where: { id: item.id, isActive: true },
        });
      } else if (item.type === "course") {
        itemData = await prisma.course.findUnique({
          where: { id: item.id, status: "PUBLISHED" },
        });
      }

      if (!itemData) {
        throw new Error(`ไม่พบสินค้า: ${item.title}`);
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          orderType: item.type === "ebook" ? "EBOOK" : "COURSE",
          status: "PENDING",
          total: item.price * item.quantity,
          shippingFee: 0,
          ...(item.type === "ebook"
            ? { ebookId: item.id }
            : { courseId: item.id }),
        },
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          method: paymentMethod,
          status:
            paymentMethod === "bank_transfer"
              ? "PENDING_VERIFICATION"
              : "PENDING",
        },
      });

      // Create shipping record if needed (for physical books)
      if (item.type === "ebook" && itemData.isPhysical && shippingAddress) {
        await prisma.shipping.create({
          data: {
            orderId: order.id,
            recipientName:
              shippingAddress.name ||
              `${customerInfo.firstName} ${customerInfo.lastName}`,
            recipientPhone: shippingAddress.phone || customerInfo.phone || "",
            address: shippingAddress.address || "",
            district: shippingAddress.city || "",
            province: shippingAddress.province || "",
            postalCode: shippingAddress.postalCode || "",
            shippingMethod: "PENDING",
            status: "PENDING",
          },
        });
      }

      return { order, payment };
    });

    const results = await Promise.all(orderPromises);

    // Handle payment processing based on method
    if (paymentMethod === "bank_transfer") {
      // For bank transfer, keep status as pending verification
      const paymentUpdates = results.map(({ payment }) =>
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PENDING_VERIFICATION",
            ref: `TRF${Date.now()}${Math.random()
              .toString(36)
              .substr(2, 5)
              .toUpperCase()}`,
          },
        })
      );

      // Keep order status as pending
      const orderUpdates = results.map(({ order }) =>
        prisma.order.update({
          where: { id: order.id },
          data: { status: "PENDING_PAYMENT" },
        })
      );

      await Promise.all([...paymentUpdates, ...orderUpdates]);
    } else {
      // Simulate other payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update payment status to completed
      const paymentUpdates = results.map(({ payment }) =>
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "COMPLETED",
            paidAt: new Date(),
            ref: `PAY${Date.now()}${Math.random()
              .toString(36)
              .substr(2, 5)
              .toUpperCase()}`,
          },
        })
      );

      // Update order status to completed
      const orderUpdates = results.map(({ order }) =>
        prisma.order.update({
          where: { id: order.id },
          data: { status: "COMPLETED" },
        })
      );

      await Promise.all([...paymentUpdates, ...orderUpdates]);
    }

    // For courses, create enrollment only if payment is completed
    if (paymentMethod !== "bank_transfer") {
      const courseOrders = results.filter(
        ({ order }) => order.orderType === "COURSE"
      );
      if (courseOrders.length > 0) {
        const enrollmentPromises = courseOrders.map(({ order }) =>
          prisma.enrollment.create({
            data: {
              userId: user.id,
              courseId: order.courseId,
              status: "ACTIVE",
            },
          })
        );
        await Promise.all(enrollmentPromises);
      }
    }

    return NextResponse.json({
      success: true,
      message: "สั่งซื้อสำเร็จ",
      orderId: results[0].order.id,
      orders: results.map(({ order }) => order.id),
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
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุอีเมล" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
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
