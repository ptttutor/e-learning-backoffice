import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  isActive: true,
                  publishedAt: {
                    lte: new Date()
                  }
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
      data: tags,
      count: tags.length
    });

  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch tags',
        message: error.message 
      },
      { status: 500 }
    );
  }
}