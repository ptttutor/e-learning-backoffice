import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postType = searchParams.get("postType"); // ชื่อประเภทโพสต์
    const limit = searchParams.get("limit");
    const featured = searchParams.get("featured");

    // สร้าง where condition
    const whereCondition = {
      isActive: true,
      publishedAt: {
        lte: new Date(),
        not: null,
      },
      postType: {
        isActive: true,
      },
    };

    // กรองตามประเภทโพสต์ถ้ามีระบุ
    if (postType) {
      whereCondition.postType.name = postType;
    }

    // กรองโพสต์แนะนำถ้ามีระบุ
    if (featured === "true") {
      whereCondition.isFeatured = true;
    }

    // สร้าง query options
    const queryOptions = {
      where: whereCondition,
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
      },
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" }
      ],
    };

    // เพิ่ม limit ถ้ามีระบุ
    if (limit && !isNaN(parseInt(limit)) && parseInt(limit) > 0) {
      queryOptions.take = parseInt(limit);
    }

    // ดึงข้อมูลโพสต์
    const posts = await prisma.post.findMany(queryOptions);

    return NextResponse.json({
      success: true,
      message: "Posts fetched successfully",
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts",
        message: error.message,
        count: 0,
        data: []
      },
      { status: 500 }
    );
  }
}
