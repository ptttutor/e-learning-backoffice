import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { tagSlug } = params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    // สร้าง query options
    const queryOptions = {
      where: {
        isActive: true,
        publishedAt: {
          lte: new Date()
        },
        tags: {
          some: {
            tag: {
              slug: tagSlug,
              isActive: true
            }
          }
        },
        postType: {
          isActive: true
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
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { publishedAt: 'desc' }
      ]
    };

    // เพิ่ม limit ถ้ามี
    if (limit && !isNaN(parseInt(limit))) {
      queryOptions.take = parseInt(limit);
    }

    const posts = await prisma.post.findMany(queryOptions);

    // ดึงข้อมูลแท็กที่ใช้ในการกรอง
    const tag = await prisma.tag.findUnique({
      where: {
        slug: tagSlug,
        isActive: true
      }
    });

    if (!tag) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Tag not found or not active' 
        },
        { status: 404 }
      );
    }

    // แปลงข้อมูล tags ให้อ่านง่ายขึ้น
    const formattedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(postTag => postTag.tag)
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      count: formattedPosts.length,
      tag: tag
    });

  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch posts by tag',
        message: error.message 
      },
      { status: 500 }
    );
  }
}