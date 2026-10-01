export const CONSULTATION_TYPES=["人生藍圖解析","黃金流年藍圖解析","關係藍圖解析","親子藍圖解析","合作藍圖解析"];
export const INTERNAL_TERMS=["完整數字計算","父親基因","母親基因","坐鎮碼","主性格","內心碼","潛意識碼","缺失數","挑戰數","679綜合","81組聯合碼","三階段能量","Josephine 諮詢話術"];
export function createCustomer(form){
  const day=String(form.day).padStart(2,"0"),month=String(form.month).padStart(2,"0");
  return{
    id:globalThis.crypto?.randomUUID?.()??`customer-${Date.now()}`,
    name:form.name.trim(),
    gender:form.gender,
    birthday:`${day}/${month}/${form.year}`,
    calendarType:form.calendarType||"阳历",
    birthTime:(form.birthTime||"").trim(),
    birthCity:(form.birthCity||"").trim(),
    consultationTheme:(form.consultationTheme||"").trim(),
    consultationType:form.consultationType,
    createdAt:new Date().toISOString(),
    status:"準備中"
  }
}
export function validateCustomer(form){if(!form.name?.trim()||!form.gender||!form.day||!form.month||!form.year||!form.consultationType)return"請完成所有必填資料";const date=new Date(Number(form.year),Number(form.month)-1,Number(form.day));if(date.getFullYear()!==Number(form.year)||date.getMonth()!==Number(form.month)-1||date.getDate()!==Number(form.day))return"請輸入有效的生日日期";if(date>new Date())return"生日不能晚於今天";return""}
export function toCustomerReport(customer,confirmed={}){return{name:customer.name,gender:customer.gender,birthday:customer.birthday,consultationType:customer.consultationType,...confirmed}}