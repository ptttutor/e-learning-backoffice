import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    console.log("=== PostContent API START ===");
    console.log("Params object:", params);
    
    // Try to extract postId
    const { id: postId } = await params;
    console.log("Extracted postId:", postId);
    
    // Try to parse request body
    const body = await request.json();
    console.log("Request body:", body);
    
    return NextResponse.json({
      success: true,
      message: "API route is working",
      receivedData: {
        postId,
        body
      }
    });
    
  } catch (error) {
    console.error("=== PostContent API ERROR ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error"
    }, { status: 500 });
  }
}