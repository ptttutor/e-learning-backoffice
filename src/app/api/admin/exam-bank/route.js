import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายการข้อสอบทั้งหมด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 10;
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const minFiles = searchParams.get('minFiles');
    const maxFiles = searchParams.get('maxFiles');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where conditions
    const where = {
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }),
      ...(categoryId && { categoryId })
    };

    // Build orderBy
    const orderBy = {};
    if (sortBy === 'fileCount') {
      // Handle special case for file count sorting
      orderBy.files = {
        _count: sortOrder
      };
    } else if (sortBy === 'categoryId') {
      orderBy.category = {
        name: sortOrder
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get total count
    const totalCount = await prisma.examBank.count({ where });

    // Get exams with includes
    const exams = await prisma.examBank.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true
          }
        },
        _count: {
          select: { files: true }
        }
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // Add fileCount to each exam and filter by file count if needed
    let filteredExams = exams.map(exam => ({
      ...exam,
      fileCount: exam._count.files
    }));

    // Apply file count filters if specified
    if (minFiles !== null) {
      const minFilesNum = parseInt(minFiles);
      filteredExams = filteredExams.filter(exam => exam.fileCount >= minFilesNum);
    }
    
    if (maxFiles !== null) {
      const maxFilesNum = parseInt(maxFiles);
      filteredExams = filteredExams.filter(exam => exam.fileCount <= maxFilesNum);
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: filteredExams,
      pagination: {
        page,
        pageSize,
        totalCount,
      }
    });

  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อสอบ' },
      { status: 500 }
    );
  }
}

// POST - สร้างข้อสอบใหม่
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, categoryId } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุชื่อข้อสอบ' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าหมวดหมู่มีอยู่หรือไม่ (ถ้าระบุ)
    if (categoryId) {
      const category = await prisma.examCategory.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: 'ไม่พบหมวดหมู่ที่ระบุ' },
          { status: 400 }
        );
      }
    }

    const exam = await prisma.examBank.create({
      data: {
        title,
        description,
        categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'สร้างข้อสอบสำเร็จ',
      data: exam
    });

  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการสร้างข้อสอบ' },
      { status: 500 }
    );
  }
}