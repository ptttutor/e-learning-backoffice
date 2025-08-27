import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const postTypes = await prisma.postType.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(postTypes);
  } catch (error) {
    console.error('Error fetching post types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post types' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const postType = await prisma.postType.create({
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
    console.error('Error creating post type:', error);
    return NextResponse.json(
      { error: 'Failed to create post type' },
      { status: 500 }
    );
  }
}