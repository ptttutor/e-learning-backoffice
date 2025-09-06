import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Get single user
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        lineId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            courses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบผู้ใช้ที่ระบุ",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, email, role, lineId, image, password } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบผู้ใช้ที่ระบุ",
        },
        { status: 404 }
      );
    }

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            error: "อีเมลนี้ได้ถูกใช้งานแล้ว",
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      role,
      lineId,
      image,
    };

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        lineId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "แก้ไขข้อมูลผู้ใช้สำเร็จ",
    });
  } catch (error) {
    console.error("Update user error:", error);
    
    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "อีเมลหรือข้อมูลที่ไม่ซ้ำกันได้ถูกใช้งานแล้ว",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            courses: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบผู้ใช้ที่ระบุ",
        },
        { status: 404 }
      );
    }

    // Prevent deleting admin users (optional protection)
    if (existingUser.role === 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถลบผู้ดูแลระบบได้",
        },
        { status: 403 }
      );
    }

    // Check if user has related data that prevents deletion
    if (existingUser._count.orders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถลบผู้ใช้ได้ เนื่องจากมีคำสั่งซื้อที่เกี่ยวข้อง",
        },
        { status: 400 }
      );
    }

    if (existingUser._count.courses > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถลบผู้ใช้ได้ เนื่องจากมีคอร์สเรียนที่เกี่ยวข้อง",
        },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบผู้ใช้สำเร็จ",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    
    // Handle specific Prisma errors
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถลบผู้ใช้ได้ เนื่องจากมีข้อมูลที่เกี่ยวข้องในระบบ",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการลบผู้ใช้",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
