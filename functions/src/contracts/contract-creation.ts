// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：合約建立與 PDF 上傳的完整流程
// 用途：將合約建立邏輯從 Client 端移至 Server 端，提升安全性與一致性

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';


interface ContractCreationInput {
  contractData: {
    orderNo: string;
    projectNo: string;
    projectName: string;
    client: string;
    contractAmount: number;
    members: Array<{
      name: string;
      role: string;
    }>;
  };
  pdfFile?: {
    name: string;
    type: string;
    size: number;
    base64Data: string;
  };
}



export const createContract = onCall<ContractCreationInput>(async (request) => {
  try {
    const { contractData, pdfFile } = request.data;
    
    if (!request.auth) {
      return { success: false, error: '未授權' };
    }

    const db = getFirestore();
    const storage = getStorage();

    // 1. 驗證合約資料
    const validationErrors: string[] = [];
    
    if (!contractData.client?.trim()) {
      validationErrors.push('客戶名稱為必填欄位');
    }
    if (!contractData.projectName?.trim()) {
      validationErrors.push('專案名稱為必填欄位');
    }
    if (!contractData.contractAmount || contractData.contractAmount <= 0) {
      validationErrors.push('合約金額必須大於 0');
    }
    if (!contractData.orderNo?.trim()) {
      validationErrors.push('訂單編號為必填欄位');
    }
    if (!contractData.projectNo?.trim()) {
      validationErrors.push('專案編號為必填欄位');
    }

    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(', ') };
    }

    // 2. 生成合約流水號
    const contractsRef = db.collection('contracts');
    const snapshot = await contractsRef.orderBy('code', 'desc').limit(1).get();

    let nextNumber = 1;
    if (!snapshot.empty) {
      const lastCode = snapshot.docs[0].data().code;
      const lastNumber = parseInt(lastCode.substring(1));
      nextNumber = lastNumber + 1;
    }
    const contractCode = `C${String(nextNumber).padStart(3, '0')}`;

    // 3. 檢查合約編號唯一性
    const existingContract = await contractsRef.where('code', '==', contractCode).get();
    if (!existingContract.empty) {
      return { success: false, error: '合約編號已存在' };
    }

    // 4. 處理 PDF 上傳
    let pdfUrl = '';
    if (pdfFile) {
      try {
        // 驗證檔案類型
        if (pdfFile.type !== 'application/pdf') {
          return { success: false, error: '只支援 PDF 檔案格式' };
        }

        // 驗證檔案大小 (限制 10MB)
        if (pdfFile.size > 10 * 1024 * 1024) {
          return { success: false, error: 'PDF 檔案大小不能超過 10MB' };
        }

        // 解碼 base64 資料
        const buffer = Buffer.from(pdfFile.base64Data, 'base64');
        
        // 上傳到 Firebase Storage
        const bucket = storage.bucket();
        const fileName = `contracts/${contractCode}/${pdfFile.name}`;
        const file = bucket.file(fileName);
        
        await file.save(buffer, {
          metadata: {
            contentType: 'application/pdf',
            metadata: {
              contractCode,
              uploadedBy: request.auth.uid,
              uploadedAt: new Date().toISOString()
            }
          }
        });

        // 取得下載 URL
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500' // 長期有效
        });
        
        pdfUrl = url;
      } catch (error) {
        console.error('PDF 上傳失敗:', error);
        return { success: false, error: 'PDF 上傳失敗' };
      }
    }

    // 5. 建立合約記錄
    const contractRecord = {
      code: contractCode,
      orderNo: contractData.orderNo.trim(),
      projectNo: contractData.projectNo.trim(),
      projectName: contractData.projectName.trim(),
      client: contractData.client.trim(),
      contractAmount: contractData.contractAmount,
      members: contractData.members.filter(m => m.name.trim()),
      url: pdfUrl,
      status: '進行中',
      pendingPercent: 100,
      invoicedAmount: 0,
      paymentRound: 0,
      paymentPercent: 0,
      paymentStatus: '草稿',
      invoiceStatus: '未開票',
      payments: [],
      changes: [],
      tags: [],
      createdBy: request.auth.uid,
      createdAt: new Date(),
      lastModified: new Date()
    };

    const docRef = await contractsRef.add(contractRecord);

    return {
      success: true,
      contractId: docRef.id,
      contractCode,
      pdfUrl
    };

  } catch (error) {
    console.error('建立合約失敗:', error);
    return { success: false, error: (error as Error).message };
  }
}); 