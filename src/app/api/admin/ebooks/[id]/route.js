import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูล ebook ตาม ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const ebook = await prisma.ebook.findUnique({
      where: { id: id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            reviews: true,
            orders: true
          }
        }
      }
    });

    if (!ebook) {
      return NextResponse.json(
        { error: 'Ebook not found' },
        { status: 404 }
      );
    }

    // คำนวณ average rating
    const averageRating = ebook.reviews.length > 0 
      ? ebook.reviews.reduce((sum, review) => sum + review.rating, 0) / ebook.reviews.length
      : 0;

    return NextResponse.json({
      ...ebook,
      averageRating
    });
  } catch (error) {
    console.error('Error fetching ebook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ebook' },
      { status: 500 }
    );
  }
}

// PUT - อัปเดต ebook
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const ebook = await prisma.ebook.update({
      where: { id: id },
      data: {
        title: data.title,
        description: data.description,
        author: data.author,
        isbn: data.isbn,
        price: data.price,
        discountPrice: data.discountPrice,
        coverImageUrl: data.coverImageUrl,
        previewUrl: data.previewUrl,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        pageCount: data.pageCount,
        publishedYear: data.publishedYear,
        language: data.language,
        format: data.format,
        isPhysical: data.isPhysical,
        weight: data.weight,
        dimensions: data.dimensions,
        downloadLimit: data.downloadLimit,
        accessDuration: data.accessDuration,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId || null,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        updatedAt: new Date()
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(ebook);
  } catch (error) {
    console.error('Error updating ebook:', error);
    return NextResponse.json(
      { error: 'Failed to update ebook' },
      { status: 500 }
    );
  }
}

// DELETE - ลบ ebook
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    console.log('DELETE API called with ID:', id);
    
    // ตรวจสอบว่ามี orders ที่เชื่อมโยงอยู่หรือไม่
    const orderCount = await prisma.order.count({
      where: {
        ebookId: id
      }
    });

    console.log('Order count:', orderCount);

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete ebook that has orders' },
        { status: 400 }
      );
    }

    // ลบ reviews ก่อน
    await prisma.ebookReview.deleteMany({
      where: { ebookId: id }
    });

    console.log('Reviews deleted');

    // ลบ ebook
    await prisma.ebook.delete({
      where: { id: id }
    });

    console.log('Ebook deleted successfully');

    return NextResponse.json({ message: 'Ebook deleted successfully' });
  } catch (error) {
    console.error('Error deleting ebook:', error);
    return NextResponse.json(
      { error: 'Failed to delete ebook' },
      { status: 500 }
    );
  }
}