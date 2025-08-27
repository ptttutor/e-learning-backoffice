import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const postType = await prisma.postType.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    return NextResponse.json(postType);
  } catch (error) {
    console.error('Error updating post type:', error);
    return NextResponse.json(
      { error: 'Failed to update post type' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // ตรวจสอบว่ามีโพสต์ที่ใช้ post type นี้หรือไม่
    const postsCount = await prisma.post.count({
      where: { postTypeId: id }
    });

    if (postsCount > 0) {
      return NextResponse.json(
        { error: `ไม่สามารถลบได้ เนื่องจากมีโพสต์ ${postsCount} รายการที่ใช้ประเภทนี้` },
        { status: 400 }
      );
    }

    await prisma.postType.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post type:', error);
    return NextResponse.json(
      { error: 'Failed to delete post type' },
      { status: 500 }
    );
  }
}