import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// POST /api/admin/upload - อัพโหลดไฟล์
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const uploadedBy = formData.get('uploadedBy')
    const folder = formData.get('folder') || 'general'

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // สร้างชื่อไฟล์ใหม่
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substr(2, 9)}.${extension}`
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // เขียนไฟล์
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // สร้าง URL
    const fileUrl = `/uploads/${folder}/${fileName}`
    const relativePath = `uploads/${folder}/${fileName}`

    // บันทึกข้อมูลไฟล์ในฐานข้อมูล
    const fileUpload = await prisma.fileUpload.create({
      data: {
        originalName,
        fileName,
        filePath: relativePath,
        fileUrl,
        mimeType: file.type,
        fileSize: file.size,
        uploadedBy: uploadedBy || null
      },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: fileUpload
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload file', error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/admin/upload - ดึงรายการไฟล์ที่อัพโหลด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const mimeType = searchParams.get('mimeType')
    const uploadedBy = searchParams.get('uploadedBy')

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { originalName: { contains: search, mode: 'insensitive' } },
          { fileName: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(mimeType && { mimeType: { startsWith: mimeType } }),
      ...(uploadedBy && { uploadedBy })
    }

    const [files, total] = await Promise.all([
      prisma.fileUpload.findMany({
        where,
        skip,
        take: limit,
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.fileUpload.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        files,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch files', error: error.message },
      { status: 500 }
    )
  }
}