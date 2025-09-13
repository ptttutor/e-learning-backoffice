import { NextResponse } from 'next/server';
import { 
  sendEmailNotification, 
  sendPaymentSuccessNotification, 
  sendPaymentFailureNotification,
  sendPaymentPendingNotification 
} from '@/lib/email';

// POST - ทดสอบการส่ง email
export async function POST(request) {
  try {
    const { type, orderId } = await request.json();

    if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
      return NextResponse.json({
        success: false,
        error: 'Email configuration not found. Please set EMAIL_USER and ADMIN_EMAIL environment variables.'
      }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'success':
        // ทดสอบ email การชำระเงินสำเร็จ
        const mockSuccessPayment = {
          id: 'test-payment-1',
          amount: 1200, // ราคาหลังหักส่วนลด
          method: 'BANK_TRANSFER',
          status: 'COMPLETED',
          confidence: 95,
          adminNotes: 'ทดสอบระบบ email notification',
          paidAt: new Date(),
          updatedAt: new Date()
        };

        const mockSuccessOrder = {
          id: orderId || 'test-order-1',
          subtotal: 1500, // ราคาเต็ม
          shippingFee: 0,
          couponDiscount: 300, // ส่วนลด
          total: 1200, // ราคาสุดท้าย
          couponCode: 'SAVE20',
          course: {
            title: 'คอร์สฟิสิกส์ ม.ปลาย - ทดสอบระบบ'
          },
          coupon: {
            name: 'ส่วนลดพิเศษ 20%',
            type: 'PERCENTAGE',
            value: 20
          }
        };

        const mockSuccessUser = {
          name: 'นาย ทดสอบ ระบบ',
          email: 'test@example.com'
        };

        result = await sendPaymentSuccessNotification(mockSuccessPayment, mockSuccessOrder, mockSuccessUser);
        break;

      case 'failure':
        // ทดสอบ email การชำระเงินไม่สำเร็จ
        const mockFailurePayment = {
          id: 'test-payment-2',
          amount: 1050, // ราคาหลังหักส่วนลด
          method: 'BANK_TRANSFER',
          status: 'REJECTED',
          confidence: 25,
          adminNotes: 'หลักฐานการโอนเงินไม่ชัดเจน',
          updatedAt: new Date()
        };

        const mockFailureOrder = {
          id: orderId || 'test-order-2',
          subtotal: 1200, // ราคาเต็ม
          shippingFee: 50,
          couponDiscount: 200, // ส่วนลด
          total: 1050, // ราคาสุดท้าย
          couponCode: 'NEWUSER200',
          ebook: {
            title: 'E-book ฟิสิกส์พื้นฐาน - ทดสอบระบบ'
          },
          coupon: {
            name: 'ส่วนลดสมาชิกใหม่',
            type: 'FIXED_AMOUNT',
            value: 200
          }
        };

        const mockFailureUser = {
          name: 'นาง ทดสอบ การปฏิเสธ',
          email: 'test-reject@example.com'
        };

        result = await sendPaymentFailureNotification(
          mockFailurePayment, 
          mockFailureOrder, 
          mockFailureUser,
          'หลักฐานการโอนเงินไม่ชัดเจน หรือจำนวนเงินไม่ตรงกับที่ระบุ'
        );
        break;

      case 'pending':
        // ทดสอบ email รอการตรวจสอบ
        const mockPendingPayment = {
          id: 'test-payment-3',
          amount: 850, // ราคาหลังหักส่วนลด
          method: 'BANK_TRANSFER',
          status: 'PENDING_VERIFICATION',
          slipUrl: 'https://example.com/slip.jpg',
          uploadedAt: new Date(),
          notes: 'รอการตรวจสอบ slip โดย admin'
        };

        const mockPendingOrder = {
          id: orderId || 'test-order-3',
          subtotal: 1000, // ราคาเต็ม
          shippingFee: 0,
          couponDiscount: 150, // ส่วนลด
          total: 850, // ราคาสุดท้าย
          couponCode: 'SAVE15',
          course: {
            title: 'คอร์สเคมี ม.ปลาย - ทดสอบระบบ'
          },
          coupon: {
            name: 'ส่วนลดนักเรียน 15%',
            type: 'PERCENTAGE',
            value: 15
          }
        };

        const mockPendingUser = {
          name: 'นางสาว ทดสอบ รอตรวจสอบ',
          email: 'test-pending@example.com'
        };

        result = await sendPaymentPendingNotification(
          mockPendingPayment, 
          mockPendingOrder, 
          mockPendingUser,
          75 // confidence score
        );
        break;

      case 'custom':
        // ทดสอบ email แบบกำหนดเอง
        const customHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; }
              .footer { background-color: #6c757d; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>🧪 ทดสอบระบบ Email</h2>
              </div>
              <div class="content">
                <h3>การทดสอบการส่ง Email สำเร็จ!</h3>
                <p>หากคุณได้รับ email นี้ แสดงว่าระบบ email notification ทำงานได้ถูกต้อง</p>
                <p><strong>เวลาที่ทดสอบ:</strong> ${new Date().toLocaleString('th-TH')}</p>
                <p><strong>การกำหนดค่า:</strong></p>
                <ul>
                  <li>Email User: ${process.env.EMAIL_USER}</li>
                  <li>Admin Email: ${process.env.ADMIN_EMAIL}</li>
                </ul>
              </div>
              <div class="footer">
                <p>ระบบ E-Learning - ฟิสิกส์พี่เต้ย</p>
              </div>
            </div>
          </body>
          </html>
        `;

        result = await sendEmailNotification(
          process.env.ADMIN_EMAIL,
          '🧪 ทดสอบระบบ Email Notification',
          customHtml
        );
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test type. Use: success, failure, or custom'
        }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
        config: {
          emailUser: process.env.EMAIL_USER,
          adminEmail: process.env.ADMIN_EMAIL
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send email',
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error testing email:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// GET - ตรวจสอบการกำหนดค่า email
export async function GET() {
  const config = {
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPassword: !!process.env.EMAIL_PASSWORD,
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    emailUser: process.env.EMAIL_USER ? '***@' + process.env.EMAIL_USER.split('@')[1] : null,
    adminEmail: process.env.ADMIN_EMAIL ? '***@' + process.env.ADMIN_EMAIL.split('@')[1] : null
  };

  return NextResponse.json({
    success: true,
    configured: config.hasEmailUser && config.hasEmailPassword && config.hasAdminEmail,
    config
  });
}
