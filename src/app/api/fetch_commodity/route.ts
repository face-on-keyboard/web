// Fetch Commodity from invoice
import { type NextRequest, NextResponse } from 'next/server'
import {
  queryInvoice,
  formatInvoiceResponse,
  validateRequestParams,
} from '../../../../mock/index'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const invNum = searchParams.get('invNum')

    if (!invNum) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少必要參數：invNum',
        },
        { status: 400 }
      )
    }

    // 驗證需求參數
    const validatedData = validateRequestParams({ invNum })

    // 查詢發票資料
    const invoice = await queryInvoice(validatedData)

    // 格式化回應
    const response = formatInvoiceResponse(invoice)

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    // 參數驗證錯誤
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          message: `參數錯誤：${error.message}`,
        },
        { status: 400 }
      )
    }

    // 其他錯誤
    console.error('API Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '系統錯誤',
        error: error instanceof Error ? error.message : '未知錯誤',
      },
      { status: 500 }
    )
  }
}
