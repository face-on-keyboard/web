import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  queryInvoice,
  formatInvoiceResponse,
  validateRequestParams,
} from "../../../../mock/index";
import { calculateProductCarbonFootprint } from "./calculate";

// 請求參數驗證 Schema
const requestSchema = z.object({
  invNum: z.string().min(1, "發票號碼不能為空"),
});

// 調用內部 API 獲取發票資料
async function fetchInvoiceData(invNum: string) {
  // 直接調用函數，不通過 HTTP
  const invoiceParams = validateRequestParams({ invNum });
  const invoice = await queryInvoice(invoiceParams);
  return formatInvoiceResponse(invoice);
}

// 處理發票商品並計算碳足跡
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invNum = searchParams.get("invNum");

    if (!invNum) {
      return NextResponse.json(
        {
          success: false,
          message: "缺少必要參數：invNum",
        },
        { status: 400 }
      );
    }

    // 驗證參數
    const validatedData = requestSchema.parse({ invNum });

    // 1. 調用發票 API 獲取發票資料
    const invoiceData = await fetchInvoiceData(validatedData.invNum);

    // 檢查是否找到發票
    if (
      invoiceData.code === "404" ||
      !invoiceData.details ||
      invoiceData.details.length === 0
    ) {
      return NextResponse.json(
        {
          invNum: validatedData.invNum,
          items: [],
        },
        { status: 200 }
      );
    }

    // 2. 提取商品資訊（details.description 和 details.quantity）
    const items = invoiceData.details.map(
      (detail: {
        rowNum: string;
        description: string;
        quantity: string;
        unitPrice: string;
        amount: string;
      }) => ({
        rowNum: detail.rowNum,
        productName: detail.description,
        quantity: parseFloat(detail.quantity),
      })
    );

    // 3. 對每個商品調用碳足跡計算函數
    const itemsWithCarbon = await Promise.all(
      items.map(
        async (item: {
          rowNum: string;
          productName: string;
          quantity: number;
        }) => {
          try {
            const carbonResult = await calculateProductCarbonFootprint(
              item.productName,
              item.quantity
            );

            // 從計算結果中提取需要的資料
            if (carbonResult.success && carbonResult.data) {
              return {
                productName: item.productName,
                quantity: item.quantity,
                carbonFootprint: carbonResult.data.carbonFootprint || null,
                carbonFootprintUnit:
                  carbonResult.data.carbonFootprintUnit || null,
                matchedProduct: carbonResult.data.matchedProduct || null,
              };
            } else {
              // 如果計算失敗，仍然返回商品資訊，但碳足跡為 null
              return {
                productName: item.productName,
                quantity: item.quantity,
                carbonFootprint: null,
                carbonFootprintUnit: null,
                matchedProduct: null,
              };
            }
          } catch (error) {
            // 計算碳足跡時發生錯誤，返回商品資訊但碳足跡為 null
            console.error(
              `計算商品 "${item.productName}" 碳足跡時發生錯誤:`,
              error
            );
            return {
              productName: item.productName,
              quantity: item.quantity,
              carbonFootprint: null,
              carbonFootprintUnit: null,
              matchedProduct: null,
            };
          }
        }
      )
    );

    // 4. 構建回應（只包含 invNum 和 items）
    return NextResponse.json(
      {
        invNum: validatedData.invNum,
        items: itemsWithCarbon,
      },
      { status: 200 }
    );
  } catch (error) {
    // 參數驗證錯誤
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "參數驗證失敗",
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // 其他錯誤
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "系統錯誤",
        error: error instanceof Error ? error.message : "未知錯誤",
      },
      { status: 500 }
    );
  }
}
