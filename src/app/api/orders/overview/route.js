import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - รายละเอียดออร์เดอร์ course/ebook ที่ถูกขายแต่ละครั้ง
export async function GET(request) {
  try {
    // สามารถเพิ่ม filter ได้ เช่น period, type ฯลฯ
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get("period")) || 30;
    const type = searchParams.get("type"); // "course" หรือ "ebook" หรือ null

    // คำนวณวันที่ย้อนหลัง
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - period);

    const orders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: fromDate },
        ...(type ? { orderType: type.toUpperCase() } : {}),
      },
      include: {
        ebook: { select: { title: true } },
        course: { select: { title: true } },
        payment: { select: { amount: true, paidAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // สร้างข้อมูลสำหรับตาราง
    const data = orders.map((order) => ({
      orderId: order.id,
      type: order.orderType,
      name: order.course?.title || order.ebook?.title || "-",
      amount: order.payment?.amount || order.total,
      date: order.payment?.paidAt || order.createdAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching sales overview:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
