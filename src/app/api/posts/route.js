import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postTypeName = searchParams.get("postType");
    const limit = searchParams.get("limit");
    const featured = searchParams.get("featured");

    // สร้าง where condition
    const whereCondition = {
      isActive: true,
      publishedAt: {
        lte: new Date(),
      },
    };

    // กรองตามประเภทโพสต์ถ้ามี
    if (postTypeName) {
      whereCondition.postType = {
        name: postTypeName,
        isActive: true,
      };
    } else {
      // ถ้าไม่ระบุประเภท ให้แสดงเฉพาะประเภทที่เปิดใช้งาน
      whereCondition.postType = {
        isActive: true,
      };
    }

    // กรองโพสต์แนะนำถ้ามี
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
      },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    };

    // เพิ่ม limit ถ้ามี
    if (limit && !isNaN(parseInt(limit))) {
      queryOptions.take = parseInt(limit);
    }

    const posts = await prisma.post.findMany(queryOptions);

    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
