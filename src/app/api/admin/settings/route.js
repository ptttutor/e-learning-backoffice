import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/settings - ดึงการตั้งค่าทั้งหมด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get('public')
    const key = searchParams.get('key')

    const where = {
      ...(isPublic !== null && { isPublic: isPublic === 'true' }),
      ...(key && { key: { contains: key, mode: 'insensitive' } })
    }

    const settings = await prisma.setting.findMany({
      where,
      orderBy: { key: 'asc' }
    })

    // Group settings by category (based on key prefix)
    const groupedSettings = settings.reduce((acc, setting) => {
      const category = setting.key.split('_')[0] || 'general'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(setting)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        settings,
        grouped: groupedSettings
      }
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings', error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/settings - สร้างการตั้งค่าใหม่
export async function POST(request) {
  try {
    const body = await request.json()
    
    // ตรวจสอบ key ซ้ำ
    const existingSetting = await prisma.setting.findUnique({
      where: { key: body.key }
    })

    if (existingSetting) {
      return NextResponse.json(
        { success: false, message: 'Setting key already exists' },
        { status: 400 }
      )
    }

    const setting = await prisma.setting.create({
      data: {
        key: body.key,
        value: body.value,
        type: body.type || 'string',
        description: body.description,
        isPublic: body.isPublic || false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Setting created successfully',
      data: setting
    })
  } catch (error) {
    console.error('Error creating setting:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create setting', error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings - อัพเดทการตั้งค่าหลายรายการ
export async function PUT(request) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, message: 'Settings must be an array' },
        { status: 400 }
      )
    }

    // อัพเดทการตั้งค่าทีละรายการ
    const updatePromises = settings.map(setting => 
      prisma.setting.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          type: setting.type || 'string',
          description: setting.description,
          isPublic: setting.isPublic || false
        },
        create: {
          key: setting.key,
          value: setting.value,
          type: setting.type || 'string',
          description: setting.description,
          isPublic: setting.isPublic || false
        }
      })
    )

    const updatedSettings = await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update settings', error: error.message },
      { status: 500 }
    )
  }
}