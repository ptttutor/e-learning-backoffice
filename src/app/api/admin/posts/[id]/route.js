import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const post = await prisma.post.findUnique({
      where: { id },
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
        postContents: {
          select: {
            id: true,
            urlImg: true,
            name: true,
            description: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // แปลง publishedAt เป็น Date object ถ้ามี
    if (data.publishedAt) {
      data.publishedAt = new Date(data.publishedAt);
    }

    const post = await prisma.post.update({
      where: { id },
      data,
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
        postContents: {
          select: {
            id: true,
            urlImg: true,
            name: true,
            description: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    console.log('🗑️ Attempting to delete post with ID:', id);

    // ตรวจสอบว่า Post มีอยู่หรือไม่
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true }
        },
        postType: {
          select: { name: true }
        }
      }
    });

    if (!existingPost) {
      console.log('❌ Post not found with ID:', id);
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    console.log('📝 Found post to delete:', existingPost.title);

    // ลบ Post โดยตรง
    await prisma.post.delete({
      where: { id }
    });

    console.log('✅ Post deleted successfully:', id);

    return NextResponse.json({ 
      success: true, 
      message: 'Post deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to delete post', 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
}