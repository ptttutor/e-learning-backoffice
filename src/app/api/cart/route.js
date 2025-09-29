import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/cart - เพิ่มสินค้าเข้าตะกร้า
export async function POST(req) {
  try {
    const { userId, itemType, itemId, title, quantity = 1, unitPrice } = await req.json();
    if (!userId || !itemType || !itemId) {
      return NextResponse.json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }
    if (quantity !== 1) {
      return NextResponse.json({ success: false, error: 'สามารถเพิ่มสินค้าแต่ละชิ้นได้ครั้งละ 1 เท่านั้น' }, { status: 400 });
    }
    // หา cart ของ user หรือสร้างใหม่
  let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
    // หา item ซ้ำ ถ้ามีให้ reject
    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, itemType, itemId } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'มีสินค้านี้ในตะกร้าแล้ว' }, { status: 400 });
    }
    // เพิ่มใหม่เท่านั้น
    const cartItem = await prisma.cartItem.create({
      data: { cartId: cart.id, itemType, itemId, title, quantity: 1, unitPrice }
    });
    return NextResponse.json({ success: true, data: cartItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET /api/cart?userId=xxx - ดูตะกร้าของ user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ userId' }, { status: 400 });
    }
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true }
    });
    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
