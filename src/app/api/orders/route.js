import prisma from '../../../lib/prisma';

export async function POST(req) {
  try {
    let { userId, courseId } = await req.json();
    // Prisma schema: userId ต้องเป็น String (uuid)
    if (typeof userId !== 'string') userId = String(userId);
    if (!userId || !courseId) return Response.json({ error: 'userId และ courseId จำเป็นต้องระบุ' }, { status: 400 });

    // ตรวจสอบว่าซื้อซ้ำหรือยัง
    const exist = await prisma.order.findFirst({
      where: { userId, courseId, status: { in: ['pending', 'paid'] } }
    });
    if (exist) return Response.json({ error: 'คุณสั่งซื้อคอร์สนี้แล้ว' }, { status: 400 });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return Response.json({ error: 'ไม่พบคอร์ส' }, { status: 404 });

    const order = await prisma.order.create({
      data: {
        userId,
        courseId,
        status: 'pending',
        total: course.price,
      }
    });
    return Response.json(order);
  } catch (e) {
    console.error('Order API error:', e);
    return Response.json({ error: 'Internal Server Error', detail: e.message }, { status: 500 });
  }
}
