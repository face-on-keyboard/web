import { PrismaClient } from "@prisma/client";
import { z } from "zod";

// 創建 Prisma 客戶端實例
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

const db = prisma;

// 需求參數驗證 Schema
// 只有 invNum 是必填，其他都是選填
const requestSchema = z.object({
  invNum: z.string(), // 發票號碼 (必填)
  version: z.string().optional(), // 版本號碼 (選填)
  cardType: z.string().optional(), // 卡別 (選填)
  cardNo: z.string().optional(), // 手機條碼/卡片(載具)隱碼 (選填)
  expTimeStamp: z.string().optional(), // 有效期限時間戳記 (選填)
  action: z.string().optional(), // API 動作 (選填)
  timeStamp: z.string().optional(), // 時間戳記 (選填)
  invDate: z
    .string()
    .regex(/^\d{4}\/\d{2}\/\d{2}$/)
    .optional(), // 發票日期 yyyy/MM/dd (選填)
  uuid: z.string().optional(), // 手機工具唯一識別碼 (選填)
  sellerName: z.string().optional(), // 開立賣方名稱 (選填)
  amount: z.string().optional(), // 金額 (選填)
  appID: z.string().optional(), // 應用程式帳號 (選填)
  cardEncrypt: z.string().optional(), // 手機條碼驗證碼/卡片(載具)驗證碼 (選填)
});

// 查詢發票資料
export async function queryInvoice(params: z.infer<typeof requestSchema>) {
  try {
    // 構建查詢條件 - 只有 invNum 是必填
    const where: {
      invNum: string;
      invDate?: Date;
      sellerName?: string;
      amount?: { equals: number };
    } = {
      invNum: params.invNum,
    };

    // 如果提供了 invDate，加入查詢條件
    if (params.invDate) {
      const dateParts = params.invDate.split("/");
      if (dateParts.length === 3) {
        const year = Number.parseInt(dateParts[0]!, 10);
        const month = Number.parseInt(dateParts[1]!, 10);
        const day = Number.parseInt(dateParts[2]!, 10);
        where.invDate = new Date(year, month - 1, day);
      }
    }

    // 如果提供了 sellerName，加入查詢條件
    if (params.sellerName) {
      where.sellerName = params.sellerName;
    }

    // 如果提供了 amount，加入查詢條件
    if (params.amount) {
      where.amount = { equals: parseFloat(params.amount) };
    }

    // 查詢資料庫
    const invoice = await db.invoice.findFirst({
      where,
      include: {
        details: {
          orderBy: {
            rowNum: "asc",
          },
        },
      },
    });

    return invoice;
  } catch (error) {
    console.error("查詢發票時發生錯誤:", error);
    throw error;
  }
}

// 格式化發票資料為 API 回應格式
export function formatInvoiceResponse(
  invoice: {
    v: string | null;
    code: string | null;
    msg: string | null;
    invNum: string;
    invDate: Date | null;
    sellerName: string | null;
    amount: any | null; // Decimal type from Prisma
    invStatus: string | null;
    invPeriod: string | null;
    sellerBan: string | null;
    sellerAddress: string | null;
    invoiceTime: string | null;
    buyerBan: string | null;
    currency: string | null;
    details: Array<{
      rowNum: number;
      description: string;
      quantity: any; // Decimal type
      unitPrice: any; // Decimal type
      amount: any; // Decimal type
    }>;
  } | null
) {
  // 如果找不到發票，回傳空資料格式
  if (!invoice) {
    return {
      v: "0.5",
      code: "404",
      msg: "查無發票資料",
      invNum: "",
      invDate: "",
      sellerName: "",
      amount: "0",
      invStatus: "",
      invPeriod: "",
      sellerBan: "",
      sellerAddress: "",
      invoiceTime: "",
      buyerBan: "",
      currency: "",
      details: [],
    };
  }

  // 格式化日期為 yyyyMMdd（如果 invDate 存在）
  const formattedDate = invoice.invDate
    ? invoice.invDate.toISOString().slice(0, 10).replace(/-/g, "")
    : "";

  // 構建回應 JSON（處理所有可能為 null 的欄位）
  return {
    v: invoice.v ?? "0.5",
    code: invoice.code ?? "200",
    msg: invoice.msg ?? "成功",
    invNum: invoice.invNum,
    invDate: formattedDate,
    sellerName: invoice.sellerName ?? "",
    amount: invoice.amount ? invoice.amount.toString() : "0",
    invStatus: invoice.invStatus ?? "",
    invPeriod: invoice.invPeriod ?? "",
    sellerBan: invoice.sellerBan ?? "",
    sellerAddress: invoice.sellerAddress ?? "",
    invoiceTime: invoice.invoiceTime ?? "",
    buyerBan: invoice.buyerBan ?? "",
    currency: invoice.currency ?? "",
    details: invoice.details.map((detail) => ({
      rowNum: detail.rowNum.toString(),
      description: detail.description,
      quantity: detail.quantity.toString(),
      unitPrice: detail.unitPrice.toString(),
      amount: detail.amount.toString(),
    })),
  };
}

// 驗證請求參數
export function validateRequestParams(body: unknown) {
  return requestSchema.parse(body);
}

// === 測試呼叫 ===
async function main() {
  // 模擬一個 API 請求
  const testParams = {
    invNum: "VG76240738",
  };

  try {
    console.log("🔍 開始查詢發票...");
    const validated = validateRequestParams(testParams);
    const invoice = await queryInvoice(validated);
    const response = formatInvoiceResponse(invoice);
    console.log("✅ 查詢結果：");
    console.dir(response, { depth: null });
  } catch (err) {
    console.error("❌ 查詢失敗：", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
