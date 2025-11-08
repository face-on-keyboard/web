import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { compareTwoStrings } from "string-similarity";

// 請求參數驗證 Schema
const requestSchema = z.object({
  productName: z.string().min(1, "商品名稱不能為空"), // 商品名稱
  quantity: z.number().positive("數量必須大於 0"), // 商品數量
});

// 計算字串相似度（使用多種策略）
function calculateSimilarity(
  input: string,
  target: string
): { score: number; method: string } {
  const inputLower = input.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();

  // 1. 精確匹配
  if (inputLower === targetLower) {
    return { score: 1.0, method: "exact" };
  }

  // 2. 包含匹配（input 包含在 target 中，或相反）
  if (targetLower.includes(inputLower) || inputLower.includes(targetLower)) {
    const longer =
      inputLower.length > targetLower.length ? inputLower : targetLower;
    const shorter =
      inputLower.length > targetLower.length ? targetLower : inputLower;
    return {
      score: 0.8 + (shorter.length / longer.length) * 0.2,
      method: "contains",
    };
  }

  // 3. 使用 Dice 係數（bigram 相似度）
  const diceScore = compareTwoStrings(inputLower, targetLower);
  if (diceScore > 0.6) {
    return { score: diceScore, method: "dice" };
  }

  // 4. 部分詞匹配（檢查是否有共同詞）
  const inputWords = inputLower.split(/\s+/);
  const targetWords = targetLower.split(/\s+/);
  const commonWords = inputWords.filter((word) =>
    targetWords.some((tw) => tw.includes(word) || word.includes(tw))
  );
  if (commonWords.length > 0) {
    const wordScore =
      commonWords.length / Math.max(inputWords.length, targetWords.length);
    return { score: wordScore * 0.7, method: "word_match" };
  }

  return { score: diceScore, method: "dice" };
}

// 查找最匹配的碳標籤產品
async function findBestMatch(productName: string) {
  // 先嘗試精確匹配或包含匹配
  // 查詢 status 不是 '過期' 的記錄（包括 null）
  const exactMatches = await db.carbonLabel.findMany({
    where: {
      productName: {
        contains: productName,
        mode: "insensitive",
      },
      OR: [{ status: null }, { status: { not: "過期" } }],
    },
    take: 10,
  });

  if (exactMatches.length > 0) {
    // 計算相似度並排序
    const matchesWithScore = exactMatches.map((match) => ({
      ...match,
      similarity: calculateSimilarity(productName, match.productName),
    }));

    matchesWithScore.sort((a, b) => b.similarity.score - a.similarity.score);

    return matchesWithScore[0];
  }

  // 如果沒有找到包含匹配，查詢所有有效的碳標籤並計算相似度
  const allLabels = await db.carbonLabel.findMany({
    where: {
      OR: [{ status: null }, { status: { not: "過期" } }],
    },
    take: 100, // 限制查詢數量以提高效能
  });

  if (allLabels.length === 0) {
    return null;
  }

  // 計算所有產品的相似度
  const matchesWithScore = allLabels.map((label) => ({
    ...label,
    similarity: calculateSimilarity(productName, label.productName),
  }));

  // 過濾相似度低於 0.3 的結果
  const filteredMatches = matchesWithScore.filter(
    (m) => m.similarity.score >= 0.3
  );

  if (filteredMatches.length === 0) {
    return null;
  }

  // 按相似度排序，返回最佳匹配
  filteredMatches.sort((a, b) => b.similarity.score - a.similarity.score);

  return filteredMatches[0];
}

// 計算碳足跡
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 驗證請求參數
    const validatedData = requestSchema.parse(body);

    const { productName, quantity } = validatedData;

    // 查找匹配的碳標籤
    const match = await findBestMatch(productName);

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          message: "找不到匹配的碳標籤產品",
          data: {
            productName,
            quantity,
            carbonFootprint: null,
            matchedProduct: null,
            similarity: null,
          },
        },
        { status: 200 }
      );
    }

    // 計算碳足跡 = 碳足跡數值 * 數量
    const carbonFootprintValue = Number(match.carbonFootprintValue);
    const totalCarbonFootprint = carbonFootprintValue * quantity;

    return NextResponse.json(
      {
        success: true,
        message: "計算成功",
        data: {
          productName,
          quantity,
          carbonFootprint: Number(totalCarbonFootprint.toFixed(4)),
          carbonFootprintUnit: match.carbonFootprintUnit || "kg",
          matchedProduct: {
            id: match.id,
            productName: match.productName,
            productModel: match.productModel,
            carbonFootprintValue: Number(carbonFootprintValue),
            carbonFootprintUnit: match.carbonFootprintUnit,
            declarationUnit: match.declarationUnit,
            companyName: match.companyName,
          },
          similarity: {
            score: match.similarity.score,
            method: match.similarity.method,
          },
        },
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
    console.error("計算碳足跡時發生錯誤:", error);
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

// 支援 GET 請求（用於測試）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productName = searchParams.get("productName");
  const quantity = searchParams.get("quantity");

  if (!productName || !quantity) {
    return NextResponse.json(
      {
        success: false,
        message: "缺少必要參數：productName 和 quantity",
      },
      { status: 400 }
    );
  }

  try {
    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "quantity 必須是正數",
        },
        { status: 400 }
      );
    }

    // 使用 POST 邏輯
    const match = await findBestMatch(productName);

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          message: "找不到匹配的碳標籤產品",
          data: {
            productName,
            quantity: quantityNum,
            carbonFootprint: null,
            matchedProduct: null,
            similarity: null,
          },
        },
        { status: 200 }
      );
    }

    const carbonFootprintValue = Number(match.carbonFootprintValue);
    const totalCarbonFootprint = carbonFootprintValue * quantityNum;

    return NextResponse.json(
      {
        success: true,
        message: "計算成功",
        data: {
          productName,
          quantity: quantityNum,
          carbonFootprint: Number(totalCarbonFootprint.toFixed(4)),
          carbonFootprintUnit: match.carbonFootprintUnit || "kg",
          matchedProduct: {
            id: match.id,
            productName: match.productName,
            productModel: match.productModel,
            carbonFootprintValue: Number(carbonFootprintValue),
            carbonFootprintUnit: match.carbonFootprintUnit,
            declarationUnit: match.declarationUnit,
            companyName: match.companyName,
          },
          similarity: {
            score: match.similarity.score,
            method: match.similarity.method,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("計算碳足跡時發生錯誤:", error);
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
