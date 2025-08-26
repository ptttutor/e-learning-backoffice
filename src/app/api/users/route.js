import prisma from '../../../lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return Response.json({ error: 'ต้องระบุ email' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return Response.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
  return Response.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
