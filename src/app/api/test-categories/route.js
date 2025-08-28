import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.ebookCategory.findMany();
    return NextResponse.json({ 
      success: true, 
      categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Categories test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        details: error.message 
      },
      { status: 500 }
    );
  }
}