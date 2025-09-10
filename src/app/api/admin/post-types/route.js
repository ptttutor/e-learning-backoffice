import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const skip = (page - 1) * pageSize;
    
    // Filter parameters
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where = {};

    // Search in name and description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Status filter
    if (status && status !== "ALL") {
      if (status === "ACTIVE") {
        where.isActive = true;
      } else if (status === "INACTIVE") {
        where.isActive = false;
      }
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const totalCount = await prisma.postType.count({ where });

    // Get post types with filters and pagination
    const postTypes = await prisma.postType.findMany({
      where,
      include: {
        posts: {
          select: {
            id: true
          }
        }
      },
      orderBy,
      skip,
      take: pageSize,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: postTypes,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching post types:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post types' },
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
    console.error('Error creating post type:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post type' },
      { status: 500 }
    );
  }
}