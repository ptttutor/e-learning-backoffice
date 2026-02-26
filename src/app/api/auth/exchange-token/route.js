import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createExternalToken } from "@/lib/jwt";

/**
 * Exchange NextAuth session for JWT token
 * This allows users logged in via backend admin to get JWT tokens for frontend use
 */
export async function POST(req) {
  try {
    console.log('🟢 [Backend] Token exchange request received');
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.error('❌ [Backend] No NextAuth session found for token exchange');
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log('✅ [Backend] Found NextAuth session for:', session.user.email);
    // Create JWT token for the authenticated user
    const token = createExternalToken(session.user);
    console.log('✅ [Backend] Generated JWT token');
    
    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          image: session.user.image,
        }
      }
    });
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}
