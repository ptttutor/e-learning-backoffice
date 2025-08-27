import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        postType: {
          select: {
            id: true,
            name: true
          }
        },

      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // สร้าง slug อัตโนมัติถ้าไม่มี
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9ก-๙\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // แปลง publishedAt เป็น Date object ถ้ามี
    if (data.publishedAt) {
      data.publishedAt = new Date(data.publishedAt);
    }

    // ใช้ user id แรกเป็น author (ในการใช้งานจริงควรใช้ session)
    const firstUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!firstUser) {
      return NextResponse.json(
        { error: 'No admin user found' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        ...data,
        authorId: firstUser.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        postType: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}