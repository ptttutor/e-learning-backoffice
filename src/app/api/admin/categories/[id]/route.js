import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: /api/admin/categories/[id] - get a single category
export async function GET(req, { params }) {
	try {
		const { id } = params;
		if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
		const category = await prisma.category.findUnique({
			where: { id },
			include: { courses: true },
		});
		if (!category) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
		return NextResponse.json({ success: true, data: category });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// PUT: /api/admin/categories/[id] - update a category
export async function PUT(req, { params }) {
	try {
		const { id } = params;
		if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
		const body = await req.json();
		const category = await prisma.category.update({
			where: { id },
			data: {
				name: body.name,
				description: body.description,
			},
		});
		return NextResponse.json({ success: true, data: category });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 400 });
	}
}

// DELETE: /api/admin/categories/[id] - delete a category
export async function DELETE(req, { params }) {
	try {
		const { id } = params;
		if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
		await prisma.category.delete({ where: { id } });
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 400 });
	}
}
