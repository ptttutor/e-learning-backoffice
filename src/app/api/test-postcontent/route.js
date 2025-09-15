import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Test API called");
    
    // Test basic Prisma connection
    const postCount = await prisma.post.count();
    console.log("Post count:", postCount);
    
    // Test if PostContent model exists
    const postContentCount = await prisma.postContent.count();
    console.log("PostContent count:", postContentCount);
    
    return NextResponse.json({
      success: true,
      data: {
        postCount,
        postContentCount
      }
    });
  } catch (error) {
    console.error("Test API error:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}