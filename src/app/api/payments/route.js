import prisma from '../../../lib/prisma';

export async function POST(req) {
  const { orderId, method } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return Response.json({ error: 'ไม่พบคำสั่งซื้อ' }, { status: 404 });

  const payment = await prisma.payment.create({
    data: {
      orderId,
      method,
      status: 'pending',
    }
  });
  // TODO: เชื่อมต่อ payment gateway จริง
  return Response.json(payment);
}
