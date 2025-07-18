// 本檔案依據 Firebase Console 專案設定，使用 Firebase Admin SDK
// 功能：合約建立與 PDF 上傳的完整流程
// 用途：將合約建立邏輯從 Client 端移至 Server 端，提升安全性與一致性

import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { withErrorHandling } from './error-handler';
import { checkAuth, generateContractCode } from './utils';

interface ContractCreationInput {
  contractData: {
    orderNo: string;
    projectNo: string;
    projectName: string;
    client: string;
    contractAmount: number;
    members: Array<{ name: string; role: string; }>;
  };
  pdfFile?: {
    name: string;
    type: string;
    size: number;
    base64Data: string;
  };
}

const validateContractData = (data: ContractCreationInput['contractData']) => {
  const errors: string[] = [];
  
  if (!data.client?.trim()) errors.push('客戶名稱為必填欄位');
  if (!data.projectName?.trim()) errors.push('專案名稱為必填欄位');
  if (!data.contractAmount || data.contractAmount <= 0) errors.push('合約金額必須大於 0');
  if (!data.orderNo?.trim()) errors.push('訂單編號為必填欄位');
  if (!data.projectNo?.trim()) errors.push('專案編號為必填欄位');
  
  if (errors.length > 0) throw new Error(errors.join(', '));
};

const uploadPdfFile = async (pdfFile: NonNullable<ContractCreationInput['pdfFile']>, contractCode: string, userId: string) => {
  if (pdfFile.type !== 'application/pdf') throw new Error('只支援 PDF 檔案格式');
  if (pdfFile.size > 10 * 1024 * 1024) throw new Error('PDF 檔案大小不能超過 10MB');

  const storage = getStorage();
  const bucket = storage.bucket();
  const fileName = `contracts/${contractCode}/${pdfFile.name}`;
  const file = bucket.file(fileName);
  
  const buffer = Buffer.from(pdfFile.base64Data, 'base64');
  await file.save(buffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: { contractCode, uploadedBy: userId, uploadedAt: new Date().toISOString() }
    }
  });

  const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' });
  return url;
};

export const createContract = withErrorHandling(async (request) => {
  const { contractData, pdfFile } = request.data;
  const auth = checkAuth(request);
  
  validateContractData(contractData);
  
  const db = getFirestore();
  const contractCode = await generateContractCode();
  
  // 檢查合約編號唯一性
  const existingContract = await db.collection('contracts').where('code', '==', contractCode).get();
  if (!existingContract.empty) throw new Error('合約編號已存在');
  
  // 處理 PDF 上傳
  let pdfUrl = '';
  if (pdfFile) {
    pdfUrl = await uploadPdfFile(pdfFile, contractCode, auth.uid);
  }
  
  // 建立合約記錄
  const contractRecord = {
    code: contractCode,
    orderNo: contractData.orderNo.trim(),
    projectNo: contractData.projectNo.trim(),
    projectName: contractData.projectName.trim(),
    client: contractData.client.trim(),
    contractAmount: contractData.contractAmount,
    members: contractData.members.filter((m: { name: string; role: string }) => m.name.trim()),
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
    createdBy: auth.uid,
    createdAt: new Date(),
    lastModified: new Date()
  };

  const docRef = await db.collection('contracts').add(contractRecord);
  
  return {
    contractId: docRef.id,
    contractCode,
    pdfUrl
  };
}); 