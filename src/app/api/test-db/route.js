import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Simple test query
    const count = await prisma.ebook.count();
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      ebookCount: count 
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}