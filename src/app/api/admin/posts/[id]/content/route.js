import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { contentItems } = body;

    console.log("PostContent API - postId:", postId);
    console.log("PostContent API - contentItems:", contentItems);

    if (!postId) {
      return NextResponse.json({
        success: false,
        error: "Post ID is required"
      }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(postId)) {
      return NextResponse.json({
        success: false,
        error: "Invalid Post ID format"
      }, { status: 400 });
    }

    if (!contentItems || !Array.isArray(contentItems) || contentItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Content items are required"
      }, { status: 400 });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({
        success: false,
        error: "Post not found"
      }, { status: 404 });
    }

    // TODO: Get authorId from session/auth
    // For now, using post's authorId
    const authorId = post.authorId;

    // Create multiple PostContent records
    const createdContents = await Promise.all(
      contentItems.map(async (item) => {
        console.log("Creating PostContent with data:", {
          urlImg: item.urlImg,
          name: item.name,
          description: item.description,
          authorId: authorId,
          postId: postId
        });
        
        return await prisma.postContent.create({
          data: {
            urlImg: item.urlImg,
            name: item.name,
            description: item.description,
            authorId: authorId,
            postId: postId
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      data: createdContents,
      message: `เพิ่มเนื้อหาสำเร็จ ${createdContents.length} รายการ`
    });

  } catch (error) {
    console.error("Error creating post content:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการสร้างเนื้อหา"
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json({
        success: false,
        error: "Post ID is required"
      }, { status: 400 });
    }

    // Get all content for this post
    const contents = await prisma.postContent.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: contents
    });

  } catch (error) {
    console.error("Error fetching post content:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลเนื้อหา"
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!postId) {
      return NextResponse.json({
        success: false,
        error: "Post ID is required"
      }, { status: 400 });
    }

    if (contentId) {
      // Delete specific content
      await prisma.postContent.delete({
        where: { 
          id: contentId,
          postId: postId // Ensure content belongs to this post
        }
      });

      return NextResponse.json({
        success: true,
        message: "ลบเนื้อหาสำเร็จ"
      });
    } else {
      // Delete all content for this post
      const deletedCount = await prisma.postContent.deleteMany({
        where: { postId }
      });

      return NextResponse.json({
        success: true,
        data: { deletedCount: deletedCount.count },
        message: `ลบเนื้อหาทั้งหมด ${deletedCount.count} รายการ`
      });
    }

  } catch (error) {
    console.error("Error deleting post content:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการลบเนื้อหา"
    }, { status: 500 });
  }
}