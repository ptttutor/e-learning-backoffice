import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug is required",
        },
        { status: 400 }
      );
    }

    // Try to find post by slug first, then by ID as fallback
    let post = await prisma.post.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }
        ],
        isActive: true,
        publishedAt: {
          lte: new Date(),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        postType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch post",
        message: error.message,
      },
      { status: 500 }
    );
  }
}