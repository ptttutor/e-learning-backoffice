import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const postType = await prisma.postType.update({
      where: { id },
      data,
      include: {
        posts: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: postType
    });
  } catch (error) {
    console.error('Error updating post type:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post type' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // ตรวจสอบว่ามีโพสต์ที่ใช้ post type นี้หรือไม่
    const postsCount = await prisma.post.count({
      where: { postTypeId: id }
    });

    if (postsCount > 0) {
      return NextResponse.json(
        { success: false, error: `ไม่สามารถลบได้ เนื่องจากมีโพสต์ ${postsCount} รายการที่ใช้ประเภทนี้` },
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
      { success: false, error: 'Failed to delete post type' },
      { status: 500 }
    );
  }
}