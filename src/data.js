export const CONSULTATION_TYPES = [
  "人生藍圖解析", "黃金流年藍圖解析", "關係藍圖解析",
  "親子藍圖解析", "合作藍圖解析"
];

export const INTERNAL_TERMS = [
  "完整數字計算", "內部數字位置", "聯合碼", "缺失數字", "挑戰數",
  "內三角形/外三角形", "制約數", "原生家庭", "內部分析資料", "Josephine 諮詢話術"
];

export function createCustomer(form) {
  const day = String(form.day).padStart(2, "0");
  const month = String(form.month).padStart(2, "0");
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `customer-${Date.now()}`,
    name: form.name.trim(), gender: form.gender, birthday: `${day}/${month}/${form.year}`,
    consultationType: form.consultationType, createdAt: new Date().toISOString(), status: "準備中"
  };
}

export function validateCustomer(form) {
  if (!form.name?.trim() || !form.gender || !form.day || !form.month || !form.year || !form.consultationType) return "請完成所有必填資料";
  const date = new Date(Number(form.year), Number(form.month) - 1, Number(form.day));
  if (date.getFullYear() !== Number(form.year) || date.getMonth() !== Number(form.month) - 1 || date.getDate() !== Number(form.day)) return "請輸入有效的生日日期";
  if (date > new Date()) return "生日不能晚於今天";
  return "";
}

export function toCustomerReport(customer) {
  return { name: customer.name, consultationType: customer.consultationType, birthday: customer.birthday, summary: "顧客簡版報告尚待 Josephine 確認與發佈。" };
}
