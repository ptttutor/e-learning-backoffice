/**
 * SlipOK API Integration - Fixed Version
 * ใช้สำหรับตรวจสอบสลิปการโอนเงิน
 */

import FormData from 'form-data';

const SLIPOK_API_URL = 'https://api.slipok.com/v1/verify';

/**
 * Verify slip using SlipOK API with file upload
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<Object>} Verification result
 */
export const verifySlipWithSlipOK = async (fileBuffer, fileName, mimeType) => {
  try {
    // Check if API key is configured
    if (!process.env.SLIPOK_API_KEY) {
      throw new Error('SlipOK API key not configured');
    }

    console.log('🔍 Calling SlipOK API with file:', fileName, `(${fileBuffer.length} bytes)`);

    // Validate input parameters
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Empty file buffer');
    }

    if (!fileName || !mimeType) {
      throw new Error('Missing fileName or mimeType');
    }

    // Method 1: Try with axios (more reliable for file uploads)
    try {
      const axios = require('axios');
      
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: mimeType
      });
      formData.append('checkDuplicate', 'false');

      console.log('📤 Trying axios method...');
      
      const axiosResponse = await axios.post(SLIPOK_API_URL, formData, {
        headers: {
          'Authorization': `Bearer ${process.env.SLIPOK_API_KEY}`,
          ...formData.getHeaders()
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log('✅ Axios success:', axiosResponse.status);
      
      const result = axiosResponse.data;
      
      if (result.success === true || result.status === 200 || result.statusCode === 200) {
        return {
          success: true,
          data: result.data || result,
          message: result.message || 'Slip verification successful'
        };
      } else {
        return {
          success: false,
          error: result.message || result.error || 'Unknown error from SlipOK API',
          data: result.data || null
        };
      }
      
    } catch (axiosError) {
      console.log('⚠️ Axios failed, trying fetch method...', axiosError.message);
    }

    // Method 2: Try with manual stream approach
    const { Readable } = require('stream');
    
    console.log('📤 Trying manual stream method...');
    
    // Create boundary manually
    const boundary = `----formdata-slipok-${Date.now()}${Math.random()}`;
    
    // Build multipart form data manually
    const formParts = [];
    
    // Add file part
    formParts.push(`--${boundary}\r\n`);
    formParts.push(`Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`);
    formParts.push(`Content-Type: ${mimeType}\r\n\r\n`);
    
    // Add checkDuplicate part
    const fileEndBoundary = `\r\n--${boundary}\r\n`;
    formParts.push(fileEndBoundary);
    formParts.push(`Content-Disposition: form-data; name="checkDuplicate"\r\n\r\n`);
    formParts.push(`false\r\n--${boundary}--\r\n`);
    
    // Calculate total length
    const textParts = formParts.join('');
    const textBuffer = Buffer.from(textParts, 'utf8');
    const totalLength = textBuffer.length + fileBuffer.length;
    
    console.log('📏 Total content length:', totalLength);
    
    // Create final buffer
    const finalBuffer = Buffer.concat([
      Buffer.from(formParts.slice(0, 3).join(''), 'utf8'),
      fileBuffer,
      Buffer.from(formParts.slice(3).join(''), 'utf8')
    ]);
    
    const response = await fetch(SLIPOK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SLIPOK_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': finalBuffer.length.toString()
      },
      body: finalBuffer,
      timeout: 30000
    });

    console.log('📡 Manual method response status:', response.status);

    const responseText = await response.text();
    console.log('📄 Response text:', responseText);

    if (!response.ok) {
      console.error('❌ SlipOK API Error:', response.status, responseText);
      throw new Error(`SlipOK API error: ${response.status} - ${responseText}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error(`Failed to parse response: ${parseError.message}`);
    }

    console.log('✅ SlipOK API Success:', JSON.stringify(result, null, 2));

    if (result.success === true || result.status === 200 || result.statusCode === 200) {
      return {
        success: true,
        data: result.data || result,
        message: result.message || 'Slip verification successful'
      };
    } else {
      return {
        success: false,
        error: result.message || result.error || 'Unknown error from SlipOK API',
        data: result.data || null
      };
    }

  } catch (error) {
    console.error('❌ SlipOK verification error:', error);

    return {
      success: false,
      error: error.message,
      data: null,
      details: {
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Simple and reliable version using base64 encoding
 */
export const verifySlipWithSlipOKSimple = async (fileBuffer, fileName, mimeType) => {
  try {
    if (!process.env.SLIPOK_API_KEY) {
      throw new Error('SlipOK API key not configured');
    }

    console.log('🔍 Calling SlipOK API (Simple Method):', fileName, `(${fileBuffer.length} bytes)`);

    // Convert to base64
    const base64File = fileBuffer.toString('base64');
    
    const payload = {
      file: base64File,
      fileName: fileName,
      mimeType: mimeType,
      checkDuplicate: false
    };

    const response = await fetch(SLIPOK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SLIPOK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('📡 Response:', response.status, responseText);

    if (!response.ok) {
      throw new Error(`SlipOK API error: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    
    return {
      success: result.success === true || result.status === 200,
      data: result.data || result,
      message: result.message || 'Verification completed'
    };

  } catch (error) {
    console.error('❌ Simple method error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Alternative using form-data with proper stream handling
 */
export const verifySlipWithSlipOKBrowser = async (file) => {
  try {
    if (!process.env.SLIPOK_API_KEY) {
      throw new Error('SlipOK API key not configured');
    }

    console.log('🔍 Calling SlipOK API with file:', file.name, `(${file.size} bytes)`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('checkDuplicate', 'false');

    const response = await fetch(SLIPOK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SLIPOK_API_KEY}`
        // Don't set Content-Type header, let browser set it with boundary
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('📡 Response:', response.status, responseText);

    if (!response.ok) {
      throw new Error(`SlipOK API error: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    
    return {
      success: result.success === true || result.status === 200,
      data: result.data || result,
      message: result.message || 'Verification completed'
    };

  } catch (error) {
    console.error('❌ SlipOK verification error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Parse SlipOK result to extract useful information
 * @param {Object} slipResult - Result from SlipOK API
 * @returns {Object} Parsed slip information
 */
export const parseSlipResult = (slipResult) => {
  try {
    console.log('🔍 Parsing SlipOK result:', JSON.stringify(slipResult, null, 2));

    if (!slipResult.success) {
      const errorMessage = slipResult.message || slipResult.error || 'ไม่สามารถอ่านสลิปได้';
      console.log('❌ SlipOK failed:', errorMessage);

      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }

    const data = slipResult.data;
    
    if (!data) {
      return {
        success: false,
        error: 'ไม่พบข้อมูลในผลลัพธ์จาก SlipOK',
        data: null
      };
    }

    // Parse SlipOK API response format with more robust field mapping
    const parsedData = {
      // ข้อมูลพื้นฐาน
      amount: parseFloat(data.amount || data.total || data.transferAmount || 0) || null,
      date: data.date || data.transDate || data.transferDate || data.transactionDate || null,
      time: data.time || data.transTime || data.transferTime || data.transactionTime || null,

      // ข้อมูลผู้โอน
      senderAccount: data.sender?.account || data.fromAccount || data.senderAccount || null,
      senderName: data.sender?.name || data.fromName || data.senderName || null,
      senderBank: data.sender?.bank || data.fromBank || data.senderBank || null,

      // ข้อมูลผู้รับ
      receiverAccount: data.receiver?.account || data.toAccount || data.receiverAccount || null,
      receiverName: data.receiver?.name || data.toName || data.receiverName || null,
      receiverBank: data.receiver?.bank || data.toBank || data.receiverBank || null,

      // ข้อมูลเพิ่มเติม
      transactionRef: data.ref || data.ref1 || data.transactionId || data.refNo || null,
      confidenceScore: parseFloat(data.confidence || data.score || 0) || null,
      
      // Raw data for debugging
      rawData: data
    };

    console.log('✅ Parsed SlipOK data:', parsedData);

    return {
      success: true,
      data: parsedData,
      message: 'Slip parsed successfully'
    };

  } catch (error) {
    console.error('❌ Error parsing SlipOK result:', error);
    return {
      success: false,
      error: 'Error parsing slip data: ' + error.message,
      data: null
    };
  }
};

/**
 * Validate slip data against order information
 * @param {Object} slipData - Parsed slip data
 * @param {Object} orderData - Order information
 * @returns {Object} Validation result
 */
export const validateSlipData = (slipData, orderData) => {
  const validations = [];
  const warnings = [];
  
  try {
    // ตรวจสอบจำนวนเงิน
    if (slipData.amount && slipData.amount > 0) {
      const slipAmount = parseFloat(slipData.amount);
      const orderAmount = parseFloat(orderData.total);
      
      // เพิ่ม tolerance สำหรับค่าธรรมเนียม
      const tolerance = Math.max(1, orderAmount * 0.01); // 1 บาท หรือ 1% ของยอดรวม
      
      if (Math.abs(slipAmount - orderAmount) <= tolerance) {
        validations.push({
          type: 'amount',
          status: 'pass',
          message: `จำนวนเงินถูกต้อง: ${slipAmount} บาท`
        });
      } else if (slipAmount > orderAmount) {
        validations.push({
          type: 'amount',
          status: 'warning',
          message: `จำนวนเงินมากกว่าที่ต้องชำระ: สลิป ${slipAmount} บาท, คำสั่งซื้อ ${orderAmount} บาท`
        });
      } else {
        validations.push({
          type: 'amount',
          status: 'fail',
          message: `จำนวนเงินน้อยกว่าที่ต้องชำระ: สลิป ${slipAmount} บาท, คำสั่งซื้อ ${orderAmount} บาท`
        });
      }
    } else {
      warnings.push({
        type: 'amount',
        message: 'ไม่สามารถอ่านจำนวนเงินจากสลิปได้'
      });
    }
    
    // ตรวจสอบวันที่
    if (slipData.date) {
      try {
        const slipDate = new Date(slipData.date);
        const orderDate = new Date(orderData.createdAt);
        const today = new Date();
        
        const daysDiffFromOrder = Math.abs((slipDate - orderDate) / (1000 * 60 * 60 * 24));
        const daysDiffFromToday = Math.abs((slipDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysDiffFromOrder <= 7 && daysDiffFromToday <= 1) {
          validations.push({
            type: 'date',
            status: 'pass',
            message: `วันที่โอนเงิน: ${slipData.date}`
          });
        } else if (daysDiffFromToday > 1) {
          validations.push({
            type: 'date',
            status: 'warning',
            message: `สลิปมีอายุ ${Math.round(daysDiffFromToday)} วัน (อาจเป็นสลิปเก่า)`
          });
        } else {
          validations.push({
            type: 'date',
            status: 'warning',
            message: `วันที่โอนเงินห่างจากวันสั่งซื้อ ${Math.round(daysDiffFromOrder)} วัน`
          });
        }
      } catch (dateError) {
        warnings.push({
          type: 'date',
          message: 'รูปแบบวันที่ไม่ถูกต้อง: ' + slipData.date
        });
      }
    } else {
      warnings.push({
        type: 'date',
        message: 'ไม่สามารถอ่านวันที่จากสลิปได้'
      });
    }
    
    // ตรวจสอบบัญชีปลายทาง
    if (slipData.receiverAccount && orderData.bankAccount) {
      // เอาเฉพาะตัวเลข เพื่อเปรียบเทียบ
      const slipAccount = slipData.receiverAccount.replace(/\D/g, '');
      const orderAccount = orderData.bankAccount.replace(/\D/g, '');
      
      if (slipAccount === orderAccount) {
        validations.push({
          type: 'account',
          status: 'pass',
          message: `บัญชีปลายทางถูกต้อง: ${slipData.receiverAccount}`
        });
      } else {
        validations.push({
          type: 'account',
          status: 'fail',
          message: `บัญชีปลายทางไม่ถูกต้อง: สลิป ${slipData.receiverAccount}, ระบบ ${orderData.bankAccount}`
        });
      }
    } else if (orderData.bankAccount) {
      warnings.push({
        type: 'account',
        message: 'ไม่สามารถอ่านบัญชีปลายทางจากสลิปได้'
      });
    }
    
    // ตรวจสอบ confidence score
    if (slipData.confidenceScore !== null && slipData.confidenceScore < 0.8) {
      warnings.push({
        type: 'confidence',
        message: `ความเชื่อมั่นในการอ่านสลิปต่ำ: ${Math.round(slipData.confidenceScore * 100)}%`
      });
    }
    
    return {
      success: true,
      validations,
      warnings,
      summary: {
        totalChecks: validations.length,
        passed: validations.filter(v => v.status === 'pass').length,
        failed: validations.filter(v => v.status === 'fail').length,
        warnings: validations.filter(v => v.status === 'warning').length + warnings.length
      }
    };
    
  } catch (error) {
    console.error('Error validating slip data:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการตรวจสอบสลิป: ' + error.message,
      validations: [],
      warnings: []
    };
  }
};