/**
 * Simplified EasySlip API Integration
 * ใช้ form-data แทน URL
 */

const EASYSLIP_API_URL = "https://developer.easyslip.com/api/v1/verify";

/**
 * Verify slip using EasySlip API with file upload
 * @param {File|Buffer} file - File object หรือ Buffer
 * @returns {Promise<Object>} Verification result
 */
export const verifySlipWithEasySlip = async (file) => {
  try {
    // Check if API key is configured
    if (!process.env.EASYSLIP_API_KEY) {
      console.error("❌ EasySlip API key not configured");
      return {
        success: false,
        error: "EasySlip API key not configured",
        provider: "easyslip"
      };
    }

    console.log("🔍 Calling EasySlip API with file upload");

    // Validate input
    if (!file) {
      return {
        success: false,
        error: "File is required",
        provider: "easyslip"
      };
    }

    // Create FormData for file upload
    const formData = new FormData();
    
    // Handle different file types
    if (file instanceof File) {
      // Browser File object
      formData.append('file', file);
      console.log("📤 Uploading browser File:", file.name, file.size);
    } else if (Buffer.isBuffer(file) || file instanceof Uint8Array) {
      // Server-side Buffer
      const blob = new Blob([file], { type: 'image/jpeg' });
      formData.append('file', blob, 'slip.jpg');
      console.log("📤 Uploading buffer:", file.length, "bytes");
    } else if (file.arrayBuffer && typeof file.arrayBuffer === 'function') {
      // File-like object with arrayBuffer method
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], { type: file.type || 'image/jpeg' });
      formData.append('file', blob, file.name || 'slip.jpg');
      console.log("📤 Uploading file-like object:", buffer.byteLength, "bytes");
    } else {
      return {
        success: false,
        error: "Unsupported file type",
        provider: "easyslip"
      };
    }

    const response = await fetch(EASYSLIP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.EASYSLIP_API_KEY}`,
        // Don't set Content-Type header - let browser set it with boundary
      },
      body: formData,
      timeout: 30000, // 30 seconds timeout
    });

    const responseText = await response.text();
    console.log("📡 EasySlip Response Status:", response.status);
    console.log("📄 EasySlip Response:", responseText);

    if (!response.ok) {
      console.error("❌ EasySlip API Error:", response.status, responseText);
      
      // Parse error response if possible
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (parseError) {
        // Use raw text if JSON parsing fails
        errorMessage = responseText || errorMessage;
      }

      return {
        success: false,
        error: `EasySlip API error: ${errorMessage}`,
        provider: "easyslip",
        statusCode: response.status
      };
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return {
        success: false,
        error: "Failed to parse EasySlip response",
        provider: "easyslip"
      };
    }

    console.log("✅ EasySlip API Response:", result);

    // Check if the response indicates success
    if (result.status === 200 && result.data) {
      console.log("✅ EasySlip verification successful");
      
      // Parse and normalize the data based on the new response format
      const data = result.data;
      const normalizedData = {
        amount: data.amount?.local?.amount || data.amount?.amount || null,
        transDate: data.date ? new Date(data.date).toISOString().split('T')[0] : null,
        transTime: data.date ? new Date(data.date).toTimeString().split(' ')[0] : null,
        sender: {
          account: data.sender?.account?.bank?.account || null,
          name: data.sender?.account?.name?.th || data.sender?.account?.name?.en || null,
          bank: data.sender?.bank?.short || data.sender?.bank?.name || null
        },
        receiver: {
          account: data.receiver?.account?.bank?.account || null,
          name: data.receiver?.account?.name?.th || data.receiver?.account?.name?.en || null,
          bank: data.receiver?.bank?.short || data.receiver?.bank?.name || null
        },
        ref: data.transRef || data.ref1 || data.ref2 || null,
        confidence: 1.0, // EasySlip usually has high confidence when successful
        // Keep original data for debugging
        raw: data
      };

      return {
        success: true,
        data: normalizedData,
        provider: "easyslip",
        message: "Slip verification successful"
      };
    } else {
      console.error("❌ EasySlip verification failed:", result);
      
      const errorMessage = result.message || result.error || "การตรวจสอบ slip ไม่สำเร็จ";
      
      return {
        success: false,
        error: errorMessage,
        provider: "easyslip",
        statusCode: result.status || null,
        data: result.data || null
      };
    }

  } catch (error) {
    console.error("❌ EasySlip API Error:", error);
    
    // Handle different types of errors
    let errorMessage = "เกิดข้อผิดพลาดในการเรียก EasySlip API";
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = "ไม่สามารถเชื่อมต่อกับ EasySlip API ได้";
    } else if (error.name === 'AbortError') {
      errorMessage = "EasySlip API timeout";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      provider: "easyslip",
      details: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };
  }
};

/**
 * Calculate confidence score based on slip verification result
 * @param {Object} verificationResult - Result from EasySlip
 * @param {Object} orderData - Order information to compare against
 * @returns {Object} Confidence calculation result
 */
export const calculateSlipConfidence = (verificationResult, orderData) => {
  if (!verificationResult.success || !verificationResult.data) {
    return {
      score: 0,
      details: {
        amount: { match: false, score: 0, message: "ไม่สามารถตรวจสอบจำนวนเงินได้" },
        date: { match: false, score: 0, message: "ไม่สามารถตรวจสอบวันที่ได้" },
        bank: { match: false, score: 0, message: "ไม่สามารถตรวจสอบธนาคารได้" },
        account: { match: false, score: 0, message: "ไม่สามารถตรวจสอบบัญชีได้" }
      },
      shouldAutoApprove: false,
      message: "ไม่สามารถตรวจสอบอัตโนมัติได้"
    };
  }

  const slipData = verificationResult.data;
  let totalScore = 0;
  const details = {};

  // ตรวจสอบจำนวนเงิน (30 คะแนน)
  if (slipData.amount && orderData.total) {
    const amountDiff = Math.abs(slipData.amount - orderData.total);
    const tolerance = Math.max(1, orderData.total * 0.01); // 1 บาท หรือ 1%
    
    if (amountDiff <= tolerance) {
      details.amount = {
        match: true,
        score: 30,
        message: `จำนวนเงินตรงกัน: ${slipData.amount} บาท`
      };
      totalScore += 30;
    } else {
      details.amount = {
        match: false,
        score: 0,
        message: `จำนวนเงินไม่ตรงกัน: สลิป ${slipData.amount} บาท, ต้องชำระ ${orderData.total} บาท`
      };
    }
  } else {
    details.amount = {
      match: false,
      score: 0,
      message: "ไม่สามารถอ่านจำนวนเงินจากสลิปได้"
    };
  }

  // ตรวจสอบวันที่ (25 คะแนน)
  if (slipData.transDate && orderData.createdAt) {
    try {
      const slipDate = new Date(slipData.transDate);
      const orderDate = new Date(orderData.createdAt);
      const daysDiff = Math.abs((slipDate - orderDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) {
        const score = Math.max(10, 25 - (daysDiff * 2)); // ลดคะแนนตามจำนวนวัน
        details.date = {
          match: true,
          score: score,
          message: `วันที่โอนภายในช่วงเวลาที่เหมาะสม (${Math.round(daysDiff)} วัน)`
        };
        totalScore += score;
      } else {
        details.date = {
          match: false,
          score: 0,
          message: `วันที่โอนห่างจากวันสั่งซื้อมากเกินไป (${Math.round(daysDiff)} วัน)`
        };
      }
    } catch (dateError) {
      details.date = {
        match: false,
        score: 0,
        message: "รูปแบบวันที่ไม่ถูกต้อง"
      };
    }
  } else {
    details.date = {
      match: false,
      score: 0,
      message: "ไม่สามารถอ่านวันที่จากสลิปได้"
    };
  }

  // ตรวจสอบบัญชีผู้รับ (35 คะแนน)
  const expectedAccount = {
    number: "107-889-8751",
    name: "นาย เชษฐา พวงบุบผา",
    bank: "KBANK" // รหัสธนาคารกสิกรไทย
  };

  const accountVerification = verifyReceiverAccount(slipData, expectedAccount);
  details.account = accountVerification;
  totalScore += accountVerification.score;

  // ตรวจสอบธนาคาร (10 คะแนน)
  if (slipData.sender?.bank || slipData.receiver?.bank) {
    details.bank = {
      match: true,
      score: 10,
      message: `พบข้อมูลธนาคาร: ${slipData.sender?.bank || ''} -> ${slipData.receiver?.bank || ''}`
    };
    totalScore += 10;
  } else {
    details.bank = {
      match: false,
      score: 0,
      message: "ไม่พบข้อมูลธนาคารในสลิป"
    };
  }

  // ตัดสินใจอนุมัติอัตโนมัติ
  const shouldAutoApprove = totalScore >= 80 && details.account.match;

  return {
    score: totalScore,
    details,
    shouldAutoApprove,
    message: shouldAutoApprove 
      ? `ผ่านการตรวจสอบอัตโนมัติ (${totalScore}/100)`
      : `ต้องตรวจสอบด้วยตนเอง (${totalScore}/100)`
  };
};

/**
 * Verify receiver's bank account information
 * @param {Object} slipData - Data extracted from slip
 * @param {Object} expectedAccount - Expected account information
 * @returns {Object} Verification result
 */
export const verifyReceiverAccount = (slipData, expectedAccount) => {
  const receiver = slipData.receiver;
  
  if (!receiver) {
    return {
      match: false,
      score: 0,
      message: "ไม่พบข้อมูลบัญชีผู้รับในสลิป"
    };
  }

  let score = 0;
  const checks = [];

  // ตรวจสอบเลขบัญชี (20 คะแนน)
  if (receiver.account) {
    // ลบเครื่องหมายขีดออกเพื่อเปรียบเทียบ
    const slipAccount = receiver.account.replace(/[-\s]/g, '');
    const expectedAccountNumber = expectedAccount.number.replace(/[-\s]/g, '');
    
    if (slipAccount === expectedAccountNumber) {
      score += 20;
      checks.push("✅ เลขบัญชีถูกต้อง");
    } else {
      checks.push(`❌ เลขบัญชีไม่ตรงกัน: พบ ${receiver.account}, ต้องการ ${expectedAccount.number}`);
    }
  } else {
    checks.push("❌ ไม่พบเลขบัญชีผู้รับ");
  }

  // ตรวจสอบชื่อบัญชี (10 คะแนน)
  if (receiver.name) {
    // ตรวจสอบความคล้ายคลึงของชื่อ (อาจมีการเขียนต่างกัน)
    const slipName = receiver.name.toLowerCase().replace(/\s+/g, '');
    const expectedName = expectedAccount.name.toLowerCase().replace(/\s+/g, '');
    
    if (slipName.includes('เชษฐา') || slipName.includes('พวงบุบผา') || 
        expectedName.includes(slipName) || slipName.includes(expectedName)) {
      score += 10;
      checks.push("✅ ชื่อบัญชีตรงกัน");
    } else {
      checks.push(`❌ ชื่อบัญชีไม่ตรงกัน: พบ ${receiver.name}, ต้องการ ${expectedAccount.name}`);
    }
  } else {
    checks.push("❌ ไม่พบชื่อบัญชีผู้รับ");
  }

  // ตรวจสอบธนาคาร (5 คะแนน)
  if (receiver.bank) {
    const bankCodes = ['KBANK', 'กสิกรไทย', 'กสิกร', 'KASIKORN'];
    const slipBank = receiver.bank.toUpperCase();
    
    if (bankCodes.some(code => slipBank.includes(code.toUpperCase()))) {
      score += 5;
      checks.push("✅ ธนาคารถูกต้อง (กสิกรไทย)");
    } else {
      checks.push(`❌ ธนาคารไม่ถูกต้อง: พบ ${receiver.bank}, ต้องการกสิกรไทย`);
    }
  } else {
    checks.push("❌ ไม่พบข้อมูลธนาคารผู้รับ");
  }

  return {
    match: score >= 30, // ต้องผ่านอย่างน้อย 30/35 คะแนน
    score: score,
    message: checks.join(', '),
    details: {
      found: {
        account: receiver.account || 'ไม่พบ',
        name: receiver.name || 'ไม่พบ',
        bank: receiver.bank || 'ไม่พบ'
      },
      expected: expectedAccount,
      checks: checks
    }
  };
};

/**
 * Check if account number matches expected receiver account
 * @param {string} accountNumber - Account number to check
 * @param {string} accountName - Account name to check (optional)
 * @returns {Object} Match result
 */
export const isExpectedReceiverAccount = (accountNumber, accountName = null) => {
  const expectedAccount = {
    number: "107-889-8751",
    name: "นาย เชษฐา พวงบุบผา",
    bank: "กสิกรไทย"
  };

  // ลบเครื่องหมายขีดออกเพื่อเปรียบเทียบ
  const cleanAccountNumber = accountNumber?.replace(/[-\s]/g, '') || '';
  const expectedCleanNumber = expectedAccount.number.replace(/[-\s]/g, '');

  const accountMatch = cleanAccountNumber === expectedCleanNumber;
  
  let nameMatch = true; // ถ้าไม่ส่งชื่อมา ถือว่าผ่าน
  if (accountName) {
    const cleanName = accountName.toLowerCase().replace(/\s+/g, '');
    nameMatch = cleanName.includes('เชษฐา') || cleanName.includes('พวงบุบผา');
  }

  return {
    isValid: accountMatch && nameMatch,
    accountMatch,
    nameMatch,
    expected: expectedAccount,
    message: accountMatch && nameMatch 
      ? "บัญชีถูกต้อง" 
      : !accountMatch 
        ? `เลขบัญชีไม่ถูกต้อง: ต้องการ ${expectedAccount.number}`
        : "ชื่อบัญชีไม่ถูกต้อง"
  };
};