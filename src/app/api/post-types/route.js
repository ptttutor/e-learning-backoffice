import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const postTypes = await prisma.postType.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                isActive: true,
                publishedAt: {
                  lte: new Date()
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: postTypes,
      count: postTypes.length
    });

  } catch (error) {
    console.error('Error fetching post types:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch post types',
        message: error.message 
      },
      { status: 500 }
    );
  }
}