import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test simple query without includes
    const ebooks = await prisma.ebook.findMany({
      where: {
        isActive: true
      },
      take: 5
    });
    
    return NextResponse.json({ 
      success: true, 
      count: ebooks.length,
      ebooks: ebooks.map(e => ({
        id: e.id,
        title: e.title,
        author: e.author,
        price: e.price
      }))
    });
  } catch (error) {
    console.error('Simple ebooks test error:', error);
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