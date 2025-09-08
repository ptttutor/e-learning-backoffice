import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID is required' 
        },
        { status: 400 }
      );
    }

    // ต้องมี courseId หรือ ebookId อย่างใดอย่างหนึ่ง
    if (!body.courseId && !body.ebookId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either Course ID or Ebook ID is required' 
        },
        { status: 400 }
      );
    }

    // ไม่สามารถรีวิวทั้ง course และ ebook พร้อมกันได้
    if (body.courseId && body.ebookId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot review both course and ebook in the same review' 
        },
        { status: 400 }
      );
    }

    // Validate rating (1-5)
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rating must be between 1 and 5' 
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: body.userId }
    });

    if (!userExists) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    let targetItem = null;
    let isVerified = false;
    let reviewType = '';

    // ตรวจสอบ Course
    if (body.courseId) {
      const courseExists = await prisma.course.findUnique({
        where: { id: body.courseId }
      });

      if (!courseExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Course not found' 
          },
          { status: 404 }
        );
      }

      // ตรวจสอบการลงทะเบียนเรียน
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: body.userId,
          courseId: body.courseId,
          status: 'ACTIVE'
        }
      });

      targetItem = courseExists;
      isVerified = enrollment ? true : false;
      reviewType = 'COURSE';
    }

    // ตรวจสอบ Ebook
    if (body.ebookId) {
      const ebookExists = await prisma.ebook.findUnique({
        where: { id: body.ebookId }
      });

      if (!ebookExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Ebook not found' 
          },
          { status: 404 }
        );
      }

      // ตรวจสอบการซื้อ ebook
      const purchase = await prisma.order.findFirst({
        where: {
          userId: body.userId,
          ebookId: body.ebookId,
          status: 'COMPLETED'
        }
      });

      targetItem = ebookExists;
      isVerified = purchase ? true : false;
      reviewType = 'EBOOK';
    }

    // สร้าง review
    const review = await prisma.review.create({
      data: {
        userId: body.userId,
        courseId: body.courseId || null,
        ebookId: body.ebookId || null,
        rating: body.rating ?? 5,
        title: body.title || null,
        comment: body.comment || null,
        isActive: body.isActive ?? true,
        isVerified: isVerified,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        course: body.courseId ? {
          select: {
            id: true,
            title: true
          }
        } : false,
        ebook: body.ebookId ? {
          select: {
            id: true,
            title: true,
            author: true
          }
        } : false
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        ...review,
        reviewType: reviewType
      },
      message: `${reviewType.toLowerCase()} review created successfully`
    });

  } catch (error) {
    console.error('Error creating review:', error);
    
    // Handle unique constraint violation (duplicate review)
    if (error.code === 'P2002') {
      const isDuplicateCourse = error.meta?.target?.includes('courseId');
      const isDuplicateEbook = error.meta?.target?.includes('ebookId');
      
      let errorMessage = 'You have already reviewed this item';
      if (isDuplicateCourse) {
        errorMessage = 'You have already reviewed this course';
      } else if (isDuplicateEbook) {
        errorMessage = 'You have already reviewed this ebook';
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// GET API สำหรับดึง reviews
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const ebookId = searchParams.get('ebookId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      isActive: true,
      ...(courseId && { courseId }),
      ...(ebookId && { ebookId }),
      ...(userId && { userId })
    };

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          course: courseId ? {
            select: {
              id: true,
              title: true
            }
          } : false,
          ebook: ebookId ? {
            select: {
              id: true,
              title: true,
              author: true
            }
          } : false
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ]);

    // Calculate statistics
    const stats = await prisma.review.groupBy({
      by: ['rating'],
      where,
      _count: {
        rating: true
      }
    });

    const ratingStats = {
      totalReviews: total,
      averageRating: 0,
      ratingDistribution: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    };

    if (total > 0) {
      let totalRating = 0;
      stats.forEach(stat => {
        ratingStats.ratingDistribution[stat.rating] = stat._count.rating;
        totalRating += stat.rating * stat._count.rating;
      });
      ratingStats.averageRating = Math.round((totalRating / total) * 10) / 10;
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: ratingStats
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}