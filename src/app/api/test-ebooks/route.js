import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test simple query first
    const ebooks = await prisma.ebook.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      ebooks,
      count: ebooks.length
    });
  } catch (error) {
    console.error('Ebooks test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch ebooks',
        details: error.message 
      },
      { status: 500 }
    );
  }
}