import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateUniqueFilename, getFolderPath } from "@/lib/vercel-blob";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileName, fileType, examId } = body;

    console.log("Presigned URL request:", { fileName, fileType, examId });

    if (!fileName || !fileType || !examId) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ครบถ้วน (fileName, fileType, examId)" },
        { status: 400 }
      );
    }

    // สร้างชื่อไฟล์และ path
    const uniqueFilename = generateUniqueFilename(fileName, `exam_${examId}`);
    const folder = getFolderPath("exam");
    const key = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;

    console.log("Generated key:", key);

    // สร้าง presigned URL (valid 2 ชั่วโมง)
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 7200, // 2 hours
    });

    const publicUrl = `${process.env.R2_PUBLIC_DEV_URL}/${key}`;

    console.log("Generated URLs:", { uploadUrl: uploadUrl.substring(0, 50) + "...", publicUrl });

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "เกิดข้อผิดพลาดในการสร้าง URL",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}