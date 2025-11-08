# 把本地的 excel 檔案匯入到資料庫

import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import * as path from "path";
import * as os from "os";
import { promises as fs } from "fs";

const prisma = new PrismaClient();

// 解析日期字串 (yyyy/MM/dd) 轉為 Date
function parseDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr || dateStr === "" || dateStr === "-") return null;
  
  // 處理 Excel 日期數字格式
  if (typeof dateStr === "number") {
    // Excel 日期從 1900-01-01 開始計算
    const excelEpoch = new Date(1899, 11, 30);
    const days = dateStr;
    return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
  }
  
  // 處理字串格式 yyyy/MM/dd
  const dateMatch = String(dateStr).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (dateMatch) {
    const year = Number.parseInt(dateMatch[1]!, 10);
    const month = Number.parseInt(dateMatch[2]!, 10) - 1;
    const day = Number.parseInt(dateMatch[3]!, 10);
    return new Date(year, month, day);
  }
  
  return null;
}

// 解析百分比字串 (如 "18.83%") 轉為 Decimal
function parsePercentage(percentStr: string | undefined | null): number | null {
  if (!percentStr || percentStr === "" || percentStr === "-") return null;
  
  const str = String(percentStr).replace(/%/g, "").trim();
  const value = parseFloat(str);
  return isNaN(value) ? null : value;
}

// 解析碳足跡數值 (如 "11.00kg") 分離數值和單位
function parseCarbonFootprint(
  carbonStr: string | undefined | null
): { value: number; unit: string | null } {
  if (!carbonStr || carbonStr === "" || carbonStr === "-") {
    return { value: 0, unit: null };
  }
  
  const str = String(carbonStr).trim();
  // 嘗試提取數值
  const numberMatch = str.match(/^([\d.]+)/);
  if (numberMatch) {
    const value = parseFloat(numberMatch[1]!);
    // 提取單位（去除數值後的部分）
    const unit = str.replace(numberMatch[1]!, "").trim();
    return {
      value: isNaN(value) ? 0 : value,
      unit: unit || null,
    };
  }
  
  return { value: 0, unit: null };
}

// 清理字串（去除空白、處理空值）
function cleanString(value: any): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === "" || str === "-" ? null : str;
}

async function importCarbonLabels() {
  try {
    // 取得 Desktop 路徑
    const desktopPath = path.join(os.homedir(), "Desktop");
    const filePath = path.join(desktopPath, "碳標籤產品資訊.xlsx");
    
    console.log(`📂 讀取檔案: ${filePath}`);
    
    // 檢查檔案是否存在
    try {
      await fs.access(filePath);
    } catch {
      console.error(`❌ 檔案不存在: ${filePath}`);
      process.exit(1);
    }
    
    // 讀取 Excel 檔案
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      console.error("❌ Excel 工作表為空");
      process.exit(1);
    }
    
    // 轉換為 JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // 使用字串格式，方便處理日期
      defval: null, // 空值設為 null
    });
    
    console.log(`📊 找到 ${data.length} 筆資料`);
    
    // 清空現有資料
    await prisma.carbonLabel.deleteMany();
    console.log("🗑️  已清空現有資料");
    
    let successCount = 0;
    let errorCount = 0;
    
    // 處理每一筆資料
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as Record<string, any>;
      
      try {
        // 檢查必填欄位
        const productName = cleanString(row["產品名稱"]);
        if (!productName) {
          console.warn(`⚠️  第 ${i + 2} 行：缺少產品名稱，跳過`);
          errorCount++;
          continue;
        }
        
        // 解析碳足跡數據
        const carbonFootprint = parseCarbonFootprint(
          row["碳足跡數據"] || row["碳足跡"]
        );
        
        if (carbonFootprint.value === 0) {
          console.warn(
            `⚠️  第 ${i + 2} 行：碳足跡數值為 0 或無法解析，跳過`
          );
          errorCount++;
          continue;
        }
        
        // 建立資料
        const carbonLabel = await prisma.carbonLabel.create({
          data: {
            // 基本產品資訊
            productType: cleanString(row["產品類型"]),
            productName: productName,
            productModel: cleanString(row["產品型號"]),
            
            // 證書資訊
            status: cleanString(row["狀態"]),
            
            // 公司資訊
            companyName: cleanString(
              row["公司/團體名稱"] || row["公司關體名稱"] || row["公司名稱"]
            ),
            uniformNumber: cleanString(
              row["統一編號/農畜牧登字"] || row["統一編號"]
            ),
            
            // 碳足跡數據
            carbonFootprintValue: carbonFootprint.value,
            carbonFootprintUnit: carbonFootprint.unit,
            declarationUnit: cleanString(row["宣告單位"]),
          },
        });
        
        successCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`✅ 已處理 ${i + 1}/${data.length} 筆...`);
        }
      } catch (error) {
        console.error(`❌ 第 ${i + 2} 行處理失敗:`, error);
        errorCount++;
      }
    }
    
    console.log("\n==========================================");
    console.log("匯入完成！");
    console.log(`✅ 成功: ${successCount} 筆`);
    console.log(`❌ 失敗: ${errorCount} 筆`);
    console.log("==========================================");
  } catch (error) {
    console.error("❌ 匯入過程發生錯誤:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 執行匯入
importCarbonLabels();

