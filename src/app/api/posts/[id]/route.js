import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const post = await prisma.post.findUnique({
      where: {
        id: id,
        isActive: true,
        publishedAt: {
          lte: new Date()
        }
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
            name: true,
            description: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Post not found or not published' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch post',
        message: error.message 
      },
      { status: 500 }
    );
  }
}