// 本檔案為合約分析工具函式集
// 功能：計算合約進度、狀態百分比、事件日誌、金額變更等
// 用途：供服務與元件共用的純函數分析邏輯
import type { Contract, PaymentRecord, ChangeRecord } from '../models';

// 進度摘要：回傳未開始、進行中、已完成的數量與百分比
export function getProgressSummary(contract: Contract): {
  notStarted: { count: number; percent: number };
  inProgress: { count: number; percent: number };
  completed: { count: number; percent: number };
} {
  if (!contract.payments || contract.payments.length === 0) {
    return {
      notStarted: { count: 1, percent: 100 },
      inProgress: { count: 0, percent: 0 },
      completed: { count: 0, percent: 0 }
    };
  }
  const totalAmount = contract.contractAmount;
  if (totalAmount <= 0) {
    return {
      notStarted: { count: 1, percent: 100 },
      inProgress: { count: 0, percent: 0 },
      completed: { count: 0, percent: 0 }
    };
  }
  const completedPayments = contract.payments.filter(p => p.status === '完成');
  const inProgressPayments = contract.payments.filter(p => p.status && !['完成', '已拒絕'].includes(p.status!));
  const completedAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const inProgressAmount = inProgressPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPaymentAmount = contract.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedPercent = Math.round((completedAmount / totalAmount) * 100);
  const inProgressPercent = Math.round((inProgressAmount / totalAmount) * 100);
  const notStartedPercent = Math.max(0, 100 - Math.round((totalPaymentAmount / totalAmount) * 100));
  const notStartedCount = notStartedPercent > 0 ? 1 : 0;
  return {
    notStarted: { count: notStartedCount, percent: notStartedPercent },
    inProgress: { count: inProgressPayments.length, percent: inProgressPercent },
    completed: { count: completedPayments.length, percent: completedPercent }
  };
}

// 各狀態百分比
export function getStatusPercent(contract: Contract, status: PaymentRecord['status']): number {
  if (!contract.payments || !contract.contractAmount) return 0;
  const total = contract.payments.filter(p => p.status === status).reduce((sum, p) => sum + (p.amount || 0), 0);
  return parseFloat(((total / contract.contractAmount) * 100).toFixed(2));
}

// 事件紀錄（變更、請款）
export function getEventLog(contract: Contract): string[] {
  const changeLogs = (contract.changes || []).map(c =>
    `[變更][${c.type}]${c.amount.toLocaleString()} 元` + (c.note ? ` [備註]：${c.note}` : '')
  );
  const paymentLogs = (contract.payments || []).map(p =>
    `第${p.round}次 [${p.status ?? '未知'}] 金額${p.percent}% 申請人${p.applicant}` +
    (p.date ? ` 日期${p.date.slice(0, 10)}` : '') +
    (p.note ? ` 備註${p.note}` : '')
  );
  return [...changeLogs, ...paymentLogs];
}

// 事件 Timeline
export function getEventTimeline(contract: Contract): { label: string; date: string }[] {
  const changeTimeline = (contract.changes || []).map(c => ({
    label: `[變更][${c.type}]${c.amount.toLocaleString()} 元` + (c.note ? ` [備註]：${c.note}` : ''),
    date: c.date
  }));
  const paymentTimeline = (contract.payments || []).map(p => ({
    label: `第${p.round}次 [${p.status ?? '未知'}] 金額${p.percent}% 申請人${p.applicant}` + (p.note ? ` 備註${p.note}` : ''),
    date: p.date || ''
  }));
  return [...changeTimeline, ...paymentTimeline].sort((a, b) => a.date.localeCompare(b.date));
}

// 合約淨變更額（追加正、追減負）
export function getNetChange(contract: Contract): number {
  return (contract.changes ?? []).reduce((sum, c) => sum + (c.type === '追加' ? c.amount : -c.amount), 0);
}

// 原始合約金額（現行金額扣除淨變更）
export function getOriginalAmount(contract: Contract): number {
  return contract.contractAmount - getNetChange(contract);
}